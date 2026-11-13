#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Инструмент для создания валидного JSON решения органа без записи файлов.

Этот инструмент используется subagents для генерации решений, которые затем
возвращаются центральному движку (НЕ записываются в файлы самими агентами!).

Центральный движок собирает все JSON'ы от subagents, валидирует их и выполняет
batch save в engine/turnDecisions/turn_<NN>/ только после успешной валидации всех решений.

ИСПОЛЬЗОВАНИЕ:
    # Для конкретного органа
    python3 tools/create_decision_json.py --organ rdc --turn 1
    
    # С загрузкой контекста
    python3 tools/create_decision_json.py --organ rdc --turn 1 --context context.json
    
    # Валидация существующего JSON
    python3 tools/create_decision_json.py --validate decision.json

В DSH WORKFLOW:
    Subagent вызывает этот скрипт для проверки своего решения перед возвратом
    центральному движку. Решение остаётся в памяти subagent'а до Фазы 3.
"""

import json
import pathlib
import re
import sys
import argparse
from typing import Optional, Dict, Any
from datetime import datetime


def camel_to_kebab(name: str) -> str:
    """Convert camelCase/PascalCase to kebab-case.
    
    Examples:
        publicStatement -> public-statement
        stanceOnOffer -> stance-on-offer
        llmNotes -> llm-notes
        capitalSpent -> capital-spent
        internalUnity -> internal-unity
    """
    # Insert hyphen before uppercase letters that follow lowercase letters or digits
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name)
    # Handle consecutive uppercase followed by lowercase (e.g., "LLM" + "Notes" -> "llm-notes")
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1-\2', s)
    return s.lower().replace('_', '-')


def kebab_to_camel(name: str) -> str:
    """Convert kebab-case back to camelCase for dict key lookup.
    
    This is NOT a perfect inverse of camel_to_kebab for all cases,
    but works for our known schema fields since we match against
    actual schema field names in build_input_from_args.
    """
    parts = name.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTEXT_FILE = ROOT.parent / "dashboard" / "public" / "context.json"

# Схемы решений для каждого органа
ORGAN_SCHEMAS = {
    "rdc": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions", 
            "negotiation", "stanceOnOffer", "strikeAction", 
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "stanceOnOffer": dict,
            "strikeAction": dict,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "rdc",
            "publicStatement": "Мы требуем восстановления зарплат до уровня 2008 года.",
            "actions": [
                "Встреча с DHSC по вопросу оферты",
                "Пикеты у больниц Лондона"
            ],
            "negotiation": {
                "talksWith": ["dhsc"],
                "offer": "Рассмотрим увеличение мест ординатуры",
                "demand": "Pay restoration +20%",
                "redLine": "Не примем оферту без конкретных мест"
            },
            "stanceOnOffer": {
                "recommendation": "reject",
                "reason": "Оферта не обеспечивает pay restoration",
                "baseReaction": "База поддерживает отказ"
            },
            "strikeAction": {
                "status": "proceed",
                "daysAffected": 4,
                "derogationLevel": "Emergency care only"
            },
            "capitalSpent": 15,
            "llmNotes": "RDC сохраняет жёсткую позицию, но готов к диалогу при реальных уступках"
        }
    },
    "bma_council": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions",
            "negotiation", "stanceOnOffer", "internalUnity",
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "stanceOnOffer": dict,
            "internalUnity": str,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "bma_council",
            "publicStatement": "BMA Council поддерживает решение RDC о забастовке.",
            "actions": [
                "Созыв экстренного заседания совета",
                "Консультации с лидерами грейдов"
            ],
            "negotiation": {
                "talksWith": ["rdc", "dhsc"],
                "offer": "Поддержка позиции RDC",
                "demand": "Единство профсоюза",
                "redLine": "Не допустим раскола между грейдами"
            },
            "stanceOnOffer": {
                "recommendation": "no_recommendation",
                "reason": "Совет наблюдает за переговорами RDC",
                "baseReaction": "Члены ожидают прогресса"
            },
            "internalUnity": "stable",
            "capitalSpent": 10,
            "llmNotes": "BMA Council балансирует между поддержкой RDC и давлением со стороны умеренных членов"
        }
    },
    "dhsc": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions",
            "negotiation", "offerDetails", "budgetConstraints",
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "offerDetails": dict,
            "budgetConstraints": dict,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "dhsc",
            "publicStatement": "Министр Мюррей подтверждает приверженность переговорному процессу.",
            "actions": [
                "Закрытая встреча с HMT по бюджетным лимитам",
                "Подготовка новой оферты с увеличением мест"
            ],
            "negotiation": {
                "talksWith": ["rdc", "hmt"],
                "offer": "Увеличение мест ординатуры до 4500",
                "demand": "Приостановка забастовки 15-19 июня",
                "redLine": "Бюджетный лимит Казначейства непреодолим"
            },
            "offerDetails": {
                "avgPayIncrease": 5.5,
                "trainingPlaces": 4500,
                "examFeesCompensated": True,
                "payRestorationProgress": "Структурные реформы вместо прямого повышения"
            },
            "budgetConstraints": {
                "maxBudgetImpact": "£500M annually",
                "treasuryApproval": "pending"
            },
            "capitalSpent": 20,
            "llmNotes": "DHSC пытается балансировать между требованиями врачей и ограничениями HMT"
        }
    },
    "hmt": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions",
            "negotiation", "fiscalPosition", "approvalStatus",
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "fiscalPosition": dict,
            "approvalStatus": str,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "hmt",
            "publicStatement": "Казначейство рассматривает запрос DHSC в рамках бюджетных ограничений.",
            "actions": [
                "Анализ фискального воздействия предложения DHSC",
                "Консультации с министром финансов"
            ],
            "negotiation": {
                "talksWith": ["dhsc"],
                "offer": "Ограниченное увеличение бюджета при структурных реформах",
                "demand": "Доказательства долгосрочной экономии",
                "redLine": "Превышение бюджетного лимита невозможно"
            },
            "fiscalPosition": {
                "availableBudget": "£600M",
                "priorityAreas": ["NHS staffing", "Infrastructure"],
                "constraints": "Overall fiscal consolidation target"
            },
            "approvalStatus": "conditional",
            "capitalSpent": 5,
            "llmNotes": "HMT требует чётких доказательств ROI от любых дополнительных расходов на зарплаты"
        }
    },
    "providers": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions",
            "negotiation", "operationalImpact", "contingencyPlans",
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "operationalImpact": dict,
            "contingencyPlans": list,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "providers",
            "publicStatement": "NHS Providers предупреждает о критическом влиянии забастовки на пациентов.",
            "actions": [
                "Активация планов чрезвычайного покрытия",
                "Переговоры с locum агентствами"
            ],
            "negotiation": {
                "talksWith": ["dhsc", "rdc"],
                "offer": "Готовность покрыть экстренные случаи",
                "demand": "Минимизация disruption для пациентов",
                "redLine": "Полная остановка служб недопустима"
            },
            "operationalImpact": {
                "estimatedCancellations": 50000,
                "locumCosts": "£15M per day",
                "emergencyCoverage": "70%"
            },
            "contingencyPlans": [
                "Перераспределение консультантов на экстренные отделения",
                "Отмена плановых операций на период забастовки"
            ],
            "capitalSpent": 12,
            "llmNotes": "Providers под двойным давлением: пациенты vs врачи"
        }
    },
    "aomrc": {
        "required_fields": [
            "turn", "agentName", "publicStatement", "actions",
            "negotiation", "expertAssessment", "recommendations",
            "capitalSpent", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "publicStatement": str,
            "actions": list,
            "negotiation": dict,
            "expertAssessment": dict,
            "recommendations": list,
            "capitalSpent": int,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "aomrc",
            "publicStatement": "AoMRC призывает к конструктивному диалогу ради будущего медицины.",
            "actions": [
                "Экспертная оценка предложений по местам ординатуры",
                "Консультации с королевскими колледжами"
            ],
            "negotiation": {
                "talksWith": ["rdc", "dhsc"],
                "offer": "Экспертная поддержка реформ обучения",
                "demand": "Сохранение качества подготовки",
                "redLine": "Быстрое расширение без контроля качества неприемлемо"
            },
            "expertAssessment": {
                "currentTrainingQuality": "high",
                "expansionFeasibility": "moderate with safeguards",
                "recommendedPlaces": 4200
            },
            "recommendations": [
                "Поэтапное увеличение мест с мониторингом качества",
                "Дополнительное финансирование супервизоров"
            ],
            "capitalSpent": 8,
            "llmNotes": "AoMRC занимает нейтральную экспертную позицию, фокусируясь на качестве обучения"
        }
    },
    "ddrb": {
        "required_fields": [
            "turn", "agentName", "recommendation", "analysis",
            "fiscalContext", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "recommendation": dict,
            "analysis": str,
            "fiscalContext": dict,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "ddrb",
            "recommendation": {
                "avgPayIncrease": 3.5,
                "effectiveDate": "2026-04-01",
                "rationale": "Баланс между конкурентоспособностью и фискальной ответственностью"
            },
            "analysis": "DDRB рекомендует умеренное повышение с учётом инфляции и бюджетных ограничений",
            "fiscalContext": {
                "inflationRate": 2.8,
                "recruitmentRetention": "challenging",
                "affordability": "within treasury limits"
            },
            "llmNotes": "DDRB придерживается независимой экспертной позиции, основанной на данных рынка труда"
        }
    },
    "base": {
        "required_fields": [
            "turn", "agentName", "sentiment", "unityLevel",
            "keyConcerns", "referendumProjection", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "sentiment": str,
            "unityLevel": int,
            "keyConcerns": list,
            "referendumProjection": dict,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "base",
            "sentiment": "frustrated_but_determined",
            "unityLevel": 78,
            "keyConcerns": [
                "Pay restoration to 2008 levels",
                "Working conditions and burnout",
                "Exam fees burden"
            ],
            "referendumProjection": {
                "projectedYes": 45,
                "projectedTurnout": 65,
                "passes": False,
                "keyFactor": "Current offer insufficient for pay restoration"
            },
            "llmNotes": "База расколота: FY1/FY2 более умеренны, ST6-ST8 и LED радикальны"
        }
    },
    "press": {
        "required_fields": [
            "turn", "agentName", "headline", "articles",
            "socialMediaPosts", "publicSentiment", "llmNotes"
        ],
        "field_types": {
            "turn": int,
            "agentName": str,
            "headline": str,
            "articles": list,
            "socialMediaPosts": list,
            "publicSentiment": str,
            "llmNotes": str,
        },
        "example": {
            "turn": 1,
            "agentName": "press",
            "headline": "Врачи NHS объявили четырёхдневную забастовку на июнь",
            "articles": [
                {
                    "source": "The Guardian",
                    "title": "Junior doctors strike threatens summer healthcare",
                    "tone": "sympathetic_to_doctors",
                    "excerpt": "Doctors argue pay has fallen 20% since 2008..."
                }
            ],
            "socialMediaPosts": [
                {
                    "platform": "Twitter",
                    "content": "Support our NHS doctors! #JuniorDoctorsStrike",
                    "engagement": 15000,
                    "sentiment": "positive"
                }
            ],
            "publicSentiment": "mixed_but_shifting_towards_doctors",
            "llmNotes": "Медиа фокусируется на пациентах, но растёт понимание позиции врачей"
        }
    }
}


def load_context(context_path: Optional[pathlib.Path] = None) -> Dict[str, Any]:
    """Загрузить контекст игры."""
    path = context_path or CONTEXT_FILE
    if not path.exists():
        print(f"⚠️ Context file not found: {path}")
        print("   Создаём пустой контекст...")
        return {}
    
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_organ_schema(organ_id: str) -> Optional[Dict]:
    """Получить схему для конкретного органа."""
    return ORGAN_SCHEMAS.get(organ_id)


def validate_decision(decision: Dict, organ_id: str) -> tuple[bool, list[str]]:
    """
    Валидировать решение органа.
    
    Returns:
        (is_valid, errors)
    """
    schema = get_organ_schema(organ_id)
    if not schema:
        return False, [f"Unknown organ: {organ_id}"]
    
    errors = []
    
    # Проверка обязательных полей
    for field in schema["required_fields"]:
        if field not in decision:
            errors.append(f"Missing required field: {field}")
    
    # Проверка типов данных
    for field, expected_type in schema.get("field_types", {}).items():
        if field in decision:
            value = decision[field]
            if not isinstance(value, expected_type):
                errors.append(
                    f"Field '{field}' has wrong type: "
                    f"expected {expected_type.__name__}, got {type(value).__name__}"
                )
    
    # Специфические проверки
    if "capitalSpent" in decision:
        if not (0 <= decision["capitalSpent"] <= 100):
            errors.append("capitalSpent must be between 0 and 100")
    
    if "turn" in decision:
        if not (1 <= decision["turn"] <= 5):
            errors.append("turn must be between 1 and 5")
    
    is_valid = len(errors) == 0
    return is_valid, errors


def create_template(organ_id: str, turn: int) -> Dict:
    """Создать шаблон решения для органа."""
    schema = get_organ_schema(organ_id)
    if not schema:
        raise ValueError(f"Unknown organ: {organ_id}")
    
    template = schema["example"].copy()
    template["turn"] = turn
    template["agentName"] = organ_id
    
    return template


def create_decision_from_input(
    organ_id: str,
    turn: int,
    input_data: Dict,
    context: Optional[Dict] = None
) -> Dict:
    """
    Создать решение из входных данных пользователя.
    
    Args:
        organ_id: ID органа
        turn: Номер раунда
        input_data: Данные от пользователя (может быть частичным)
        context: Контекст игры (опционально)
    
    Returns:
        Валидированное решение
    """
    # Начинаем с шаблона
    decision = create_template(organ_id, turn)
    
    # Обновляем пользовательскими данными
    decision.update(input_data)
    
    # Гарантируем правильные значения
    decision["turn"] = turn
    decision["agentName"] = organ_id
    
    return decision


def format_output(decision: Dict, pretty: bool = True) -> str:
    """Форматировать решение для вывода."""
    if pretty:
        return json.dumps(decision, ensure_ascii=False, indent=2)
    else:
        return json.dumps(decision, ensure_ascii=False)


def parse_cli_value(value: str) -> Any:
    """
    Парсить строковое значение CLI в подходящий Python тип.
    
    Поддерживает:
      - JSON-объекты и массивы: '{"key": "val"}', '["a", "b"]'
      - Булевы: true/false
      - Числа: 42, 3.14
      - Строки: всё остальное
    """
    if value.lower() in ("true", "false"):
        return value.lower() == "true"
    
    # Пробуем распарсить как JSON (для dict/list)
    try:
        parsed = json.loads(value)
        if isinstance(parsed, (dict, list)):
            return parsed
        # Если это число из JSON, тоже принимаем
        if isinstance(parsed, (int, float)):
            return parsed
    except (json.JSONDecodeError, ValueError):
        pass
    
    # Пробуем как число
    try:
        if "." in value:
            return float(value)
        return int(value)
    except ValueError:
        pass
    
    return value


def build_input_from_args(args, organ_id: str) -> Dict[str, Any]:
    """
    Собрать input_data из CLI-флагов на основе схемы органа.
    
    Каждый флаг имеет формат --kebab-case (e.g. --stance-on-offer).
    Значения парсятся автоматически через parse_cli_value.
    """
    schema = get_organ_schema(organ_id)
    if not schema:
        return {}
    
    input_data = {}
    
    for field in schema["required_fields"]:
        # Пропускаем turn и agentName — они задаются отдельными флагами
        if field in ("turn", "agentName"):
            continue
        
        # Конвертируем camelCase в kebab-case: stanceOnOffer -> stance-on-offer
        kebab = camel_to_kebab(field)
        # argparse заменяет '-' на '_' в dest: stance-on-offer -> stance_on_offer
        attr_name = kebab.replace("-", "_")
        
        value = getattr(args, attr_name, None)
        if value is not None:
            input_data[field] = parse_cli_value(value)
    
    return input_data


def add_field_arguments(parser: argparse.ArgumentParser) -> None:
    """
    Добавить аргументы для всех полей всех схем органов.
    
    Флаги используют kebab-case: --public-statement, --stance-on-offer, etc.
    Все аргументы опциональны; отсутствующие поля берутся из шаблона.
    """
    group = parser.add_argument_group(
        "Поля решения (CLI-режим)",
        "Задайте значения полей напрямую из командной строки. "
        "JSON-значения передаются строкой: --actions '[\"действие 1\", \"действие 2\"]'. "
        "Отсутствующие поля заполняются из шаблона органа."
    )
    
    # Собираем уникальные поля из всех схем
    seen = set()
    for organ_id, schema in ORGAN_SCHEMAS.items():
        for field in schema["required_fields"]:
            if field in ("turn", "agentName"):
                continue
            if field in seen:
                continue
            seen.add(field)
            
            cli_flag = f"--{camel_to_kebab(field)}"
            expected_type = schema["field_types"].get(field)
            type_hint = ""
            if expected_type == list:
                type_hint = " (JSON array, e.g. '[\"a\", \"b\"]')"
            elif expected_type == dict:
                type_hint = " (JSON object, e.g. '{\"key\": \"val\"}')"
            elif expected_type == int:
                type_hint = " (integer)"
            elif expected_type == str:
                type_hint = " (string)"
            
            group.add_argument(
                cli_flag,
                type=str,
                default=None,
                metavar="VALUE",
                help=f"{field}{type_hint}"
            )


def main():
    parser = argparse.ArgumentParser(
        description="Создание валидного JSON решения органа (без записи файлов)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
ПРИМЕРЫ:
  # Создать шаблон для RDC, раунд 1
  python3 create_decision_json.py --organ rdc --turn 1
  
  # Создать решение полностью из CLI (без JSON-файла)
  python3 create_decision_json.py --organ rdc --turn 1 \\
    --public-statement "Мы требуем восстановления зарплат" \\
    --actions '["Встреча с DHSC", "Пикеты у больниц"]' \\
    --negotiation '{"talksWith": ["dhsc"], "offer": "Рассмотрим увеличение мест"}' \\
    --stance-on-offer '{"recommendation": "reject", "reason": "Недостаточно"}' \\
    --strike-action '{"status": "proceed", "daysAffected": 4}' \\
    --capital-spent 15 \\
    --llm-notes "RDC сохраняет жёсткую позицию"
  
  # Создать решение с пользовательскими данными из файла
  python3 create_decision_json.py --organ dhsc --turn 2 --input my_decision.json
  
  # Переопределить отдельные поля из файла
  python3 create_decision_json.py --organ dhsc --turn 2 --input base.json --capital-spent 25
  
  # Валидировать существующий файл
  python3 create_decision_json.py --validate decision.json
  
  # Интерактивный режим
  python3 create_decision_json.py --interactive --organ bma_council --turn 1
  
  # Показать все доступные поля для органа
  python3 create_decision_json.py --organ rdc --turn 1 --show-fields
        """
    )
    
    parser.add_argument("--organ", type=str, help="ID органа (rdc, dhsc, hmt, etc.)")
    parser.add_argument("--turn", type=int, help="Номер раунда (1-5)")
    parser.add_argument("--input", type=str, help="Путь к файлу с входными данными JSON")
    parser.add_argument("--validate", type=str, help="Путь к файлу для валидации")
    parser.add_argument("--context", type=str, help="Путь к context.json")
    parser.add_argument("--interactive", action="store_true", help="Интерактивный режим")
    parser.add_argument("--compact", action="store_true", help="Компактный вывод (без отступов)")
    parser.add_argument("--list-organs", action="store_true", help="Список доступных органов")
    parser.add_argument("--json-only", action="store_true", help="Только JSON без заголовков (для pipe)")
    parser.add_argument("--show-fields", action="store_true", 
                        help="Показать все поля органа и их типы, затем выйти")
    
    # Добавляем аргументы для всех полей схем
    add_field_arguments(parser)
    
    args = parser.parse_args()
    
    # Список органов
    if args.list_organs:
        print("\n📋 Доступные органы:")
        for organ_id in sorted(ORGAN_SCHEMAS.keys()):
            schema = ORGAN_SCHEMAS[organ_id]
            print(f"  • {organ_id:15} - {len(schema['required_fields'])} полей")
        print()
        return
    
    # Показать поля органа
    if args.show_fields:
        if not args.organ:
            print("❌ --show-fields требует --organ")
            sys.exit(1)
        schema = get_organ_schema(args.organ)
        if not schema:
            print(f"❌ Неизвестный орган: {args.organ}")
            sys.exit(1)
        
        print(f"\n📋 Поля для органа '{args.organ}':")
        print("=" * 60)
        for field in schema["required_fields"]:
            if field in ("turn", "agentName"):
                continue
            expected_type = schema["field_types"].get(field, Any)
            type_name = expected_type.__name__ if hasattr(expected_type, "__name__") else str(expected_type)
            cli_flag = f"--{camel_to_kebab(field)}"
            example_val = schema["example"].get(field, "...")
            # Форматируем пример компактно
            if isinstance(example_val, (dict, list)):
                example_str = json.dumps(example_val, ensure_ascii=False)
                if len(example_str) > 70:
                    example_str = example_str[:67] + "..."
            else:
                example_str = str(example_val)
            print(f"  {cli_flag:30} ({type_name:6})  e.g. {example_str}")
        print("=" * 60)
        print("\n💡 Используйте эти флаги вместо --input для создания решения из CLI.")
        print("   JSON-значения передаются строкой: --actions '[\"a\", \"b\"]'")
        print()
        return
    
    # Валидация файла
    if args.validate:
        validate_path = pathlib.Path(args.validate)
        if not validate_path.exists():
            print(f"❌ File not found: {validate_path}")
            sys.exit(1)
        
        with open(validate_path, "r", encoding="utf-8") as f:
            try:
                decision = json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON: {e}")
                sys.exit(1)
        
        organ_id = decision.get("agentName", "unknown")
        is_valid, errors = validate_decision(decision, organ_id)
        
        if is_valid:
            print(f"✅ Valid decision for {organ_id}")
            print(f"   Turn: {decision.get('turn', 'N/A')}")
        else:
            print(f"❌ Validation failed for {organ_id}:")
            for error in errors:
                print(f"   • {error}")
            sys.exit(1)
        
        return
    
    # Основной режим: создание решения
    if not args.organ:
        print("❌ Required: --organ")
        sys.exit(1)
    
    if not args.turn:
        print("❌ Required: --turn")
        sys.exit(1)
    
    organ_id = args.organ
    turn = args.turn
    
    # Загрузка контекста
    context = None
    if args.context:
        context = load_context(pathlib.Path(args.context))
    
    # Загрузка входных данных
    input_data = {}
    
    # 1. Сначала загружаем из файла (если указан)
    if args.input:
        input_path = pathlib.Path(args.input)
        if not input_path.exists():
            print(f"❌ Input file not found: {input_path}")
            sys.exit(1)
        
        with open(input_path, "r", encoding="utf-8") as f:
            try:
                input_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in input file: {e}")
                sys.exit(1)
    
    # 2. Затем переопределяем/дополняем из CLI-флагов
    cli_data = build_input_from_args(args, organ_id)
    if cli_data:
        input_data.update(cli_data)
    
    # Создание решения
    if args.interactive:
        print(f"\n🎯 Интерактивное создание решения для {organ_id}, раунд {turn}")
        print("=" * 60)
        print("Введите данные для каждого поля (Enter для пропуска):\n")
        
        decision = create_template(organ_id, turn)
        
        # Простой интерактивный ввод для ключевых полей
        for field in ["publicStatement", "llmNotes"]:
            if field in decision:
                current = decision[field]
                user_input = input(f"{field} [{current}]: ").strip()
                if user_input:
                    decision[field] = user_input
        
        print("\n💡 Для остальных полей отредактируйте JSON вручную.")
    else:
        decision = create_decision_from_input(organ_id, turn, input_data, context)
    
    # Валидация
    is_valid, errors = validate_decision(decision, organ_id)
    
    # Вывод
    if not args.json_only:
        print("\n" + "=" * 60)
        if is_valid:
            print("✅ VALID DECISION")
        else:
            print("❌ VALIDATION ERRORS:")
            for error in errors:
                print(f"   • {error}")
        
        print("=" * 60)
    
    print(format_output(decision, pretty=not args.compact))
    
    if not args.json_only:
        print("=" * 60)
        
        if is_valid:
            print("\n💡 Это решение готово для возврата центральному движку.")
            print("   НЕ ЗАПИСЫВАЙТЕ ЕГО В ФАЙЛ!")
            print("   Центральный движок выполнит batch save после валидации всех решений.")
        else:
            print("\n⚠️ Исправьте ошибки перед возвратом центральному движку.")
            sys.exit(1)
    elif not is_valid:
        sys.exit(1)


if __name__ == "__main__":
    main()
