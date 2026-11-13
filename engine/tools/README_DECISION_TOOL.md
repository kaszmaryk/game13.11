# Инструмент создания решений для subagents

## 🎯 Назначение

Этот инструмент помогает **subagents** генерировать валидные JSON-решения **без записи файлов**. 

Согласно архитектуре v2.0 (см. `system_prompt.md`):
- ✅ Subagents **только возвращают JSON** центральному движку
- ❌ Subagents **НЕ записывают файлы** напрямую
- ✅ Центральный движок выполняет **batch save** всех решений после валидации

## 📋 Быстрый старт

### 1. Создать шаблон решения

```bash
python3 tools/create_decision_json.py --organ rdc --turn 1
```

Выведет готовый JSON-шаблон с примерами заполнения.

### 2. Валидировать своё решение

```bash
python3 tools/create_decision_json.py --validate my_decision.json
```

Проверит наличие обязательных полей и правильность типов данных.

### 3. Создать решение из входных данных

```bash
python3 tools/create_decision_json.py --organ dhsc --turn 2 --input my_input.json
```

Загрузит ваши данные, дополнит до полного решения и валидирует.

### 4. Интерактивный режим

```bash
python3 tools/create_decision_json.py --interactive --organ bma_council --turn 1
```

Пошаговый ввод ключевых полей через консоль.

## 🔧 Использование в DSH Workflow

### Для subagent'а:

```python
# 1. Сгенерируйте решение на основе промпта агента
my_decision = {
    "turn": 1,
    "agentName": "rdc",
    "publicStatement": "...",
    # ... остальные поля
}

# 2. Сохраните во временный файл для валидации
import json
with open("/tmp/my_decision.json", "w") as f:
    json.dump(my_decision, f)

# 3. Запустите валидацию
import subprocess
result = subprocess.run([
    "python3", "tools/create_decision_json.py",
    "--validate", "/tmp/my_decision.json"
], capture_output=True, text=True)

if result.returncode != 0:
    print("❌ Validation failed:", result.stderr)
    # Исправьте ошибки и повторите
else:
    print("✅ Decision is valid!")
    # Верните JSON центральному движку (НЕ записывайте файл!)
    return my_decision
```

### Для центрального движка:

```python
# Фаза 2: Запуск subagents
agent_responses = {}
for organ_id in non_player_organs:
    response = run_subagent(organ_id, context)
    
    # Валидация ответа subagent'а
    is_valid, errors = validate_decision(response, organ_id)
    if not is_valid:
        agent_responses[organ_id] = {
            "error": "invalid_response",
            "fallback": "status_quo",
            "errors": errors
        }
    else:
        agent_responses[organ_id] = response

# Фаза 3: Batch save ВСЕХ решений
turn_dir = f"engine/turnDecisions/turn_{current_turn:02d}"
Path(turn_dir).mkdir(parents=True, exist_ok=True)

for organ_id, decision in agent_responses.items():
    with open(f"{turn_dir}/{organ_id}.json", "w") as f:
        json.dump(decision, f, ensure_ascii=False, indent=2)
```

## 📊 Поддерживаемые органы

| Орган | Описание | Полей |
|-------|----------|-------|
| `rdc` | Resident Doctors Committee | 9 |
| `bma_council` | BMA Council | 9 |
| `dhsc` | Department of Health and Social Care | 9 |
| `hmt` | HM Treasury | 9 |
| `providers` | NHS Providers | 9 |
| `aomrc` | Academy of Medical Royal Colleges | 9 |
| `ddrb` | Doctors' and Dentists' Review Body | 5 |
| `base` | Членская база BMA | 7 |
| `press` | Медиа и соцсети | 7 |

Просмотреть все органы:
```bash
python3 tools/create_decision_json.py --list-organs
```

## ✅ Схема валидации

Каждое решение проверяется на:

1. **Обязательные поля** — все поля из схемы должны присутствовать
2. **Типы данных** — строки, числа, списки, объекты должны соответствовать схеме
3. **Диапазоны значений**:
   - `turn`: 1-5
   - `capitalSpent`: 0-100
   - `unityLevel`: 0-100 (для base)

## 🚫 Что НЕ делать

❌ **Subagent НЕ должен:**
```python
# ПЛОХО: Subagent пишет файл напрямую
with open("engine/turnDecisions/turn_01/rdc.json", "w") as f:
    json.dump(my_decision, f)
```

✅ **Subagent ДОЛЖЕН:**
```python
# ХОРОШО: Subagent возвращает JSON центральному движку
return my_decision  # Движок сам сохранит в Фазе 3
```

## 🔄 Полный цикл раунда (v2.0)

```
┌─────────────────────────────────────────────────┐
│ Фаза 0: Подготовка                               │
│ • Чтение context.json                            │
│ • Определение playerOrgan                        │
│ • Список non-player organs                       │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Фаза 1: Grilling игрока                          │
│ • Проверка красных линий                         │
│ • Процедурная корректность                       │
│ • Решение игрока → ПАМЯТЬ (не файл!)             │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Фаза 2: Запуск subagents                         │
│ • Каждый subagent:                               │
│   1. Читает свой промпт                          │
│   2. Генерирует решение                          │
│   3. ВАЛИДИРУЕТ через create_decision_json.py    │
│   4. Возвращает JSON (НЕ пишет файл!)            │
│ • Все ответы → ПАМЯТЬ движка                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ Фаза 3: Batch Save                               │
│ • Валидация ВСЕХ решений                         │
│ • Если OK:                                       │
│   1. Расчёт метрик                               │
│   2. BATCH SAVE в engine/turnDecisions/          │
│   3. Атомарное обновление context.json           │
│ • Если ошибка:                                   │
│   Откат, возврат ошибки игроку                   │
└─────────────────────────────────────────────────┘
```

## 💡 Советы

1. **Используйте шаблоны** — начните с `--organ X --turn Y` чтобы увидеть пример
2. **Валидируйте перед отправкой** — `--validate file.json` сэкономит время
3. **Следите за capitalSpent** — не тратьте больше, чем есть у органа
4. **Учитывайте контекст** — читайте history и previous decisions
5. **Не дублируйте работу** — если другой орган уже что-то решил, учитывайте это

## 🐛 Отладка

Если валидация не проходит:

```bash
# Посмотреть детали ошибок
python3 tools/create_decision_json.py --validate decision.json

# Сравнить с шаблоном
python3 tools/create_decision_json.py --organ rdc --turn 1 > template.json
diff template.json decision.json
```

## 📚 Дополнительные ресурсы

- `system_prompt.md` — полная архитектура игры v2.0
- `agentPrompts/*.md` — промпты для каждого органа
- `run_turn.py` — спецификация оркестрации раунда
