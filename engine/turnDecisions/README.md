# turnDecisions — решения агентов по раундам

Эта папка содержит JSON-ответы ИИ-агентов (non-player organs) за каждый раунд.

## Структура

```
turnDecisions/
├── README.md              ← этот файл
├── turn_01/               ← решения раунда 1
│   ├── rdc.json           ← RDC (если не playerOrgan)
│   ├── bma_council.json   ← BMA Council
│   ├── dhsc.json          ← DHSC
│   ├── hmt.json           ← HMT
│   ├── providers.json     ← NHS Providers
│   ├── aomrc.json         ← AoMRC
│   ├── ddrb.json          ← DDRB (неиграбельный)
│   ├── base.json          ← Членская база BMA (неиграбельный)
│   └── press.json         ← Пресса (неиграбельный)
├── turn_02/
│   └── ...
└── turn_05/
    └── ...
```

## Как это работает

1. **Движок** определяет, какой орган выбран игроком (`playerOrgan`).
2. **Решение игрока** проходит grilling и сохраняется в `engine/turnDecisions/turn_<NN>/<playerOrgan>.json`
   **до** запуска subagents. Если grilling не пройден — сохраняется объект с ошибкой.
   Если игрок не дал решения — сохраняется статус-кво.
3. Все остальные органы (non-player) запускаются как **subagents**.
4. Каждый subagent получает:
   - Свой промпт из `agentPrompts/<organ_id>_prompt.md`
   - Актуальный `context.json`
   - Историю предыдущих раундов
   - Решение игрока за текущий раунд (уже лежит в `engine/turnDecisions/`)
5. Subagent возвращает JSON строго по схеме из своего промпта.
6. Движок сохраняет ответ в `engine/turnDecisions/turn_<NN>/<organ_id>.json`.
7. Когда все ответы собраны (включая решение игрока), движок читает **все** `.json` файлы
   из папки, агрегирует решения и считает последствия.

> **Ключевой принцип:** решение игрока хранится в той же папке и в том же формате, что и
> ответы subagents. В Фазе 3 все органы равноправны — движок просто читает все `.json` файлы.

## Формат файлов

Каждый `<organ_id>.json` содержит ответ агента по схеме из его промпта. Пример для `rdc.json`:

```json
{
  "turn": 1,
  "agentName": "rdc",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "stanceOnOffer": {...},
  "strikeAction": {...},
  "capitalSpent": 30,
  "llmNotes": "..."
}
```

## Обработка ошибок

Если агент вернул невалидный JSON или не ответил:

```json
{
  "error": "invalid_response",
  "fallback": "status_quo",
  "organId": "rdc",
  "turn": 1
}
```

Движок интерпретирует это как статус-кво для данного органа.

## Очистка

Для нового прогона удалите содержимое папок `turn_XX/` или всю папку `engine/turnDecisions/`.
