# Архитектура Движка v2.0

## Обзор

Центральный Движок управляет симуляцией забастовки резидент-врачей NHS через оркестрацию ИИ-агентов, валидацию решений и расчёт последствий.

## Ключевые принципы v2.0

### 1. Субагенты НЕ пишут файлы
- Агенты формируют решение и **валидируют его через CLI** (`create_decision_json.py`)
- Валидированный JSON возвращается центральному движку
- Запись файлов происходит централизованно после финальной валидации
- Преимущества: скорость, надёжность, простота отладки

### 2. Двухуровневая валидация
- **Уровень агента:** каждый агент проверяет своё решение через CLI-флаги
  `create_decision_json.py --organ <id> --turn <N> --field value ... --json-only`
- **Уровень движка:** все решения проверяются повторно перед сохранением
- Проверка схемы, языка, противоречий
- Ошибки на любом уровне блокируют сохранение

### 3. Batch operations
- Все решения сохраняются одним вызовом
- Атомарное обновление контекста с бэкапом
- Transaction-like поведение: всё или ничего

## Алгоритм раунда

```
Фаза 0: Подготовка
  └─ Чтение context.json
  └─ Определение player organ и non-player organs

Фаза 1: Grilling игрока
  └─ Проверка красных линий
  └─ Проверка процедурной корректности
  └─ Если невалидно → clarification_request

Фаза 2: Запуск субагентов (параллельно)
  └─ Каждый агент получает промпт + контекст
  └─ Агент формирует решение и валидирует через CLI:
     python3 tools/create_decision_json.py --organ <id> --turn <N> \
       --public-statement "..." --actions '[...]' ... --json-only --compact
  └─ Агент возвращает валидированный JSON (НЕ пишет файл!)
  └─ Сбор всех решений в памяти

Фаза 3: Финальная валидация и агрегация
  ├─ Повторная валидация всех решений (движок)
  │  ├─ Проверка схемы
  │  ├─ Проверка языка (русский)
  │  └─ Поиск противоречий
  ├─ Если ошибки → возврат с деталями
  └─ Если ок → переход к сохранению

Фаза 4: Batch save
  └─ Создание директории engine/turnDecisions/turn_XX/
  └─ Запись всех JSON файлов одним вызовом

Фаза 5: Расчёт последствий (через aggregate_turn.py)
  └─ python3 tools/aggregate_turn.py --turn <NN>
  └─ Динамический пересчёт метрик из реальных данных решений
  └─ Генерация нарратива из publicStatement/position каждого органа
  └─ Извлечение событий из actions/negotiation/articles/operationalImpact
  └─ Построение карты переговоров из negotiation каждого органа
  └─ Прогноз референдума из base.referendumProjection

Фаза 6: Atomic context update
  ├─ Бэкап текущего context.json
  ├─ Применение изменений
  ├─ Валидация новой структуры
  └─ Сохранение или откат при ошибке
```

## Структура файлов

```
engine/
├── system_prompt.md          # Главный промпт движка (v2.0)
├── README.md                 # Общая информация
├── QUICK_START.md            # Быстрый старт
├── CHANGELOG.md              # История изменений
├── GAME_DATA_SUMMARY.md      # Описание данных игры
├── sources.md                # Источники информации
│
├── agentPrompts/             # Промпты для каждого органа
│   ├── rdc_prompt.md
│   ├── bma_prompt.md
│   ├── dhsc_prompt.md
│   ├── hmt_prompt.md
│   ├── providers_prompt.md
│   ├── aomrc_prompt.md
│   ├── ddrb_prompt.md
│   ├── base_prompt.md
│   └── media_prompt.md
│
├── turnDecisions/            # Решения по раундам
│   ├── turn_01/
│   │   ├── rdc.json
│   │   ├── bma_council.json
│   │   └── ...
│   └── turn_02/
│       └── ...
│
└── tools/                    # Инструменты
    ├── create_decision_json.py      # Валидация и создание JSON решений (CLI)
    ├── example_subagent_usage.py    # Пример использования CLI в субагенте
    ├── aggregate_turn.py            # Динамический агрегатор раунда (v2.0)
    ├── run_turn.py                  # Оркестратор v1.0 (legacy)
    └── build_scenario.py            # Генератор сценариев
```

## Формат ответа агента

Каждый агент возвращает JSON строго по своей схеме (определённой в `agentPrompts/<organ>_prompt.md`
и `tools/create_decision_json.py`). Схемы различаются по органам, но все содержат общие поля:

| Поле | Тип | Описание |
|------|-----|----------|
| `turn` | int | Номер раунда (1-5) |
| `agentName` | str | ID органа (`rdc`, `dhsc`, `hmt`, ...) |
| `publicStatement` | str | Публичное заявление (1-2 предложения) |
| `actions` | list[str] | Список действий (до 5) |
| `negotiation` | dict | Переговорная позиция (`talksWith`, `offer`, `demand`, `redLine`) |
| `capitalSpent` | int | Потраченный переговорный капитал (0-100) |
| `llmNotes` | str | Внутренние заметки агента |

Органо-специфичные поля (примеры):
- **RDC:** `stanceOnOffer`, `strikeAction`
- **DHSC:** `offerDetails`, `budgetConstraints`
- **HMT:** `fiscalPosition`, `approvalStatus`
- **BMA Council:** `internalUnity`, `stanceOnOffer`
- **Providers:** `operationalImpact`, `contingencyPlans`
- **AoMRC:** `expertAssessment`, `recommendations`
- **DDRB:** `recommendation`, `analysis`, `fiscalContext`
- **Base:** `sentiment`, `unityLevel`, `keyConcerns`, `referendumProjection`
- **Press:** `headline`, `articles`, `socialMediaPosts`, `publicSentiment`

Полную схему каждого органа можно посмотреть:
```bash
python3 tools/create_decision_json.py --organ <id> --turn 1 --show-fields
```

**ВАЖНО:** Все строковые значения должны быть на русском языке!

### Валидация через CLI

Агенты валидируют решения перед возвратом, передавая все поля через CLI-флаги:
```bash
python3 tools/create_decision_json.py --organ rdc --turn 1 \
  --public-statement "Текст заявления" \
  --actions '["действие 1", "действие 2"]' \
  --negotiation '{"talksWith": ["dhsc"], "offer": "...", "demand": "...", "redLine": "..."}' \
  --stance-on-offer '{"recommendation": "reject", "reason": "...", "baseReaction": "..."}' \
  --strike-action '{"status": "proceed", "daysAffected": 4, "derogationLevel": "..."}' \
  --capital-spent 15 \
  --llm-notes "Заметки" \
  --json-only --compact
```

Скрипт автоматически парсит значения: JSON-строки → dict/list, числа → int/float,
`true`/`false` → bool. Отсутствующие поля заполняются из шаблона органа.

## Агрегатор раунда (aggregate_turn.py)

Скрипт `tools/aggregate_turn.py` — динамический агрегатор, который заменяет хардкодные расчёты
на анализ реальных данных из решений органов. Запускается после batch save в Фазе 4:

```bash
python3 tools/aggregate_turn.py --turn <NN>
```

### Что делает

1. **Загружает** все JSON из `engine/turnDecisions/turn_<NN>/` и `context.json`
2. **Извлекает** данные через хелпер-функции, поддерживающие оба формата решений:
   - `_extract_offer_details()` — оферта DHSC (`offerDetails`, `negotiation.offer`)
   - `_extract_base_sentiment()` — настроение базы (`unityLevel`, `referendumProjection`)
   - `_extract_operational_impact()` — ущерб от забастовки (`operationalImpact`)
   - `_extract_press_framing()` — фрейминг прессы (`dominantFraming`, `articles[].sentiment`)
3. **Рассчитывает метрики** динамически: каждая метрика начинается от предыдущего значения
   в `context.json` и корректируется по данным текущего раунда
4. **Генерирует нарратив** из `publicStatement`, `position`, `publicNarrative` каждого органа
5. **Извлекает события** из `actions`, `negotiation`, `articles`, `operationalImpact`, `recommendation`
6. **Строит карту переговоров** из `negotiation` каждого органа (`talksWith`, `offer`, `demand`, `redLine`)
7. **Прогнозирует референдум** из `base.referendumProjection`
8. **Выводит** итоговый JSON на stdout для использования движком

### Поддержка форматов решений

| Формат | Turn 1 (структурированный) | Turn 2+ (плоский LLM) |
|--------|---------------------------|----------------------|
| Actions | `[{type, description}]` | `["string"]` |
| Sentiment | `{overall, byGrade}` | `"text"` |
| ID поле | `organId` | `agentName` |
| Negotiation | Нет (в `position`/`demands`) | `{talksWith, offer, demand, redLine}` |
| Offer details | В `newOffer` | В `offerDetails` |

Хелпер `_safe_get(d, *keys, default)` безопасно извлекает вложенные значения из обоих форматов.

### Game Over логика

Скрипт автоматически ставит `isGameOver: true` при `turn >= 5`:
- Если `referendumProjection.passes == true` → «Оферта принята»
- Иначе → «Мандат истёк или оферта отклонена»

## Метрики игры

Все метрики рассчитываются динамически через `aggregate_turn.py` на основе реальных данных
из решений органов. Каждая метрика начинается от предыдущего значения в `context.json`.

| Метрика | Диапазон | Источник данных |
|---------|----------|----------------|
| strikeDaysScheduled | 0-365 | RDC `strikeAction.daysAffected` |
| averagePayIncrease | 0-100 | DHSC `offerDetails.avgPayIncrease` → DDRB `recommendation` |
| trainingPlacesOffered | 0-50000 | DHSC `offerDetails.trainingPlaces` → AoMRC `expertAssessment` |
| examFeesCompensated | 0 или 1 | DHSC `offerDetails.examFeesCompensated` |
| payRestorationGap | 0-100 | DHSC + RDC `negotiation.offer` (−2 если обе стороны упоминают) |
| baseUnity | 0-100 | Base `unityLevel`; +2 при межгрейдовых встречах RDC |
| publicSupport | 0-100 | Press `articles[].sentiment` (дельта = pos − neg) |
| governmentStability | 0-100 | Press sentiment (−1/neg); HMT approval (+1) |
| waitingListImpact | 0-10000 | Providers `operationalImpact.estimatedCancellations` / 1000 |
| monthsToMandateExpiry | 0-12 | −1 каждый раунд после первого |
| referendumProjection | 0-100 | Base `referendumProjection.projectedYes`; −3 без оферты |
| reballotRisk | 0-100 | Base unity (<60 → +5, >80 → −2); press (>2 neg → +2) |

## Три замка сделки

1. **Забастовочный замок** — мандат действителен, уведомление за 14 дней
2. **Ратификационный замок** — референдум принимает простым большинством
3. **Фискальный якорь** — DDRB 3.5%, лимит Казначейства

Сделка проходит только если преодолены все три замка.

## Обработка ошибок

- **Невалидный JSON от агента** → fallback на status_quo
- **Нарушение красной линии** → фиксация в llmNotes, падение метрик
- **Противоречивое решение** → интерпретация как компромисс
- **Пустое решение** → статус-кво, потеря хода
- **Ошибка валидации** → блокировка сохранения, возврат ошибок

## Язык и стилистика

- Все ответы строго на **русском языке**
- Названия органов: английские с расшифровкой (RDC, DHSC, HMT)
- Тон: политический репортаж, сухо-аналитический
- Цитаты от реальных лидеров из context.json

## Память и консистентность

- `history` содержит все предыдущие раунды
- Обещания обязательны к учёту
- Приоритет у текущего контекста при противоречиях
- Решения из `engine/turnDecisions/` — источник правды
