# Инструменты оркестрации игры NHS

Эта директория содержит инструменты для управления раундами игры "Врачи против правительства".

## 📋 Доступные инструменты

### 1. `create_decision_json.py` ⭐ НОВЫЙ (v2.0)

**Для subagents** — создание и валидация JSON-решений **без записи файлов**.

Согласно архитектуре v2.0, subagents должны только возвращать JSON центральному движку, а не записывать файлы напрямую. Этот инструмент помогает subagents генерировать корректные решения.

```bash
# Создать шаблон решения
python3 tools/create_decision_json.py --organ rdc --turn 1

# Валидировать решение
python3 tools/create_decision_json.py --validate decision.json

# Интерактивный режим
python3 tools/create_decision_json.py --interactive --organ dhsc --turn 2

# Только JSON (для pipe)
python3 tools/create_decision_json.py --organ hmt --turn 1 --json-only
```

📖 **Подробная документация:** [README_DECISION_TOOL.md](README_DECISION_TOOL.md)  
💡 **Пример использования:** [example_subagent_usage.py](example_subagent_usage.py)

---

### 2. `run_turn.py`

**Для центрального движка** — оркестрация полного цикла раунда с grilling и subagent'ами.

Реализует логику из `system_prompt.md`:
- Фаза 0: Подготовка (чтение context.json, определение playerOrgan)
- Фаза 1: Grilling решения игрока
- Фаза 2: Запуск subagents для non-player organs
- Фаза 3: Агрегация и сохранение решений

```bash
python3 tools/run_turn.py --turn 1 --player rdc --input player_decision.json
```

⚠️ **Примечание:** В DSH этот скрипт служит спецификацией. Реальная оркестрация выполняется через workflow/subagent инструменты DeepSeek Harness.

---

### 3. `aggregate_turn.py`

Агрегация решений всех органов после завершения раунда. Считает метрики, обновляет контекст, генерирует нарратив.

```bash
python3 tools/aggregate_turn.py --turn 1
```

---

### 4. `build_scenario.py`

Генерация начального сценария и context.json для нового запуска игры.

```bash
python3 tools/build_scenario.py --output context.json
```

---

## 🔄 Архитектура v2.0 vs v1.0

### v1.0 (устаревшая)
```
Subagent → Читает промпт → Генерирует JSON → ЗАПИСЫВАЕТ ФАЙЛ ❌
```

**Проблемы:**
- Конфликты записи при параллельном выполнении
- Нет централизованной валидации
- Медленно (I/O у каждого агента)

### v2.0 (текущая)
```
Subagent → Читает промпт → Генерирует JSON → ВАЛИДИРУЕТ → Возвращает JSON ✅
                                                          ↓
Центральный движок ← Batch Save ← Валидирует все решения
```

**Преимущества:**
- ✅ Атомарные операции (batch save)
- ✅ Централизованная валидация до сохранения
- ✅ Быстро (параллельное выполнение без I/O конфликтов)
- ✅ Принудительный русский язык

---

## 🎯 Как использовать в DSH Workflow

### Для subagent'а:

```python
# 1. Прочитай свой промпт из agentPrompts/<organ_id>_prompt.md
# 2. Сгенерируй решение на основе контекста
my_decision = generate_decision(context)

# 3. ВАЖНО: Не записывай файл!
# with open("engine/turnDecisions/turn_01/my_organ.json", "w") as f:  # ❌ НЕ ДЕЛАЙ ТАК
#     json.dump(my_decision, f)

# 4. Опционально: валидируй через create_decision_json.py
import subprocess
subprocess.run([
    "python3", "tools/create_decision_json.py",
    "--validate", "/tmp/my_decision.json"
])

# 5. Верни JSON центральному движку
return my_decision  # ✅ ПРАВИЛЬНО
```

### Для центрального движка:

```python
# Фаза 2: Запуск subagents (параллельно)
agent_responses = {}
for organ_id in non_player_organs:
    response = await run_subagent(organ_id, context)
    agent_responses[organ_id] = response  # В ПАМЯТИ, не в файле!

# Фаза 3: Batch save
if all_valid(agent_responses):
    turn_dir = f"engine/turnDecisions/turn_{current_turn:02d}"
    for organ_id, decision in agent_responses.items():
        save_to_file(f"{turn_dir}/{organ_id}.json", decision)
    
    update_context(context)
else:
    return_error_to_player()
```

---

## 📊 Поддерживаемые органы

| Орган | Описание | Роль |
|-------|----------|------|
| `rdc` | Resident Doctors Committee | Игроковый (забастовочный комитет) |
| `bma_council` | BMA Council | Игроковый (совет профсоюза) |
| `dhsc` | Department of Health and Social Care | Игроковый (министерство здравоохранения) |
| `hmt` | HM Treasury | Игроковый (казначейство) |
| `providers` | NHS Providers | Игроковый (трасты больниц) |
| `aomrc` | Academy of Medical Royal Colleges | Игроковый (экспертная поддержка) |
| `ddrb` | Doctors' and Dentists' Review Body | Неигроковый (экспертная рекомендация) |
| `base` | Членская база BMA | Неигроковый (настроение членов) |
| `press` | Медиа и соцсети | Неигроковый (публичная реакция) |

---

## 🧪 Тестирование

```bash
# Проверить список органов
python3 tools/create_decision_json.py --list-organs

# Создать и валидировать решение
python3 tools/create_decision_json.py --organ rdc --turn 1 --json-only > /tmp/test.json
python3 tools/create_decision_json.py --validate /tmp/test.json

# Запустить пример subagent'а
python3 tools/example_subagent_usage.py
```

---

## 📚 Дополнительные ресурсы

- [`system_prompt.md`](../system_prompt.md) — полная архитектура игры v2.0
- [`agentPrompts/`](../agentPrompts/) — промпты для каждого органа
- [`README_DECISION_TOOL.md`](README_DECISION_TOOL.md) — детальная документация инструмента создания решений

---

## 🐛 Отладка

Если возникают проблемы:

1. **Проверьте формат JSON:**
   ```bash
   python3 -m json.tool decision.json > /dev/null
   ```

2. **Валидируйте через инструмент:**
   ```bash
   python3 tools/create_decision_json.py --validate decision.json
   ```

3. **Сравните с шаблоном:**
   ```bash
   python3 tools/create_decision_json.py --organ rdc --turn 1 > template.json
   diff template.json decision.json
   ```

4. **Проверьте логи subagent'а:**
   - Убедитесь, что subagent не пытается записать файл
   - Проверьте, что JSON возвращается центральному движку
