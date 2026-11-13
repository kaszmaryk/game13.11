#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Пример использования инструмента create_decision_json.py в subagent'е.

Этот скрипт демонстрирует, как subagent должен:
1. Сгенерировать решение на основе промпта
2. Валидировать его через create_decision_json.py с помощью CLI-флагов
3. Вернуть JSON центральному движку (НЕ записывая файл!)

ВАЖНО: В реальном DSH workflow subagent работает через LLM, но валидация
через этот инструмент гарантирует корректность формата.
"""

import json
import subprocess
import sys
from pathlib import Path

# Добавляем путь к tools
TOOLS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS_DIR))


def example_generate_rdc_decision():
    """
    Пример: Subagent генерирует решение для RDC.
    
    В реальности это делает LLM на основе промпта из agentPrompts/rdc_prompt.md
    """
    
    # LLM генерирует решение (здесь имитируем)
    decision = {
        "turn": 1,
        "agentName": "rdc",
        "publicStatement": "Мы не можем принять оферту, которая не восстанавливает зарплаты.",
        "actions": [
            "Переговоры с DHSC о новой оферте",
            "Мобилизация членов перед забастовкой 15-19 июня",
            "Консультации с BMA Council о единстве позиции"
        ],
        "negotiation": {
            "talksWith": ["dhsc", "bma_council"],
            "offer": "Готовы рассмотреть увеличение мест до 4500",
            "demand": "Pay restoration + структурные реформы оплаты",
            "redLine": "Не примем оферту без прогресса к pay restoration"
        },
        "stanceOnOffer": {
            "recommendation": "reject",
            "reason": "Текущая оферта не обеспечивает восстановление зарплат",
            "baseReaction": "База поддерживает отказ, единство высокое"
        },
        "strikeAction": {
            "status": "proceed",
            "daysAffected": 4,
            "derogationLevel": "Emergency and urgent care only"
        },
        "capitalSpent": 20,
        "llmNotes": "RDC сохраняет жёсткую позицию. База единодушна. Готовы к эскалации если DHSC не предложит реальных уступок."
    }
    
    return decision


def validate_with_cli(decision: dict, organ_id: str, turn: int) -> tuple[bool, str]:
    """
    Валидировать решение через create_decision_json.py с использованием CLI-флагов.
    
    Передаёт все поля решения напрямую через аргументы командной строки,
    без создания временных файлов.
    
    Returns:
        (is_valid, output_json_or_errors)
    """
    # Строим команду с CLI-флагами для каждого поля
    cmd = [
        sys.executable,
        str(TOOLS_DIR / "create_decision_json.py"),
        "--organ", organ_id,
        "--turn", str(turn),
        "--json-only",
        "--compact",
    ]
    
    # Маппинг полей решения на CLI-флаги
    # camelCase -> kebab-case конвертация
    import re
    def camel_to_kebab(name):
        s = re.sub(r'([a-z0-9])([A-Z])', r'\1-\2', name)
        s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1-\2', s)
        return s.lower().replace('_', '-')
    
    for key, value in decision.items():
        if key in ("turn", "agentName"):
            continue  # Эти поля задаются через --organ и --turn
        
        flag = f"--{camel_to_kebab(key)}"
        
        # Сериализуем значение: dict/list → JSON строка, остальное → str
        if isinstance(value, (dict, list)):
            str_value = json.dumps(value, ensure_ascii=False)
        elif isinstance(value, bool):
            str_value = "true" if value else "false"
        else:
            str_value = str(value)
        
        cmd.extend([flag, str_value])
    
    # Запускаем валидацию
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        # Успех: stdout содержит валидный JSON
        return True, result.stdout.strip()
    else:
        # Ошибка: stderr или stdout содержит описание проблем
        error_output = result.stderr.strip() or result.stdout.strip()
        return False, error_output


def main():
    print("=" * 70)
    print("ПРИМЕР: Subagent генерирует и валидирует решение через CLI")
    print("=" * 70)
    
    # Шаг 1: Генерация решения
    print("\n📝 Шаг 1: Генерация решения RDC...")
    decision = example_generate_rdc_decision()
    print(f"   Сгенерировано решение с {len(decision)} полями")
    
    # Шаг 2: Валидация через CLI-флаги
    print("\n🔍 Шаг 2: Валидация через CLI-флаги (без временных файлов)...")
    is_valid, output = validate_with_cli(decision, "rdc", turn=1)
    
    if is_valid:
        print("   ✅ Решение прошло валидацию!")
        validated_json = json.loads(output)
    else:
        print("   ❌ Ошибки валидации:")
        print(f"      {output}")
        print("\n   💡 Исправьте ошибки и повторите валидацию")
        return
    
    # Шаг 3: Возврат центральному движку
    print("\n📤 Шаг 3: Возврат JSON центральному движку...")
    print("   ⚠️  ВАЖНО: НЕ ЗАПИСЫВАЕМ ФАЙЛ!")
    print("   Центральный движок выполнит batch save в Фазе 3")
    
    # В DSH workflow здесь subagent просто возвращает JSON
    print("\n   Возвращаемый JSON:")
    print(json.dumps(validated_json, ensure_ascii=False, indent=2))
    
    print("\n" + "=" * 70)
    print("✅ Subagent завершил работу. JSON готов для центрального движка.")
    print("=" * 70)


if __name__ == "__main__":
    main()
