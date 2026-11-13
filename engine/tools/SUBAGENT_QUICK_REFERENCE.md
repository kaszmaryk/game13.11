# 🚀 Quick Reference для Subagents

## ⚡ Главное правило v2.0

```
✅ SUBAGENTS RETURN JSON TO CENTRAL ENGINE
❌ SUBAGENTS DO NOT WRITE FILES
```

---

## 📋 Чеклист subagent'а

### Перед началом раунда:
- [ ] Прочитать свой промпт из `agentPrompts/<organ_id>_prompt.md`
- [ ] Получить актуальный `context.json` от центрального движка
- [ ] Изучить решения других органов за предыдущий раунд

### При генерации решения:
- [ ] Следовать схеме своего органа (см. ниже)
- [ ] Учитывать красные линии (`redLines`)
- [ ] Не превышать `negotiationCapital`
- [ ] Отвечать на русском языке

### Перед возвратом:
- [ ] Валидировать решение через `create_decision_json.py`
- [ ] Убедиться, что все обязательные поля заполнены
- [ ] Проверить типы данных

### После завершения:
- [ ] **Вернуть JSON центральному движку**
- [ ] **НЕ ЗАПИСЫВАТЬ ФАЙЛ!**

---

## 🎯 Схемы решений по органам

### RDC (Resident Doctors Committee)
```json
{
  "turn": 1,
  "agentName": "rdc",
  "publicStatement": "...",
  "actions": ["...", "..."],
  "negotiation": {
    "talksWith": ["dhsc"],
    "offer": "...",
    "demand": "...",
    "redLine": "..."
  },
  "stanceOnOffer": {
    "recommendation": "reject|accept|no_recommendation|null",
    "reason": "...",
    "baseReaction": "..."
  },
  "strikeAction": {
    "status": "proceed|suspend|escalate|cancel",
    "daysAffected": 4,
    "derogationLevel": "..."
  },
  "capitalSpent": 15,
  "llmNotes": "..."
}
```

### BMA Council
```json
{
  "turn": 1,
  "agentName": "bma_council",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "stanceOnOffer": {...},
  "internalUnity": "stable|fractured|unified",
  "capitalSpent": 10,
  "llmNotes": "..."
}
```

### DHSC (Department of Health)
```json
{
  "turn": 1,
  "agentName": "dhsc",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "offerDetails": {
    "avgPayIncrease": 5.5,
    "trainingPlaces": 4500,
    "examFeesCompensated": true,
    "payRestorationProgress": "..."
  },
  "budgetConstraints": {
    "maxBudgetImpact": "...",
    "treasuryApproval": "pending|approved|denied"
  },
  "capitalSpent": 20,
  "llmNotes": "..."
}
```

### HMT (Treasury)
```json
{
  "turn": 1,
  "agentName": "hmt",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "fiscalPosition": {
    "availableBudget": "...",
    "priorityAreas": ["..."],
    "constraints": "..."
  },
  "approvalStatus": "conditional|approved|denied",
  "capitalSpent": 5,
  "llmNotes": "..."
}
```

### NHS Providers
```json
{
  "turn": 1,
  "agentName": "providers",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "operationalImpact": {
    "estimatedCancellations": 50000,
    "locumCosts": "...",
    "emergencyCoverage": "70%"
  },
  "contingencyPlans": ["...", "..."],
  "capitalSpent": 12,
  "llmNotes": "..."
}
```

### AoMRC
```json
{
  "turn": 1,
  "agentName": "aomrc",
  "publicStatement": "...",
  "actions": ["..."],
  "negotiation": {...},
  "expertAssessment": {
    "currentTrainingQuality": "...",
    "expansionFeasibility": "...",
    "recommendedPlaces": 4200
  },
  "recommendations": ["...", "..."],
  "capitalSpent": 8,
  "llmNotes": "..."
}
```

### DDRB
```json
{
  "turn": 1,
  "agentName": "ddrb",
  "recommendation": {
    "avgPayIncrease": 3.5,
    "effectiveDate": "2026-04-01",
    "rationale": "..."
  },
  "analysis": "...",
  "fiscalContext": {
    "inflationRate": 2.8,
    "recruitmentRetention": "...",
    "affordability": "..."
  },
  "llmNotes": "..."
}
```

### Base (членская база)
```json
{
  "turn": 1,
  "agentName": "base",
  "sentiment": "frustrated_but_determined",
  "unityLevel": 78,
  "keyConcerns": ["...", "..."],
  "referendumProjection": {
    "projectedYes": 45,
    "projectedTurnout": 65,
    "passes": false,
    "keyFactor": "..."
  },
  "llmNotes": "..."
}
```

### Press (медиа)
```json
{
  "turn": 1,
  "agentName": "press",
  "headline": "...",
  "articles": [
    {
      "source": "...",
      "title": "...",
      "tone": "...",
      "excerpt": "..."
    }
  ],
  "socialMediaPosts": [
    {
      "platform": "Twitter",
      "content": "...",
      "engagement": 15000,
      "sentiment": "positive|negative|neutral"
    }
  ],
  "publicSentiment": "...",
  "llmNotes": "..."
}
```

---

## 🔧 Команды валидации

### Быстрая проверка:
```bash
python3 tools/create_decision_json.py --validate my_decision.json
```

### Создать шаблон:
```bash
python3 tools/create_decision_json.py --organ rdc --turn 1
```

### Только JSON (для pipe):
```bash
python3 tools/create_decision_json.py --organ dhsc --turn 2 --json-only
```

### Интерактивный режим:
```bash
python3 tools/create_decision_json.py --interactive --organ hmt --turn 1
```

---

## ❌ Типичные ошибки

### 1. Запись файла subagent'ом
```python
# ❌ НЕПРАВИЛЬНО
with open("engine/turnDecisions/turn_01/rdc.json", "w") as f:
    json.dump(decision, f)

# ✅ ПРАВИЛЬНО
return decision  # Центральный движок сохранит в Фазе 3
```

### 2. Пропуск обязательных полей
```python
# ❌ НЕПОЛНОЕ РЕШЕНИЕ
decision = {
    "turn": 1,
    "agentName": "rdc"
    # missing: publicStatement, actions, negotiation, ...
}

# ✅ ПОЛНОЕ РЕШЕНИЕ
decision = {
    "turn": 1,
    "agentName": "rdc",
    "publicStatement": "...",
    "actions": [...],
    "negotiation": {...},
    # ... все обязательные поля
}
```

### 3. Неправильные типы данных
```python
# ❌ ОШИБКА ТИПА
"capitalSpent": "15"  # string вместо int

# ✅ ПРАВИЛЬНО
"capitalSpent": 15  # int
```

### 4. Превышение лимитов
```python
# ❌ ПРЕВЫШЕНИЕ
"capitalSpent": 150  # максимум 100

# ✅ В ЛИМИТЕ
"capitalSpent": 85
```

---

## 💡 Советы

1. **Начните с шаблона** — используйте `--organ X --turn Y` чтобы увидеть пример
2. **Валидируйте перед отправкой** — сэкономит время на исправление ошибок
3. **Учитывайте контекст** — читайте history и previous decisions
4. **Соблюдайте красные линии** — нарушение = провал цели органа
5. **Будьте конкретны** — избегайте расплывчатых формулировок
6. **Думайте о последствиях** — каждое действие влияет на метрики

---

## 🆘 Помощь

- Полная документация: [`README_DECISION_TOOL.md`](README_DECISION_TOOL.md)
- Пример использования: [`example_subagent_usage.py`](example_subagent_usage.py)
- Архитектура игры: [`system_prompt.md`](../system_prompt.md)
- Промпт вашего органа: [`agentPrompts/<organ_id>_prompt.md`](../agentPrompts/)

---

## 🎓 Пример полного цикла

```python
# 1. Subagent получает задание от центрального движка
context = get_context_from_engine()
my_prompt = read_prompt("rdc")

# 2. LLM генерирует решение
decision = llm_generate(my_prompt, context)

# 3. Валидация (опционально, но рекомендуется)
import subprocess
result = subprocess.run([
    "python3", "tools/create_decision_json.py",
    "--validate", "/tmp/my_decision.json"
])

if result.returncode != 0:
    # Исправить ошибки
    decision = fix_errors(decision)

# 4. Возврат центральному движку
return decision  # ✅ НЕ ЗАПИСЫВАЕМ ФАЙЛ!

# 5. Центральный движок выполнит batch save в Фазе 3
```

---

**Запомните:** Subagents — это эксперты, которые дают рекомендации. Центральный движок — это арбитр, который собирает все рекомендации, валидирует и сохраняет их атомарно.
