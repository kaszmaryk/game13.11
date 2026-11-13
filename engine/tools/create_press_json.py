#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CLI для создания валидного JSON пресс-активности (СМИ + социальные сети).

Инструмент создаёт два артефакта:

  1. press.json   — решение органа press/media для engine/turnDecisions/turn_<NN>/
                    (схема совместима с media_prompt.md и aggregate_turn.py)
  2. context-patch.json — фрагмент context.json с полями `newspapers` и
                    `socialMedia`, отформатированными под дашборд
                    (dashboard/src/types/game.ts: NewspaperArticle, SocialMediaPost)

Как и create_decision_json.py, инструмент НЕ пишет файлы движка сам — он печатает
JSON в stdout. Запись выполняет центральный движок или вызывающий агент:

    python3 tools/create_press_json.py --organ press --turn 4 ... --json-only --compact \
      > engine/turnDecisions/turn_04/press.json

ИСПОЛЬЗОВАНИЕ:
    # Показать схему полей
    python3 tools/create_press_json.py --show-fields

    # Создать решение из CLI-флагов
    python3 tools/create_press_json.py --turn 4 \\
      --headline "Забастовка врачей: NHS входит в третью неделю хаоса" \\
      --articles '[{"source":"The Guardian","headline":"...","summary":"...","text":"...","sentiment":"negative"}]' \\
      --social-media-buzz '[{"platform":"twitter","trend":"#NHScrisis","sentiment":"pro_doctors","volume":"high"}]' \\
      --public-opinion-shift '{"direction":"towards_doctors","magnitude":4,"driver":"Отмены операций"}' \\
      --llm-notes "Фрейминг смещается к системному кризису"

    # Дашбордные записи для context.json (id/publishedAt генерируются сами)
    python3 tools/create_press_json.py --turn 4 --format context-patch \\
      --from-file draft.json

    # Валидация существующего файла (press-решение или context-patch)
    python3 tools/create_press_json.py --validate engine/turnDecisions/turn_04/press.json
    python3 tools/create_press_json.py --validate patch.json --format context-patch

    # Автозаполнение проущих полей из контекста игры (--context path или dashboard/public/context.json)
"""

import argparse
import json
import pathlib
import sys
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional, Tuple

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTEXT_FILE = ROOT.parent / "dashboard" / "public" / "context.json"

# ---------------------------------------------------------------------------
# Схемы
# ---------------------------------------------------------------------------

VALID_FRAMINGS = ("greedy_doctors", "patient_safety", "systemic_crisis", "mixed")
VALID_SENTIMENTS = ("positive", "negative", "neutral")
VALID_SOCIAL_SENTIMENTS = ("pro_doctors", "pro_government", "mixed")
VALID_PLATFORMS = ("twitter", "reddit", "facebook")
VALID_VOLUME = ("low", "medium", "high")
VALID_DIRECTIONS = ("towards_doctors", "towards_government", "stable")

# Поля статьи press-решения (схема media_prompt.md)
ARTICLE_FIELDS = ("source", "headline", "summary", "text", "sentiment", "impact")
ARTICLE_REQUIRED = ("source", "headline", "summary", "sentiment")

BUZZ_FIELDS = ("platform", "trend", "sentiment", "volume")
BUZZ_REQUIRED = ("platform", "trend")

SHIFT_FIELDS = ("direction", "magnitude", "driver")

PRESS_SCHEMA = {
    "required_fields": ["turn", "agentName", "dominantFraming", "articles"],
    "optional_fields": [
        "headline",
        "socialMediaBuzz",
        "socialMediaPosts",
        "publicOpinionShift",
        "publicSentiment",
        "leaks",
        "patientStatements",
        "viralStories",
        "publicPressureDirection",
        "notes",
        "llmNotes",
    ],
}


class ValidationError(Exception):
    pass


# ---------------------------------------------------------------------------
# Утилиты
# ---------------------------------------------------------------------------


def load_json_arg(value: str, what: str) -> Any:
    """Распарсить строку CLI-флага как JSON."""
    try:
        return json.loads(value)
    except json.JSONDecodeError as e:
        raise ValidationError(f"{what}: некорректный JSON — {e}")


def turn_date(context: Dict[str, Any], turn: int) -> datetime:
    """Дата начала раунда из context.turnCalendar; fallback — дата первого раунда."""
    cal = context.get("turnCalendar") or []
    for t in cal:
        if isinstance(t, dict) and t.get("turn") == turn:
            iso = t.get("startDate") or t.get("date")
            if iso:
                try:
                    return datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
                except ValueError:
                    break
    for t in cal:
        if isinstance(t, dict) and t.get("startDate"):
            try:
                base = datetime.fromisoformat(str(t["startDate"]).replace("Z", "+00:00"))
                offset = max(0, turn - int(t.get("turn", 1)))
                return base + timedelta(days=offset * 7)
            except ValueError:
                break
    return datetime(2026, 5, 27, tzinfo=timezone.utc) + timedelta(days=max(0, turn - 1) * 7)


def load_context(path: Optional[pathlib.Path]) -> Dict[str, Any]:
    p = path or CONTEXT_FILE
    if not p.exists():
        return {}
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def next_dashboard_ids(context: Dict[str, Any]) -> Tuple[int, int]:
    """Максимальные счётчики id Newspapers/socialMedia в контексте."""

    def counter(items: List[Any], prefix: str) -> int:
        mx = 0
        for it in items or []:
            if isinstance(it, dict):
                ident = str(it.get("id", ""))
                if ident.startswith(prefix):
                    digits = "".join(c for c in ident[len(prefix):] if c.isdigit())
                    if digits:
                        mx = max(mx, int(digits))
        return mx

    return (
        counter(context.get("newspapers", []), "article-"),
        counter(context.get("socialMedia", []), "tweet-"),
    )


# ---------------------------------------------------------------------------
# Сборка press-решения
# ---------------------------------------------------------------------------


# Legacy field aliases (turn 1/3 used different naming)
_LEGACY_ALIASES = {
    "title": "headline",
    "framing": "summary",
    "tone": "sentiment",
    "excerpt": "summary",
}

# Legacy sentiment values → canonical
_SENTIMENT_ALIASES = {
    "supportive": "positive",
    "critical": "negative",
    "sympathetic_to_doctors": "positive",
    "hostile": "negative",
}


def _normalize_article(a: Dict[str, Any]) -> Dict[str, Any]:
    """Map legacy field names to canonical ones."""
    out = dict(a)
    for old, new in _LEGACY_ALIASES.items():
        if old in out and new not in out:
            out[new] = out.pop(old)
    return out


def build_articles(raw: Any, errors: List[str]) -> List[Dict[str, Any]]:
    if not isinstance(raw, list):
        errors.append("--articles должен быть JSON-массивом объектов")
        return []
    articles = []
    for i, a in enumerate(raw):
        if not isinstance(a, dict):
            errors.append(f"articles[{i}]: ожидается объект")
            continue
        a = _normalize_article(a)
        # Normalize legacy sentiment values
        sent = a.get("sentiment")
        if sent is not None and sent in _SENTIMENT_ALIASES:
            a["sentiment"] = _SENTIMENT_ALIASES[sent]
        missing = [f for f in ARTICLE_REQUIRED if not a.get(f)]
        if missing:
            errors.append(f"articles[{i}]: отсутствуют поля {missing}")
        sent = a.get("sentiment")
        if sent is not None and sent not in VALID_SENTIMENTS:
            errors.append(
                f"articles[{i}].sentiment: '{sent}', допустимо {list(VALID_SENTIMENTS)}"
            )
        article = {k: a[k] for k in ARTICLE_FIELDS if k in a}
        article.setdefault("text", article.get("summary", ""))
        articles.append(article)
    return articles


def build_buzz(raw: Any, errors: List[str]) -> List[Dict[str, Any]]:
    if raw is None:
        return []
    if not isinstance(raw, list):
        errors.append("--social-media-buzz должен быть JSON-массивом")
        return []
    buzz = []
    for i, b in enumerate(raw):
        if not isinstance(b, dict):
            errors.append(f"socialMediaBuzz[{i}]: ожидается объект")
            continue
        missing = [f for f in BUZZ_REQUIRED if not b.get(f)]
        if missing:
            errors.append(f"socialMediaBuzz[{i}]: отсутствуют поля {missing}")
        if b.get("platform") and b["platform"] not in VALID_PLATFORMS:
            errors.append(
                f"socialMediaBuzz[{i}].platform: '{b['platform']}', допустимо {list(VALID_PLATFORMS)}"
            )
        if b.get("sentiment") and b["sentiment"] not in VALID_SOCIAL_SENTIMENTS:
            errors.append(
                f"socialMediaBuzz[{i}].sentiment: '{b['sentiment']}', допустимо {list(VALID_SOCIAL_SENTIMENTS)}"
            )
        if b.get("volume") and b["volume"] not in VALID_VOLUME:
            errors.append(
                f"socialMediaBuzz[{i}].volume: '{b['volume']}', допустимо {list(VALID_VOLUME)}"
            )
        buzz.append({k: b[k] for k in BUZZ_FIELDS if k in b})
    return buzz


def build_shift(raw: Any, errors: List[str]) -> Optional[Dict[str, Any]]:
    if raw is None:
        return None
    if not isinstance(raw, dict):
        errors.append("--public-opinion-shift должен быть JSON-объектом")
        return None
    if raw.get("direction") and raw["direction"] not in VALID_DIRECTIONS:
        errors.append(
            f"publicOpinionShift.direction: '{raw['direction']}', допустимо {list(VALID_DIRECTIONS)}"
        )
    mag = raw.get("magnitude")
    if mag is not None and (not isinstance(mag, (int, float)) or not 0 <= mag <= 10):
        errors.append("publicOpinionShift.magnitude должен быть числом 0-10")
    return {k: raw[k] for k in SHIFT_FIELDS if k in raw}


def infer_framing(articles: List[Dict[str, Any]]) -> str:
    pos = sum(1 for a in articles if a.get("sentiment") == "positive")
    neg = sum(1 for a in articles if a.get("sentiment") == "negative")
    if pos and not neg:
        return "patient_safety"
    if neg and not pos:
        return "greedy_doctors"
    return "mixed"


def build_press_decision(args, input_data: Dict[str, Any]) -> Dict[str, Any]:
    errors: List[str] = []
    organ = args.organ
    turn = args.turn

    decision: Dict[str, Any] = {}
    decision.update(input_data)

    # CLI-флаги имеют приоритет над --input/--from-file
    if args.headline is not None:
        decision["headline"] = args.headline
    if args.dominant_framing is not None:
        decision["dominantFraming"] = args.dominant_framing
    if args.articles is not None:
        decision["articles"] = load_json_arg(args.articles, "--articles")
    if args.social_media_posts is not None:
        decision["socialMediaPosts"] = load_json_arg(args.social_media_posts, "--social-media-posts")
    if args.social_media_buzz is not None:
        decision["socialMediaBuzz"] = load_json_arg(args.social_media_buzz, "--social-media-buzz")
    if args.public_opinion_shift is not None:
        decision["publicOpinionShift"] = load_json_arg(args.public_opinion_shift, "--public-opinion-shift")
    if args.llm_notes is not None:
        decision["llmNotes"] = args.llm_notes

    decision["turn"] = turn
    decision["agentName"] = organ

    # Нормализация и валидация списков
    decision["articles"] = build_articles(decision.get("articles", []), errors)
    if "socialMediaBuzz" in decision:
        decision["socialMediaBuzz"] = build_buzz(decision["socialMediaBuzz"], errors)
    if "publicOpinionShift" in decision:
        shift = build_shift(decision["publicOpinionShift"], errors)
        if shift is None:
            decision.pop("publicOpinionShift")
        else:
            decision["publicOpinionShift"] = shift

    framing = decision.get("dominantFraming")
    if framing is None:
        framing = infer_framing(decision["articles"])
    if framing not in VALID_FRAMINGS:
        errors.append(f"dominantFraming: '{framing}', допустимо {list(VALID_FRAMINGS)}")
    decision["dominantFraming"] = framing

    if not (1 <= turn <= 5):
        errors.append("turn должен быть между 1 и 5")

    if errors:
        raise ValidationError("\n   • ".join(errors))

    # Стабильный порядок ключей
    ordered: Dict[str, Any] = {"turn": turn, "agentName": organ, "dominantFraming": framing}
    for key in ("headline", "articles", "socialMediaPosts", "socialMediaBuzz", "publicOpinionShift", "llmNotes"):
        if key in decision:
            ordered[key] = decision[key]
    for key in PRESS_SCHEMA["optional_fields"]:
        if key in decision and key not in ordered:
            ordered[key] = decision[key]
    return ordered


# ---------------------------------------------------------------------------
# Сборка context-patch (newspapers + socialMedia для дашборда)
# ---------------------------------------------------------------------------


def build_context_patch(args, input_data: Dict[str, Any], press: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Преобразовать.press-решение в записи формата дашборда.

    Вход может содержать:
      --news-articles   : массив записей NewspaperArticle (частично)
      --posts           : массив записей SocialMediaPost (частично)
    Недостающие записи берутся из press-решения (articles -> newspapers,
    socialMediaPosts/socialMediaBuzz -> posts).
    """
    errors: List[str] = []
    turn = args.turn
    base_dt = turn_date(context, turn)
    art_counter, post_counter = next_dashboard_ids(context)
    if args.id_start is not None:
        art_counter = max(art_counter, args.id_start)

    news_raw = input_data.get("newspapers")
    if args.news_articles is not None:
        news_raw = load_json_arg(args.news_articles, "--news-articles")
    posts_raw = input_data.get("socialMedia")
    if args.posts is not None:
        posts_raw = load_json_arg(args.posts, "--posts")

    newspapers: List[Dict[str, Any]] = []
    if isinstance(news_raw, list):
        for i, a in enumerate(news_raw):
            if not isinstance(a, dict) or not a.get("headline") or not a.get("source"):
                errors.append(f"newspapers[{i}]: нужны source и headline")
                continue
            if a.get("sentiment") and a["sentiment"] not in VALID_SENTIMENTS:
                errors.append(f"newspapers[{i}].sentiment: '{a['sentiment']}' недопустим")
            art_counter += 1
            newspapers.append(
                {
                    "id": a.get("id") or f"article-{art_counter:03d}",
                    "turn": a.get("turn", turn),
                    "source": a["source"],
                    "headline": a["headline"],
                    "summary": a.get("summary") or a.get("text", "")[:220],
                    "text": a.get("text", ""),
                    "sentiment": a.get("sentiment", "neutral"),
                    "publishedAt": a.get("publishedAt")
                    or (base_dt + timedelta(hours=8, minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
            )
    elif news_raw is not None:
        errors.append("newspapers должен быть массивом")

    # Fallback: генерация из press-решения
    if not newspapers:
        for i, a in enumerate(press.get("articles", [])):
            art_counter += 1
            newspapers.append(
                {
                    "id": f"article-{art_counter:03d}",
                    "turn": turn,
                    "source": a.get("source", "Unknown"),
                    "headline": a.get("headline", a.get("title", "")),
                    "summary": a.get("summary") or a.get("excerpt", ""),
                    "text": a.get("text", ""),
                    "sentiment": a.get("sentiment", "neutral"),
                    "publishedAt": (base_dt + timedelta(hours=8, minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                }
            )

    posts: List[Dict[str, Any]] = []
    if isinstance(posts_raw, list):
        for i, p in enumerate(posts_raw):
            if not isinstance(p, dict) or not p.get("content"):
                errors.append(f"socialMedia[{i}]: нужно поле content")
                continue
            post_counter += 1
            hashtags = p.get("hashtags")
            if hashtags is None:
                hashtags = [w for w in str(p["content"]).split() if w.startswith("#")]
            posts.append(
                {
                    "id": p.get("id") or f"tweet-{post_counter:03d}",
                    "turn": p.get("turn", turn),
                    "author": p.get("author", "Аноним"),
                    "handle": p.get("handle", "@аноним"),
                    "avatar": p.get("avatar", ""),
                    "content": p["content"],
                    "likes": int(p.get("likes", 0)),
                    "retweets": int(p.get("retweets", 0)),
                    "timestamp": p.get("timestamp")
                    or (base_dt + timedelta(hours=7, minutes=i * 15)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                    "hashtags": hashtags,
                }
            )
    elif posts_raw is not None:
        errors.append("socialMedia должен быть массивом")

    # Fallback: из press-решения (socialMediaPosts — формат схемы press,
    # socialMediaBuzz — тренды)
    if not posts:
        smp = press.get("socialMediaPosts")
        if isinstance(smp, list):
            for i, p in enumerate(smp):
                if not isinstance(p, dict):
                    continue
                post_counter += 1
                content = str(p.get("content", ""))
                platform = str(p.get("platform", "Twitter"))
                posts.append(
                    {
                        "id": f"tweet-{post_counter:03d}",
                        "turn": turn,
                        "author": p.get("author", f"Пользователь {platform}"),
                        "handle": p.get("handle", f"{platform.lower()}_пользователь").lstrip("@"),
                        "avatar": "",
                        "content": content,
                        "likes": int(p.get("engagement", p.get("likes", 0))),
                        "retweets": int(p.get("retweets", 0)),
                        "timestamp": (base_dt + timedelta(hours=7, minutes=i * 15)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "hashtags": [w for w in content.split() if w.startswith("#")],
                    }
                )
        if not posts:
            for i, b in enumerate(press.get("socialMediaBuzz", [])):
                if not isinstance(b, dict):
                    continue
                post_counter += 1
                trend = str(b.get("trend", ""))
                volume_likes = {"low": 500, "medium": 5000, "high": 20000}.get(b.get("volume", "medium"), 5000)
                sentiment_ru = {"pro_doctors": "поддержка врачей", "pro_government": "поддержка правительства", "mixed": "смешанная реакция"}
                posts.append(
                    {
                        "id": f"tweet-{post_counter:03d}",
                        "turn": turn,
                        "author": "Тренд соцсетей",
                        "handle": f"{str(b.get('platform', 'twitter'))}_тренды",
                        "avatar": "",
                        "content": f"{trend} — обсуждение в соцсетях ({sentiment_ru.get(b.get('sentiment', 'mixed'), b.get('sentiment', 'mixed'))})",
                        "likes": volume_likes,
                        "retweets": volume_likes // 3,
                        "timestamp": (base_dt + timedelta(hours=9, minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "hashtags": [w for w in trend.split() if w.startswith("#")],
                    }
                )

    if errors:
        raise ValidationError("\n   • ".join(errors))
    return {"newspapers": newspapers, "socialMedia": posts}


# ---------------------------------------------------------------------------
# Валидация файлов
# ---------------------------------------------------------------------------


def validate_file(path: pathlib.Path, fmt: str) -> Tuple[bool, List[str], str]:
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError as e:
            return False, [f"Invalid JSON: {e}"], "unknown"

    errors: List[str] = []
    if fmt == "context-patch":
        for a in data.get("newspapers", []):
            _check_article_dashboard(a, errors)
        for p in data.get("socialMedia", []):
            _check_post_dashboard(p, errors)
        kind = "context-patch"
    else:
        organ = data.get("agentName", data.get("organId", "press"))
        if organ not in ("press", "media"):
            errors.append(f"agentName должен быть 'press' или 'media', получен '{organ}'")
        if not isinstance(data.get("turn"), int):
            errors.append("turn должен быть целым числом")
        framing = data.get("dominantFraming")
        if framing is not None and framing not in VALID_FRAMINGS:
            errors.append(f"dominantFraming: '{framing}', допустимо {list(VALID_FRAMINGS)}")
        arts = data.get("articles")
        if not isinstance(arts, list):
            errors.append("articles должен быть массивом")
        else:
            probe: List[str] = []
            build_articles(arts, probe)
            errors.extend(probe)
        if "socialMediaBuzz" in data:
            probe: List[str] = []
            build_buzz(data["socialMediaBuzz"], probe)
            errors.extend(probe)
        if "publicOpinionShift" in data:
            probe = []
            build_shift(data["publicOpinionShift"], probe)
            errors.extend(probe)
        kind = "press-decision"
    return len(errors) == 0, errors, kind


def _check_article_dashboard(a: Any, errors: List[str]) -> None:
    if not isinstance(a, dict):
        errors.append("запись newspapers должна быть объектом")
        return
    for field in ("id", "turn", "source", "headline", "summary", "sentiment", "publishedAt"):
        if field not in a:
            errors.append(f"newspapers[{a.get('id', '?')}]: отсутствует {field}")
    if a.get("sentiment") and a["sentiment"] not in VALID_SENTIMENTS:
        errors.append(f"newspapers[{a.get('id', '?')}].sentiment: '{a['sentiment']}' недопустим")


def _check_post_dashboard(p: Any, errors: List[str]) -> None:
    if not isinstance(p, dict):
        errors.append("запись socialMedia должна быть объектом")
        return
    for field in ("id", "turn", "author", "handle", "content", "likes", "retweets", "timestamp", "hashtags"):
        if field not in p:
            errors.append(f"socialMedia[{p.get('id', '?')}]: отсутствует {field}")
    if "hashtags" in p and not isinstance(p["hashtags"], list):
        errors.append(f"socialMedia[{p.get('id', '?')}].hashtags должен быть массивом")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def add_field_arguments(parser: argparse.ArgumentParser) -> None:
    g = parser.add_argument_group(
        "Поля press-решения",
        "JSON-значения передаются строкой. Отсутствующие значения заполняются "
        "из --input/--from-file, затем — выводятся из articles.",
    )
    g.add_argument("--headline", metavar="TEXT", help="Главный заголовок раунда (строка)")
    g.add_argument(
        "--dominant-framing",
        choices=VALID_FRAMINGS,
        help="Доминирующий фрейминг (по умолчанию выводится из тональности articles)",
    )
    g.add_argument(
        "--articles",
        metavar="JSON",
        help='JSON-массив статей: [{"source","headline","summary","text","sentiment","impact"}]',
    )
    g.add_argument(
        "--social-media-posts",
        metavar="JSON",
        help='JSON-массив постов: [{"platform","author","handle","content","hashtags","likes","retweets","sentiment"}]',
    )
    g.add_argument(
        "--social-media-buzz",
        metavar="JSON",
        help='JSON-массив трендов: [{"platform","trend","sentiment","volume"}]',
    )
    g.add_argument(
        "--public-opinion-shift",
        metavar="JSON",
        help='JSON-объект: {"direction","magnitude","driver"}',
    )
    g.add_argument("--llm-notes", metavar="TEXT", help="Внутренние заметки агента")

    d = parser.add_argument_group(
        "Записи дашборда (только --format context-patch)",
        "Формат NewspaperArticle / SocialMediaPost из dashboard/src/types/game.ts. "
        "Без этих флагов записи генерируются из press-решения автоматически.",
    )
    d.add_argument(
        "--news-articles",
        metavar="JSON",
        help='JSON-массив: [{"source","headline","summary","text","sentiment"}] (id/publishedAt — авто)',
    )
    d.add_argument(
        "--posts",
        metavar="JSON",
        help='JSON-массив: [{"author","handle","content","likes","retweets","hashtags"}] (id/timestamp — авто)',
    )
    d.add_argument("--id-start", type=int, metavar="N", help="Начать нумерацию article-NNN с N")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Создание валидного JSON пресс-активности (СМИ + соцсети), без записи файлов",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
ПРИМЕРЫ:
  # Press-решение для движка (печатает в stdout; перенаправьте в файл раунда)
  python3 create_press_json.py --turn 4 \\
    --headline "Третья неделя забастовки: очереди в NHS растут" \\
    --articles '[{"source":"BBC News","headline":"Переговоры в тупике","summary":"...","sentiment":"neutral"}]' \\
    --social-media-buzz '[{"platform":"twitter","trend":"#SaveOurNHS","sentiment":"pro_doctors","volume":"high"}]' \\
    --public-opinion-shift '{"direction":"towards_doctors","magnitude":3,"driver":"Рост очередей"}' \\
    --llm-notes "Давление на правительство усиливается" \\
    --json-only --compact > engine/turnDecisions/turn_04/press.json

  # Патч для context.json (newspapers + socialMedia в формате дашборда)
  python3 create_press_json.py --turn 4 --format context-patch --from-file press_04.json

  # Валидация
  python3 create_press_json.py --validate engine/turnDecisions/turn_04/press.json
  python3 create_press_json.py --validate patch.json --format context-patch

  # Показать схему полей
  python3 create_press_json.py --show-fields
        """,
    )
    parser.add_argument("--organ", choices=["press", "media"], default="press",
                        help="ID агента в решении (default: press)")
    parser.add_argument("--turn", type=int, help="Номер раунда (1-5)")
    parser.add_argument("--format", choices=["press", "context-patch"], default="press",
                        help="Формат вывода: press-решение (default) или патч context.json")
    parser.add_argument("--input", metavar="FILE", help="JSON с частичными полями press-решения")
    parser.add_argument("--from-file", metavar="FILE",
                        help="То же, что --input; принимает и готовое press-решение для context-patch")
    parser.add_argument("--context", metavar="FILE", help="Путь к context.json (для дат и id)")
    parser.add_argument("--validate", metavar="FILE", help="Проверить существующий JSON-файл")
    parser.add_argument("--compact", action="store_true", help="Компактный вывод (без отступов)")
    parser.add_argument("--json-only", action="store_true", help="Только JSON в stdout (для pipe)")
    parser.add_argument("--show-fields", action="store_true", help="Показать схему полей и выйти")
    add_field_arguments(parser)

    args = parser.parse_args()

    if args.show_fields:
        print(__doc__)
        print("Схема press-решения:")
        print(f"  обязательные: {PRESS_SCHEMA['required_fields']}")
        print(f"  опциональные: {PRESS_SCHEMA['optional_fields']}")
        print(f"  article fields: {ARTICLE_FIELDS} (обязательны {ARTICLE_REQUIRED})")
        print(f"  buzz fields: {BUZZ_FIELDS} (обязательны {BUZZ_REQUIRED})")
        print(f"  publicOpinionShift: {SHIFT_FIELDS}")
        print("Формат context-patch (дашборд):")
        print("  newspapers: id, turn, source, headline, summary, text?, sentiment, publishedAt")
        print("  socialMedia: id, turn, author, handle, avatar?, content, likes, retweets, timestamp, hashtags")
        return

    if args.validate:
        path = pathlib.Path(args.validate)
        if not path.exists():
            print(f"❌ File not found: {path}")
            sys.exit(1)
        ok, errors, kind = validate_file(path, args.format)
        if ok:
            print(f"✅ Valid {kind}: {path}")
        else:
            print(f"❌ Validation failed ({kind}):")
            for e in errors:
                print(f"   • {e}")
            sys.exit(1)
        return

    if args.turn is None:
        print("❌ Required: --turn")
        sys.exit(1)

    input_path = args.input or args.from_file
    input_data: Dict[str, Any] = {}
    if input_path:
        p = pathlib.Path(input_path)
        if not p.exists():
            print(f"❌ Input file not found: {p}")
            sys.exit(1)
        with open(p, "r", encoding="utf-8") as f:
            try:
                input_data = json.load(f)
            except json.JSONDecodeError as e:
                print(f"❌ Invalid JSON in input file: {e}")
                sys.exit(1)
        # --from-file может указывать прямо на готовое press-решение
        if input_data.get("agentName") in ("press", "media") and "articles" in input_data:
            input_data.setdefault("dominantFraming", input_data.get("dominantFraming"))

    context = load_context(pathlib.Path(args.context) if args.context else None)

    try:
        press = build_press_decision(args, input_data)
        if args.format == "context-patch":
            output = build_context_patch(args, input_data, press, context)
        else:
            output = press
    except ValidationError as e:
        if args.json_only:
            print(json.dumps({"error": str(e)}, ensure_ascii=False), file=sys.stderr)
        else:
            print("❌ Ошибка:\n   • " + str(e))
        sys.exit(1)

    pretty = not args.compact
    body = json.dumps(output, ensure_ascii=False, indent=2 if pretty else None)

    if args.json_only:
        print(body)
        return

    label = "context-patch" if args.format == "context-patch" else "press decision"
    print("\n" + "=" * 60)
    print(f"✅ VALID {label.upper()} — {args.organ}, раунд {args.turn}")
    print("=" * 60)
    print(body)
    print("=" * 60)
    if args.format == "context-patch":
        print(
            "\n💡 Слить с context.json: добавить записи в массивы `newspapers` и\n"
            "   `socialMedia` (центральный движок, после валидации всех решений).\n"
            "   НЕ ЗАПИСЫВАЙТЕ context.json напрямую из субагента."
        )
    else:
        print(
            "\n💡 Решение готово для центрального движка.\n"
            "   НЕ ЗАПИСЫВАЙТЕ ЕГО В ФАЙЛ! Движок выполнит batch save после\n"
            "   валидации всех решений (engine/turnDecisions/turn_%02d/)." % args.turn
        )


if __name__ == "__main__":
    main()
