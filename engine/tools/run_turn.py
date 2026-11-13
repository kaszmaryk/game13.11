#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Оркестратор раунда для игры «Врачи против правительства: Англия, май 2026».

Этот скрипт реализует полный цикл обработки раунда с grilling и subagent-оркестрацией:

1. Читает context.json и определяет playerOrgan.
2. Grilling: проверяет решение игрока на красные линии и процедурную корректность.
3. Определяет non-player organs и запускает для каждого subagent.
4. Каждый subagent читает свой промпт из agentPrompts/<id>_prompt.md + context.json,
   принимает решение и пишет JSON в turnDecisions/turn_<NN>/<id>.json.
5. После сбора всех решений — агрегация, расчёт метрик, обновление context.json.

ИСПОЛЬЗОВАНИЕ В DSH:
    Этот скрипт описывает ЛОГИКУ оркестрации. В DeepSeek Harness он реализуется
    через workflow/subagent инструменты. Скрипт служит спецификацией для LLM-движка.

Запуск (спецификация):
    python3 tools/run_turn.py --turn 1 --player rdc --input turnDecisions/turn_01/player_input.json
"""

import json
import pathlib
import sys
from typing import Optional

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTEXT_FILE = ROOT.parent / "dashboard" / "public" / "context.json"
PROMPTS_DIR = ROOT / "agentPrompts"
TURN_DECISIONS_DIR = ROOT / "turnDecisions"

# Все органы и их промпт-файлы
ALL_ORGANS = [
    "rdc", "bma_council", "dhsc", "hmt", "providers", "aomrc",  # playable
    "ddrb", "base", "press",                                      # non-playable
]

PROMPT_FILES = {
    "rdc": "rdc_prompt.md",
    "bma_council": "bma_prompt.md",
    "dhsc": "dhsc_prompt.md",
    "hmt": "hmt_prompt.md",
    "providers": "providers_prompt.md",
    "aomrc": "aomrc_prompt.md",
    "ddrb": "ddrb_prompt.md",
    "base": "base_prompt.md",
    "press": "media_prompt.md",
}


def load_context() -> dict:
    """Загрузить актуальный context.json."""
    with open(CONTEXT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_player_organ(context: dict) -> Optional[str]:
    """Определить орган игрока из context."""
    # Ищем в game.playerOrgan или в органах с isPlayerOrgan
    game = context.get("game", {})
    player_organ = game.get("playerOrgan")
    if player_organ:
        return player_organ
    return None


def get_non_player_organs(context: dict, player_organ: str) -> list[str]:
    """
    Определить список non-player organs.
    Это все playable organs кроме playerOrgan + все non-playable organs.
    """
    non_player = []
    for organ in context.get("organs", []):
        organ_id = organ["id"]
        if organ_id == player_organ:
            continue
        non_player.append(organ_id)
    return non_player


def get_agent_prompt(organ_id: str) -> str:
    """Прочитать промпт агента из agentPrompts/."""
    prompt_file = PROMPT_FILES.get(organ_id)
    if not prompt_file:
        raise ValueError(f"No prompt file mapping for organ: {organ_id}")
    path = PROMPTS_DIR / prompt_file
    if not path.exists():
        raise FileNotFoundError(f"Prompt file not found: {path}")
    return path.read_text(encoding="utf-8")


def build_agent_context(context: dict, organ_id: str, turn: int,
                        player_decision: Optional[dict],
                        previous_decisions: dict) -> dict:
    """
    Собрать контекст для конкретного агента.
    Включает: полный context.json, историю, решение игрока, решения других агентов.
    """
    return {
        "currentGameState": context.get("game", {}),
        "metrics": context.get("metrics", {}),
        "organs": context.get("organs", []),
        "history": context.get("decisions", []),
        "turnCalendar": context.get("turnCalendar", []),
        "newspapers": context.get("newspapers", []),
        "socialMedia": context.get("socialMedia", []),
        "keyNumbers": context.get("keyNumbers", {}),
        "currentTurn": turn,
        "playerDecision": player_decision,
        "previousAgentDecisions": previous_decisions,
        "myOrganId": organ_id,
    }


def get_turn_dir(turn: int) -> pathlib.Path:
    """Получить путь к папке решений текущего раунда."""
    dir_path = TURN_DECISIONS_DIR / f"turn_{turn:02d}"
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path


def save_agent_decision(turn_dir: pathlib.Path, organ_id: str, decision: dict):
    """Сохранить решение агента в turnDecisions/turn_XX/<organ_id>.json."""
    out_file = turn_dir / f"{organ_id}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(decision, f, ensure_ascii=False, indent=2)
    print(f"  ✅ {organ_id}.json saved")


def load_previous_decisions(turn: int) -> dict:
    """Загрузить решения агентов за предыдущий раунд."""
    prev_turn = turn - 1
    if prev_turn < 1:
        return {}
    prev_dir = TURN_DECISIONS_DIR / f"turn_{prev_turn:02d}"
    if not prev_dir.exists():
        return {}
    decisions = {}
    for f in prev_dir.glob("*.json"):
        organ_id = f.stem
        with open(f, "r", encoding="utf-8") as fh:
            decisions[organ_id] = json.load(fh)
    return decisions


def grill_player_decision(player_decision: dict, context: dict,
                          player_organ: str) -> Optional[str]:
    """
    Grilling: проверить решение игрока на красные линии и процедурную корректность.
    Возвращает clarification_request (строку) если решение невалидно, иначе None.
    """
    # Найти орган игрока в organs[]
    organ_data = None
    for o in context.get("organs", []):
        if o["id"] == player_organ:
            organ_data = o
            break

    if not organ_data:
        return f"Орган '{player_organ}' не найден в context.json"

    red_lines = organ_data.get("redLines", [])

    # Проверка красных линий (базовая — по ключевым словам)
    decision_text = json.dumps(player_decision, ensure_ascii=False).lower()
    for rl in red_lines:
        # Простая эвристика: если решение содержит слова, противоречащие красной линии
        # В реальном движке это делает LLM
        pass  # LLM-driven grilling happens in the DSH workflow

    return None  # Решение прошло grilling


def run_turn(turn: int, player_organ: str, player_decision: Optional[dict] = None):
    """
    Полный цикл обработки раунда.

    В DSH этот функция реализуется через workflow/subagent инструменты.
    Здесь она служит спецификацией.
    """
    print(f"\n{'='*60}")
    print(f"РАУНД {turn} | Игрок: {player_organ}")
    print(f"{'='*60}")

    # Фаза 0: Подготовка
    context = load_context()
    non_player = get_non_player_organs(context, player_organ)
    print(f"\n📋 Non-player organs ({len(non_player)}): {', '.join(non_player)}")

    # Фаза 1: Grilling + сохранение решения игрока
    turn_dir = get_turn_dir(turn)

    if player_decision:
        print("\n🔍 Grilling решения игрока...")
        issue = grill_player_decision(player_decision, context, player_organ)
        if issue:
            # Grilling не пройден — сохраняем ошибку в turnDecisions
            error_decision = {
                "error": "grill_failed",
                "fallback": "status_quo",
                "questions_asked": [issue],
                "organId": player_organ,
                "turn": turn,
            }
            save_agent_decision(turn_dir, player_organ, error_decision)
            print(f"  ❌ Clarification needed: {issue}")
            return {"clarification_request": issue}
        print("  ✅ Решение прошло grilling")
        # Сохраняем решение игрока в turnDecisions (рядом с ответами subagents)
        save_agent_decision(turn_dir, player_organ, player_decision)
        print(f"  💾 Решение игрока сохранено в turnDecisions/turn_{turn:02d}/{player_organ}.json")
    else:
        # Пустое решение — статус-кво
        status_quo = {
            "turn": turn,
            "agentName": player_organ,
            "status": "status_quo",
            "note": "Player did not submit a decision this turn",
        }
        save_agent_decision(turn_dir, player_organ, status_quo)
        print(f"  ⏭️ Статус-кво сохранён для {player_organ}")

    # Фаза 2: Запуск subagents
    prev_decisions = load_previous_decisions(turn)

    print(f"\n🚀 Запуск {len(non_player)} subagents...")
    for organ_id in non_player:
        print(f"\n  📡 Agent: {organ_id}")
        try:
            prompt = get_agent_prompt(organ_id)
            agent_ctx = build_agent_context(
                context, organ_id, turn, player_decision, prev_decisions
            )
            # В DSH здесь вызывается subagent(prompt + context)
            # Для локального тестирования — placeholder
            placeholder = {
                "turn": turn,
                "agentName": organ_id,
                "status": "placeholder",
                "note": "Replace with actual subagent response in DSH",
            }
            save_agent_decision(turn_dir, organ_id, placeholder)
        except Exception as e:
            error_decision = {
                "error": str(e),
                "fallback": "status_quo",
                "organId": organ_id,
                "turn": turn,
            }
            save_agent_decision(turn_dir, organ_id, error_decision)
            print(f"  ⚠️ Error: {e}")

    # Фаза 3: Агрегация (решение игрока уже в turnDecisions из Фазы 1)
    print(f"\n📊 Агрегация решений из {turn_dir}...")
    all_decisions = {}
    for f in sorted(turn_dir.glob("*.json")):
        organ_id = f.stem
        with open(f, "r", encoding="utf-8") as fh:
            all_decisions[organ_id] = json.load(fh)

    print(f"  Получено {len(all_decisions)} решений:")
    for oid, dec in all_decisions.items():
        status = "✅" if "error" not in dec else "⚠️"
        print(f"    {status} {oid}")

    # В DSH здесь: расчёт метрик, обновление context.json, генерация нарратива
    print(f"\n✅ Раунд {turn} завершён. Решения в: {turn_dir}")
    return all_decisions


def main():
    """CLI entry point."""
    import argparse
    parser = argparse.ArgumentParser(description="NHS Game Turn Orchestrator")
    parser.add_argument("--turn", type=int, required=True, help="Turn number (1-5)")
    parser.add_argument("--player", type=str, required=True,
                        help="Player organ ID (rdc|bma_council|dhsc|hmt|providers|aomrc)")
    parser.add_argument("--input", type=str, default=None,
                        help="Path to player decision JSON file")
    args = parser.parse_args()

    player_decision = None
    if args.input:
        with open(args.input, "r", encoding="utf-8") as f:
            player_decision = json.load(f)

    result = run_turn(args.turn, args.player, player_decision)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
