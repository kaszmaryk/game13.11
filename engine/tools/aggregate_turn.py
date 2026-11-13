#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Агрегатор раунда для игры «Врачи против правительства: Англия, май 2026».

Читает все JSON-файлы из turnDecisions/turn_XX/, агрегирует решения,
пересчитывает метрики на основе реальных данных решений и генерирует
итоговый отчёт раунда.

ИСПОЛЬЗОВАНИЕ:
    python3 tools/aggregate_turn.py --turn 1
    python3 tools/aggregate_turn.py --turn 2
"""

import json
import pathlib
import re
import sys
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional, Tuple

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTEXT_FILE = ROOT.parent / "dashboard" / "public" / "context.json"
TURN_DECISIONS_DIR = ROOT / "turnDecisions"

# ---------------------------------------------------------------------------
# Press → Dashboard media conversion helpers
# ---------------------------------------------------------------------------

# Legacy field aliases across different turn formats
_ARTICLE_FIELD_ALIASES = {
    "title": "headline",
    "framing": "summary",
    "tone": "sentiment",
    "excerpt": "summary",
}

_SENTIMENT_ALIASES = {
    "supportive": "positive",
    "critical": "negative",
    "sympathetic_to_doctors": "positive",
    "hostile": "negative",
}

_VALID_SENTIMENTS = {"positive", "negative", "neutral"}


def _normalize_article_fields(article: dict) -> dict:
    """Map legacy press article fields to canonical dashboard format."""
    out = {}
    for key, value in article.items():
        canonical = _ARTICLE_FIELD_ALIASES.get(key, key)
        if canonical not in out:  # prefer canonical if both present
            out[canonical] = value
    # Normalize sentiment
    sent = out.get("sentiment")
    if isinstance(sent, str):
        out["sentiment"] = _SENTIMENT_ALIASES.get(sent, sent)
    return out


def _turn_start_date(context: dict, turn: int) -> datetime:
    """Get start date for a turn from turnCalendar; fallback to arithmetic."""
    cal = context.get("turnCalendar", [])
    for entry in cal:
        if isinstance(entry, dict) and entry.get("turn") == turn:
            iso = entry.get("startDate")
            if iso:
                try:
                    return datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
                except ValueError:
                    pass
    # Fallback: turn 1 = 2026-05-27, each turn = +7 days
    base = datetime(2026, 5, 27, tzinfo=timezone.utc)
    return base + timedelta(days=max(0, turn - 1) * 7)


def _next_id_counters(context: dict) -> Tuple[int, int]:
    """Find max numeric suffixes in existing newspaper/socialMedia ids."""
    def _max_counter(items: list, prefix: str) -> int:
        mx = 0
        for item in items or []:
            if isinstance(item, dict):
                ident = str(item.get("id", ""))
                if ident.startswith(prefix):
                    digits = "".join(c for c in ident[len(prefix):] if c.isdigit())
                    if digits:
                        mx = max(mx, int(digits))
        return mx
    return (
        _max_counter(context.get("newspapers", []), "article-"),
        _max_counter(context.get("socialMedia", []), "tweet-"),
    )


def extract_dashboard_media(
    press_decision: dict,
    turn: int,
    context: dict,
) -> Tuple[List[dict], List[dict]]:
    """
    Convert a press/media decision into dashboard-format newspapers and socialMedia.

    Handles all known press decision schemas (turns 1–3+):
      - articles with headline/summary/text/sentiment OR title/tone/excerpt
      - socialMediaBuzz (platform/trend/sentiment/volume)
      - socialMediaPosts (platform/content/engagement/sentiment)
      - leaks, viralStories, patientStatements → social media posts

    Returns:
        (newspapers, social_media_posts) — lists of dicts matching
        NewspaperArticle and SocialMediaPost from dashboard/src/types/game.ts
    """
    base_dt = _turn_start_date(context, turn)
    art_counter, post_counter = _next_id_counters(context)

    newspapers: List[dict] = []
    social_posts: List[dict] = []

    # --- Articles → Newspapers ---
    raw_articles = press_decision.get("articles", [])
    for i, raw in enumerate(raw_articles):
        if not isinstance(raw, dict):
            continue
        norm = _normalize_article_fields(raw)
        headline = norm.get("headline", "")
        source = norm.get("source", "Unknown")
        if not headline:
            continue

        art_counter += 1
        summary = norm.get("summary", "")
        text = norm.get("text", "")
        sentiment = norm.get("sentiment", "neutral")
        if sentiment not in _VALID_SENTIMENTS:
            sentiment = "neutral"

        newspapers.append({
            "id": f"article-{art_counter:03d}",
            "turn": turn,
            "source": source,
            "headline": headline,
            "summary": summary or text[:220],
            "text": text or summary,
            "sentiment": sentiment,
            "publishedAt": (base_dt + timedelta(hours=8, minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        })

    # --- socialMediaPosts → Social Media ---
    smp = press_decision.get("socialMediaPosts", [])
    if isinstance(smp, list):
        for i, post in enumerate(smp):
            if not isinstance(post, dict):
                continue
            content = str(post.get("content", ""))
            if not content:
                continue
            post_counter += 1
            platform = str(post.get("platform", "Twitter"))
            engagement = post.get("engagement", post.get("likes", 0))
            # Prefer explicit hashtags field; fall back to extracting from content
            raw_hashtags = post.get("hashtags")
            if isinstance(raw_hashtags, list):
                hashtags = [str(h) for h in raw_hashtags if str(h).startswith("#")]
            else:
                hashtags = [w for w in content.split() if w.startswith("#")]
            social_posts.append({
                "id": f"tweet-{post_counter:03d}",
                "turn": turn,
                "author": post.get("author", f"Пользователь {platform}"),
                "handle": post.get("handle", f"{platform.lower()}_пользователь").lstrip("@"),
                "avatar": "",
                "content": content,
                "likes": int(engagement) if isinstance(engagement, (int, float)) else 0,
                "retweets": int(post.get("retweets", int(engagement) // 3 if isinstance(engagement, (int, float)) else 0)),
                "timestamp": (base_dt + timedelta(hours=7, minutes=i * 15)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hashtags": hashtags,
            })

    # --- socialMediaBuzz → Social Media (trend-based) ---
    buzz = press_decision.get("socialMediaBuzz", [])
    if isinstance(buzz, list):
        volume_likes = {"low": 500, "medium": 5000, "high": 20000}
        for i, b in enumerate(buzz):
            if not isinstance(b, dict):
                continue
            trend = str(b.get("trend", ""))
            if not trend:
                continue
            post_counter += 1
            platform = str(b.get("platform", "twitter"))
            likes = volume_likes.get(b.get("volume", "medium"), 5000)
            # Positioning only through hashtags - extract from trend
            hashtags = [w for w in trend.split() if w.startswith("#")]
            # Content should be the trend itself without extra markers
            content_text = trend
            social_posts.append({
                "id": f"tweet-{post_counter:03d}",
                "turn": turn,
                "author": "Тренд соцсетей",
                "handle": f"{platform}_тренды",
                "avatar": "",
                "content": content_text,
                "likes": likes,
                "retweets": likes // 3,
                "timestamp": (base_dt + timedelta(hours=9, minutes=i)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hashtags": hashtags,
            })

    # --- leaks → Social Media ---
    leaks = press_decision.get("leaks", [])
    if isinstance(leaks, list):
        for i, leak in enumerate(leaks):
            text = leak if isinstance(leak, str) else str(leak)
            if not text or len(text) < 10:
                continue
            post_counter += 1
            # Positioning only through hashtags, no emoji prefixes or markers
            content_text = text[:280]
            hashtags = ["#NHSleaks"]
            # Extract any existing hashtags from content
            content_hashtags = [w for w in content_text.split() if w.startswith("#")]
            hashtags.extend(content_hashtags)
            social_posts.append({
                "id": f"tweet-{post_counter:03d}",
                "turn": turn,
                "author": "Анонимный источник",
                "handle": "nhs_leaks",
                "avatar": "",
                "content": content_text,
                "likes": 12000,
                "retweets": 4500,
                "timestamp": (base_dt + timedelta(hours=10, minutes=i * 30)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hashtags": list(set(hashtags)),  # deduplicate
            })

    # --- viralStories → Social Media ---
    viral = press_decision.get("viralStories", [])
    if isinstance(viral, list):
        for i, story in enumerate(viral):
            text = story if isinstance(story, str) else str(story)
            if not text or len(text) < 10:
                continue
            post_counter += 1
            # Positioning only through hashtags, no emoji prefixes or markers
            content_text = text[:280]
            hashtags = [w for w in content_text.split() if w.startswith("#")]
            if not hashtags:
                hashtags = ["#NHS", "#Viral"]
            social_posts.append({
                "id": f"tweet-{post_counter:03d}",
                "turn": turn,
                "author": "Вирусный контент",
                "handle": "viral_nhs",
                "avatar": "",
                "content": content_text,
                "likes": 25000,
                "retweets": 8000,
                "timestamp": (base_dt + timedelta(hours=11, minutes=i * 20)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hashtags": hashtags,
            })

    # --- patientStatements → Social Media ---
    patients = press_decision.get("patientStatements", [])
    if isinstance(patients, list):
        for i, stmt in enumerate(patients):
            text = stmt if isinstance(stmt, str) else str(stmt)
            if not text or len(text) < 10:
                continue
            post_counter += 1
            content_text = text[:280]
            # Positioning only through hashtags - extract from content or use defaults
            hashtags = [w for w in content_text.split() if w.startswith("#")]
            if not hashtags:
                hashtags = ["#NHS", "#PatientsFirst"]
            social_posts.append({
                "id": f"tweet-{post_counter:03d}",
                "turn": turn,
                "author": "Пациентская организация",
                "handle": "patients_voice",
                "avatar": "",
                "content": content_text,
                "likes": 3000,
                "retweets": 1000,
                "timestamp": (base_dt + timedelta(hours=12, minutes=i * 15)).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hashtags": hashtags,
            })

    return newspapers, social_posts


# ---------------------------------------------------------------------------
# Organ decision → Dashboard Decision[] conversion
# ---------------------------------------------------------------------------

# Human-readable organ names for the dashboard
_ORGAN_DISPLAY_NAMES = {
    "rdc": "RDC — Забастовочный комитет",
    "bma_council": "BMA UK Committee",
    "bma-uk": "BMA UK Committee",
    "dhsc": "DHSC + NHS Employers",
    "hmt": "HMT + Даунинг-стрит",
    "providers": "NHS Providers",
    "aomrc": "AoMRC — Академия колледжей",
    "ddrb": "DDRB",
    "base": "Членская база BMA",
    "press": "Пресса",
}


def _extract_action_summary(decision: dict) -> str:
    """Extract a concise action summary from an organ decision."""
    # Try publicStatement first (most common)
    stmt = decision.get("publicStatement", "")
    if isinstance(stmt, str) and stmt.strip():
        return stmt.strip()[:200]

    # Try position / publicNarrative
    for field in ("position", "publicNarrative"):
        val = decision.get(field, "")
        if isinstance(val, str) and val.strip():
            return val.strip()[:200]

    # Base organ: use sentiment + key concerns
    sentiment = decision.get("sentiment", "")
    if isinstance(sentiment, str) and sentiment.strip():
        concerns = decision.get("keyConcerns", [])
        if concerns:
            concern_text = ", ".join(str(c) for c in concerns[:3])
            return f"Настроение базы: {sentiment}. Ключевые вопросы: {concern_text}"[:200]
        return f"Настроение базы: {sentiment}"[:200]
    elif isinstance(sentiment, dict):
        overall = sentiment.get("overall", "")
        if overall:
            return f"Настроение базы: {overall}"[:200]

    # DDRB: use recommendation
    rec = _safe_get(decision, "recommendation", default={})
    if rec:
        avg_pay = rec.get("avgPayIncrease")
        rationale = rec.get("rationale", "")
        if avg_pay is not None:
            return f"DDRB рекомендует {avg_pay}% повышения. {rationale}"[:200]
        elif rationale:
            return f"DDRB: {rationale}"[:200]

    # Fallback: first action
    actions = decision.get("actions", [])
    if isinstance(actions, list) and actions:
        first = actions[0]
        if isinstance(first, dict):
            return first.get("description", first.get("type", ""))[:200]
        elif isinstance(first, str):
            return first[:200]

    return "Позиция не сформулирована"


def _extract_impact(decision: dict, organ_id: str) -> str:
    """Derive a short impact description from the decision content."""
    parts = []

    # Negotiation red line or demand
    neg = _safe_get(decision, "negotiation", default={})
    if neg.get("redLine"):
        parts.append(neg["redLine"][:150])
    elif neg.get("demand"):
        parts.append(neg["demand"][:150])

    # Operational impact (providers)
    ops = _safe_get(decision, "operationalImpact", default={})
    if ops.get("estimatedCancellations"):
        parts.append(f"{ops['estimatedCancellations']} отменённых приёмов")
    if ops.get("locumCosts"):
        parts.append(f"locum {ops['locumCosts']}")

    # Strike action (RDC)
    strike = _safe_get(decision, "strikeAction", default={})
    if strike.get("daysAffected"):
        parts.append(f"Забастовка: {strike['daysAffected']} дн.")

    # Base sentiment
    unity = decision.get("unityLevel")
    if unity is not None:
        parts.append(f"Единство базы: {unity}%")

    # Offer details (DHSC)
    offer = _safe_get(decision, "offerDetails", default={})
    if offer.get("trainingPlaces"):
        parts.append(f"{offer['trainingPlaces']} мест ординатуры")
    if offer.get("examFeesCompensated"):
        parts.append("Компенсация экзаменационных сборов")

    return "; ".join(parts) if parts else "Влияние на конфликт уточняется"


def _extract_description(decision: dict) -> str:
    """Build a longer description from negotiation details and actions."""
    parts = []

    neg = _safe_get(decision, "negotiation", default={})
    if neg.get("offer"):
        parts.append(f"Оферта: {neg['offer']}")
    if neg.get("demand"):
        parts.append(f"Требование: {neg['demand']}")

    # Actions list
    actions = decision.get("actions", [])
    if isinstance(actions, list):
        action_texts = []
        for a in actions[:5]:  # limit to 5 actions
            if isinstance(a, dict):
                desc = a.get("description", "")
                if desc:
                    action_texts.append(desc)
            elif isinstance(a, str) and len(a) > 5:
                action_texts.append(a)
        if action_texts:
            parts.append("Действия: " + "; ".join(action_texts))

    # Stance on offer
    stance = _safe_get(decision, "stanceOnOffer", default={})
    if stance.get("recommendation") and stance.get("reason"):
        parts.append(f"Рекомендация: {stance['recommendation']} — {stance['reason']}")

    return "\n".join(parts) if parts else "Детали решения не указаны"


def extract_decisions_for_dashboard(
    decisions: Dict[str, dict],
    turn: int,
    context: dict,
) -> List[dict]:
    """
    Convert organ turn-decision JSON files into dashboard Decision[] format.

    Each organ's decision produces one entry in the dashboard's decisions array.
    The press organ is skipped (its content goes into newspapers/socialMedia).

    Returns a list of dicts matching the Decision interface from
    dashboard/src/types/game.ts:
        { turn, date, actor, action, impact, description }
    """
    base_dt = _turn_start_date(context, turn)
    # Use end-of-turn date for the decision timestamp
    decision_date = (base_dt + timedelta(days=6)).strftime("%Y-%m-%dT%H:%M:%SZ")

    result = []
    skip_organs = {"press"}  # press → newspapers/socialMedia, not decisions

    for organ_id, decision in sorted(decisions.items()):
        if organ_id in skip_organs:
            continue
        if "error" in decision:
            continue

        actor = _ORGAN_DISPLAY_NAMES.get(organ_id, organ_id.upper())
        action = _extract_action_summary(decision)
        impact = _extract_impact(decision, organ_id)
        description = _extract_description(decision)

        result.append({
            "turn": turn,
            "date": decision_date,
            "actor": actor,
            "action": action,
            "impact": impact,
            "description": description,
        })

    return result


def build_context_decisions_patch(
    context: dict,
    decisions: Dict[str, dict],
    turn: int,
) -> List[dict]:
    """
    Extract dashboard-format decisions from organ decisions and merge with
    existing context.decisions[].

    Deduplicates by (turn, actor) to prevent duplicates on re-aggregation.
    """
    new_entries = extract_decisions_for_dashboard(decisions, turn, context)
    existing = list(context.get("decisions", []))

    # Build dedup key set from existing entries
    existing_keys = set()
    for d in existing:
        if isinstance(d, dict):
            existing_keys.add((d.get("turn"), d.get("actor")))

    for entry in new_entries:
        key = (entry["turn"], entry["actor"])
        if key not in existing_keys:
            existing.append(entry)
            existing_keys.add(key)

    return existing


def build_context_media_patch(
    context: dict,
    decisions: Dict[str, dict],
    turn: int,
) -> Tuple[List[dict], List[dict]]:
    """
    Extract media from press decision and merge with existing context arrays.

    Returns updated (newspapers, socialMedia) lists ready to replace
    the corresponding fields in context.json.
    """
    press = decisions.get("press", {})
    if not press or "error" in press:
        return context.get("newspapers", []), context.get("socialMedia", [])

    new_articles, new_posts = extract_dashboard_media(press, turn, context)

    # Merge: append new items, deduplicate by id AND by content
    existing_articles = list(context.get("newspapers", []))
    existing_posts = list(context.get("socialMedia", []))

    existing_art_ids = {a.get("id") for a in existing_articles if isinstance(a, dict)}
    existing_art_headlines = {
        a.get("headline", "").strip().lower()
        for a in existing_articles if isinstance(a, dict) and a.get("headline")
    }
    for art in new_articles:
        headline_key = art.get("headline", "").strip().lower()
        if art["id"] not in existing_art_ids and headline_key not in existing_art_headlines:
            existing_articles.append(art)
            existing_art_headlines.add(headline_key)

    existing_post_ids = {p.get("id") for p in existing_posts if isinstance(p, dict)}
    existing_post_contents = {
        p.get("content", "").strip().lower()
        for p in existing_posts if isinstance(p, dict) and p.get("content")
    }
    for post in new_posts:
        content_key = post.get("content", "").strip().lower()
        if post["id"] not in existing_post_ids and content_key not in existing_post_contents:
            existing_posts.append(post)
            existing_post_contents.add(content_key)

    return existing_articles, existing_posts


def load_context() -> dict:
    """Загрузить актуальный context.json."""
    with open(CONTEXT_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_all_decisions(turn: int) -> Dict[str, dict]:
    """Загрузить все решения агентов за указанный раунд."""
    turn_dir = TURN_DECISIONS_DIR / f"turn_{turn:02d}"
    if not turn_dir.exists():
        raise FileNotFoundError(f"Turn directory not found: {turn_dir}")

    decisions = {}
    for json_file in sorted(turn_dir.glob("*.json")):
        organ_id = json_file.stem
        with open(json_file, "r", encoding="utf-8") as f:
            try:
                decisions[organ_id] = json.load(f)
            except json.JSONDecodeError as e:
                print(f"⚠️  Ошибка парсинга {json_file.name}: {e}")
                decisions[organ_id] = {"error": "invalid_json", "fallback": "status_quo"}

    return decisions


def _safe_get(d: dict, *keys, default=None):
    """Безопасно извлечь вложенное значение из словаря."""
    current = d
    for key in keys:
        if isinstance(current, dict):
            current = current.get(key, default)
        else:
            return default
    return current if current is not None else default


def _extract_offer_details(decisions: Dict[str, dict]) -> dict:
    """Извлечь детали оферты из решений DHSC и HMT."""
    dhsc = decisions.get("dhsc", {})
    hmt = decisions.get("hmt", {})

    offer = _safe_get(dhsc, "offerDetails", default={})
    negotiation = _safe_get(dhsc, "negotiation", default={})

    avg_pay = offer.get("avgPayIncrease")
    if avg_pay is None:
        # Fallback: check if newOffer exists (turn 1 format)
        new_offer = dhsc.get("newOffer")
        if isinstance(new_offer, dict):
            avg_pay = new_offer.get("avgPayIncrease")

    training_places = offer.get("trainingPlaces")
    exam_fees = offer.get("examFeesCompensated", False)

    # Check HMT approval status
    hmt_approval = _safe_get(hmt, "approvalStatus", default="not_requested")
    hmt_negotiation = _safe_get(hmt, "negotiation", default={})

    return {
        "avgPayIncrease": avg_pay,
        "trainingPlaces": training_places,
        "examFeesCompensated": exam_fees,
        "hmtApproval": hmt_approval,
        "dhscOfferText": negotiation.get("offer", ""),
        "hmtOfferText": hmt_negotiation.get("offer", ""),
    }


def _extract_base_sentiment(decisions: Dict[str, dict]) -> dict:
    """Извлечь настроение базы из решений base."""
    base = decisions.get("base", {})

    unity = base.get("unityLevel")
    if unity is None:
        # Turn 1 format: sentiment is a nested object
        sentiment = base.get("sentiment")
        if isinstance(sentiment, dict):
            unity = 75  # Default from turn 1 context
        elif isinstance(sentiment, str):
            unity = 75

    referendum = _safe_get(base, "referendumProjection", default={})
    sentiment_text = base.get("sentiment", "")
    if isinstance(sentiment_text, dict):
        sentiment_text = sentiment_text.get("overall", "")

    return {
        "unityLevel": unity,
        "sentiment": sentiment_text,
        "referendumYes": referendum.get("projectedYes"),
        "referendumTurnout": referendum.get("projectedTurnout"),
        "keyConcerns": base.get("keyConcerns", []),
    }


def _extract_operational_impact(decisions: Dict[str, dict]) -> dict:
    """Извлечь операционные данные из решений providers."""
    providers = decisions.get("providers", {})
    impact = _safe_get(providers, "operationalImpact", default={})

    return {
        "cancellations": impact.get("estimatedCancellations", 0),
        "locumCosts": impact.get("locumCosts", "£0"),
        "emergencyCoverage": impact.get("emergencyCoverage", "stable"),
    }


def _extract_press_framing(decisions: Dict[str, dict]) -> dict:
    """Извлечь фрейминг прессы из решений press."""
    press = decisions.get("press", {})
    framing = press.get("dominantFraming", "mixed")
    articles = press.get("articles", [])

    sentiments = [a.get("sentiment", "neutral") for a in articles if isinstance(a, dict)]
    positive = sum(1 for s in sentiments if s == "positive")
    negative = sum(1 for s in sentiments if s == "negative")
    neutral = sum(1 for s in sentiments if s == "neutral")

    return {
        "dominantFraming": framing,
        "articleCount": len(articles),
        "positiveArticles": positive,
        "negativeArticles": negative,
        "neutralArticles": neutral,
    }


def calculate_metrics(context: dict, decisions: Dict[str, dict], turn: int) -> dict:
    """
    Пересчитать метрики на основе реальных решений всех органов.

    Динамически анализирует содержимое решений для каждого органа
    и вычисляет изменения метрик относительно предыдущего контекста.
    """
    prev = context.get("metrics", {})

    offer = _extract_offer_details(decisions)
    base = _extract_base_sentiment(decisions)
    ops = _extract_operational_impact(decisions)
    press = _extract_press_framing(decisions)

    rdc = decisions.get("rdc", {})
    hmt = decisions.get("hmt", {})
    aomrc = decisions.get("aomrc", {})
    bma = decisions.get("bma_council", {})
    ddrb = decisions.get("ddrb", {})

    # --- strikeDaysScheduled ---
    strike_action = _safe_get(rdc, "strikeAction", default={})
    if strike_action.get("daysAffected"):
        strike_days = strike_action["daysAffected"]
    else:
        # Check if actions mention strike days
        strike_days = prev.get("strikeDaysScheduled", 4)

    # --- averagePayIncrease ---
    if offer["avgPayIncrease"] is not None:
        avg_pay = offer["avgPayIncrease"]
    else:
        # DDRB recommendation as baseline
        ddrb_rec = _safe_get(ddrb, "recommendation", default={})
        avg_pay = ddrb_rec.get("avgPayIncrease", prev.get("averagePayIncrease", 4.9))

    # --- trainingPlacesOffered ---
    if offer["trainingPlaces"] is not None:
        training_places = offer["trainingPlaces"]
    else:
        # Check AoMRC recommendations
        expert = _safe_get(aomrc, "expertAssessment", default={})
        recommended = expert.get("recommendedPlaces")
        if recommended is not None:
            training_places = recommended
        else:
            training_places = prev.get("trainingPlacesOffered", 4000)

    # --- examFeesCompensated ---
    if offer["examFeesCompensated"]:
        exam_fees = 1
    else:
        exam_fees = prev.get("examFeesCompensated", 0)

    # --- payRestorationGap ---
    # Stays unless there's a concrete pay restoration commitment
    pay_gap = prev.get("payRestorationGap", 20)
    dhsc_negotiation = _safe_get(decisions.get("dhsc", {}), "negotiation", default={})
    rdc_negotiation = _safe_get(rdc, "negotiation", default={})
    # If DHSC offers pay restoration roadmap and RDC acknowledges it, gap may shrink
    if "pay restoration" in dhsc_negotiation.get("offer", "").lower() and \
       "pay restoration" in rdc_negotiation.get("offer", "").lower():
        pay_gap = max(pay_gap - 2, 10)  # Small improvement if both sides engage

    # --- baseUnity ---
    if base["unityLevel"] is not None:
        base_unity = base["unityLevel"]
    else:
        base_unity = prev.get("baseUnity", 75)
        # Adjust based on RDC internal communication actions
        rdc_actions = rdc.get("actions", [])
        if isinstance(rdc_actions, list):
            for action in rdc_actions:
                desc = ""
                if isinstance(action, dict):
                    desc = action.get("description", "") + action.get("type", "")
                elif isinstance(action, str):
                    desc = action
                if any(kw in desc.lower() for kw in ["встреч", "консультаци", "межуровнев", "грейд"]):
                    base_unity = min(base_unity + 2, 100)
                    break

    # --- publicSupport ---
    public_support = prev.get("publicSupport", 55)
    if press["negativeArticles"] > press["positiveArticles"]:
        delta = -(press["negativeArticles"] - press["positiveArticles"])
        public_support = max(public_support + delta, 10)
    elif press["positiveArticles"] > press["negativeArticles"]:
        delta = press["positiveArticles"] - press["negativeArticles"]
        public_support = min(public_support + delta, 100)

    # --- governmentStability ---
    gov_stability = prev.get("governmentStability", 60)
    # Leaks and negative press reduce stability
    if press["negativeArticles"] > 0:
        gov_stability = max(gov_stability - press["negativeArticles"], 10)
    # HMT conditional approval can stabilize
    if offer["hmtApproval"] == "conditional":
        gov_stability = min(gov_stability + 1, 100)

    # --- waitingListImpact ---
    if ops["cancellations"] > 0:
        # Convert cancellations to impact score (thousands → points)
        wl_impact = min(ops["cancellations"] // 1000, 100)
    else:
        wl_impact = prev.get("waitingListImpact", 0)

    # --- monthsToMandateExpiry ---
    months_mandate = prev.get("monthsToMandateExpiry", 3)
    # Decreases each turn naturally
    months_mandate = max(months_mandate - 1, 0) if turn > 1 else months_mandate

    # --- referendumProjection ---
    if base["referendumYes"] is not None:
        ref_projection = base["referendumYes"]
    else:
        ref_projection = prev.get("referendumProjection", 45)
        # Adjust based on whether there's an offer on the table
        if offer["avgPayIncrease"] is not None and offer["avgPayIncrease"] >= 7:
            ref_projection = min(ref_projection + 10, 95)
        elif offer["avgPayIncrease"] is None:
            ref_projection = max(ref_projection - 3, 10)

    # --- reballotRisk ---
    reballot_risk = prev.get("reballotRisk", 10)
    if base_unity < 60:
        reballot_risk = min(reballot_risk + 5, 100)
    elif base_unity > 80:
        reballot_risk = max(reballot_risk - 2, 0)
    # Polarization increases risk
    if press["negativeArticles"] > 2:
        reballot_risk = min(reballot_risk + 2, 100)

    new_metrics = {
        "strikeDaysScheduled": strike_days,
        "averagePayIncrease": avg_pay,
        "trainingPlacesOffered": training_places,
        "examFeesCompensated": exam_fees,
        "payRestorationGap": pay_gap,
        "baseUnity": base_unity,
        "publicSupport": public_support,
        "governmentStability": gov_stability,
        "waitingListImpact": wl_impact,
        "monthsToMandateExpiry": months_mandate,
        "referendumProjection": ref_projection,
        "reballotRisk": reballot_risk,
    }

    return new_metrics


def generate_narrative(turn: int, decisions: Dict[str, dict], metrics_changes: dict) -> str:
    """Сгенерировать политический репортаж о раунде на основе реальных решений."""
    rdc = decisions.get("rdc", {})
    dhsc = decisions.get("dhsc", {})
    hmt = decisions.get("hmt", {})
    aomrc = decisions.get("aomrc", {})
    providers = decisions.get("providers", {})
    press = decisions.get("press", {})
    base = decisions.get("base", {})
    bma = decisions.get("bma_council", {})

    # Get turn calendar info
    period_map = {
        1: ("27 мая — 3 июня 2026", "Ультиматум и подготовка забастовки"),
        2: ("4 июня — 11 июня 2026", "Эскалация / закулисье / лимит Казначейства"),
        3: ("12 июня — 19 июня 2026", "Окно забастовки 15–19.06; оферта или срыв"),
        4: ("20 июня — 27 июня 2026", "Референдум или эскалация"),
        5: ("28 июня — 5 июля 2026", "Развязка: ратификация или июльские забастовки"),
    }
    period, phase = period_map.get(turn, (f"Раунд {turn}", "Неизвестная фаза"))

    parts = [f"Раунд {turn} ({period}): {phase}.\n\n"]

    # RDC narrative
    rdc_statement = rdc.get("publicStatement", "")
    rdc_position = rdc.get("position", "")
    rdc_negotiation = _safe_get(rdc, "negotiation", default={})
    if rdc_statement:
        parts.append(f"RDC: {rdc_statement}\n\n")
    elif rdc_position:
        parts.append(f"RDC занял позицию: {rdc_position}\n\n")
    if rdc_negotiation.get("demand"):
        parts.append(f"Требования RDC: {rdc_negotiation['demand']}.\n\n")

    # DHSC narrative
    dhsc_statement = dhsc.get("publicStatement", "")
    dhsc_narrative = dhsc.get("publicNarrative", "")
    dhsc_negotiation = _safe_get(dhsc, "negotiation", default={})
    if dhsc_statement:
        parts.append(f"DHSC: {dhsc_statement}\n\n")
    elif dhsc_narrative:
        parts.append(f"Правительство: {dhsc_narrative}\n\n")
    if dhsc_negotiation.get("offer"):
        parts.append(f"Оферта DHSC: {dhsc_negotiation['offer']}.\n\n")

    # HMT narrative
    hmt_statement = hmt.get("publicStatement", "")
    hmt_negotiation = _safe_get(hmt, "negotiation", default={})
    if hmt_statement:
        parts.append(f"Казначейство: {hmt_statement}\n\n")
    elif hmt_negotiation.get("offer"):
        parts.append(f"Позиция HMT: {hmt_negotiation['offer']}.\n\n")

    # BMA Council
    bma_statement = bma.get("publicStatement", "")
    if bma_statement:
        parts.append(f"BMA Council: {bma_statement}\n\n")

    # AoMRC
    aomrc_statement = aomrc.get("publicStatement", "")
    aomrc_recs = aomrc.get("recommendations", [])
    if aomrc_statement:
        parts.append(f"AoMRC: {aomrc_statement}\n\n")
    if aomrc_recs:
        parts.append("Рекомендации AoMRC: " + "; ".join(aomrc_recs) + ".\n\n")

    # Providers
    prov_statement = providers.get("publicStatement", "")
    ops_impact = _safe_get(providers, "operationalImpact", default={})
    if prov_statement:
        parts.append(f"NHS Providers: {prov_statement}\n\n")
    if ops_impact.get("estimatedCancellations"):
        parts.append(
            f"Операционный ущерб: {ops_impact['estimatedCancellations']} отменённых приёмов, "
            f"расходы на locum {ops_impact.get('locumCosts', 'N/A')}.\n\n"
        )

    # Press
    press_articles = press.get("articles", [])
    if press_articles:
        headlines = [a.get("headline", "") for a in press_articles[:3] if isinstance(a, dict)]
        if headlines:
            parts.append("Заголовки прессы: " + "; ".join(headlines) + ".\n\n")

    # Base sentiment
    base_sentiment = base.get("sentiment", "")
    if isinstance(base_sentiment, str) and base_sentiment:
        parts.append(f"Настроение базы: {base_sentiment}.\n\n")
    elif isinstance(base_sentiment, dict):
        overall = base_sentiment.get("overall", "")
        if overall:
            parts.append(f"Настроение базы: {overall}.\n\n")

    return "".join(parts).strip()


def generate_events(turn: int, decisions: Dict[str, dict]) -> List[dict]:
    """Сгенерировать ключевые события раунда из реальных решений."""
    events = []

    for organ_id, decision in decisions.items():
        if "error" in decision:
            continue

        # Extract from negotiation
        negotiation = _safe_get(decision, "negotiation", default={})
        if negotiation.get("offer"):
            organ_name = organ_id.upper()
            events.append({
                "name": f"{organ_name}: {negotiation['offer'][:100]}",
                "effect": negotiation.get("redLine", "Переговорная позиция уточнена"),
                "organ": organ_id,
            })

        # Extract from actions (both formats)
        actions = decision.get("actions", [])
        if isinstance(actions, list):
            for action in actions:
                if isinstance(action, dict):
                    desc = action.get("description", "")
                    action_type = action.get("type", "")
                    if desc:
                        events.append({
                            "name": desc[:120],
                            "effect": f"Действие органа {organ_id} ({action_type})" if action_type else f"Действие органа {organ_id}",
                            "organ": organ_id,
                        })
                elif isinstance(action, str) and len(action) > 10:
                    events.append({
                        "name": action[:120],
                        "effect": f"Действие органа {organ_id}",
                        "organ": organ_id,
                    })

        # Extract from press articles
        if organ_id == "press":
            articles = decision.get("articles", [])
            for article in articles:
                if isinstance(article, dict) and article.get("headline"):
                    events.append({
                        "name": article["headline"],
                        "effect": article.get("impact", "Медиа-освещение"),
                        "organ": "press",
                    })

        # Extract operational impact from providers
        if organ_id == "providers":
            ops = _safe_get(decision, "operationalImpact", default={})
            if ops.get("estimatedCancellations"):
                events.append({
                    "name": f"NHS Providers: {ops['estimatedCancellations']} отменённых приёмов",
                    "effect": f"Расходы на locum: {ops.get('locumCosts', 'N/A')}",
                    "organ": "providers",
                })

        # Extract DDRB recommendation
        if organ_id == "ddrb":
            rec = _safe_get(decision, "recommendation", default={})
            if rec.get("avgPayIncrease"):
                events.append({
                    "name": f"DDRB рекомендация: {rec['avgPayIncrease']}% повышения",
                    "effect": rec.get("rationale", "Независимая экспертная оценка"),
                    "organ": "ddrb",
                })

    # Deduplicate by name
    seen = set()
    unique_events = []
    for event in events:
        if event["name"] not in seen:
            seen.add(event["name"])
            unique_events.append(event)

    return unique_events


def build_negotiations_map(decisions: Dict[str, dict]) -> dict:
    """Построить карту переговоров из реальных решений органов."""
    negotiations_map = {}

    negotiable_organs = ["rdc", "dhsc", "hmt", "bma_council", "providers", "aomrc"]

    for organ_id in negotiable_organs:
        decision = decisions.get(organ_id, {})
        negotiation = _safe_get(decision, "negotiation", default={})

        if negotiation:
            negotiations_map[organ_id] = {
                "talksWith": negotiation.get("talksWith", []),
                "offer": negotiation.get("offer", "Нет конкретной оферты"),
                "demand": negotiation.get("demand", "Не указано"),
                "position": negotiation.get("redLine", "Позиция не определена"),
            }
        else:
            # Fallback: extract from other fields
            position = decision.get("position", "")
            demands = decision.get("demands", [])
            public_narrative = decision.get("publicNarrative", "")
            public_statement = decision.get("publicStatement", "")

            entry = {
                "talksWith": [],
                "offer": public_statement or public_narrative or "Нет публичной позиции",
                "demand": "; ".join(demands) if demands else "Не указано",
                "position": position or "Позиция не определена",
            }
            negotiations_map[organ_id] = entry

    return negotiations_map


def build_referendum_projection(decisions: Dict[str, dict], new_metrics: dict) -> dict:
    """Построить прогноз референдума из реальных данных."""
    base = decisions.get("base", {})
    ref = _safe_get(base, "referendumProjection", default={})

    offer_on_table = new_metrics.get("averagePayIncrease", 0) > 5

    if ref:
        return {
            "offerDescription": ref.get("keyFactor", "Оферта не представлена"),
            "projectedYes": ref.get("projectedYes", new_metrics.get("referendumProjection", 45)),
            "projectedTurnout": ref.get("projectedTurnout", 65),
            "passes": ref.get("passes"),
            "keyFactor": ref.get("keyFactor", "Нет данных"),
        }
    else:
        projected_yes = new_metrics.get("referendumProjection", 45)
        return {
            "offerDescription": "Мартовская оферта (4.9%) отклонена, новой оферты нет" if not offer_on_table
                                else f"Текущая оферта: {new_metrics.get('averagePayIncrease', 0)}%",
            "projectedYes": projected_yes,
            "projectedTurnout": 65,
            "passes": projected_yes > 50 if offer_on_table else None,
            "keyFactor": "База требует минимум 10% с привязкой к pay restoration",
        }


def build_response(turn: int, context: dict, decisions: Dict[str, dict], new_metrics: dict) -> dict:
    """Построить итоговый JSON-ответ раунда."""
    narrative = generate_narrative(turn, decisions, new_metrics)
    events = generate_events(turn, decisions)
    negotiations_map = build_negotiations_map(decisions)
    referendum_projection = build_referendum_projection(decisions, new_metrics)

    # Agent response tracking
    agent_responses_received = list(decisions.keys())
    agent_errors = [k for k, v in decisions.items() if "error" in v]

    # Round summary
    total_organs = len(decisions)
    error_count = len(agent_errors)
    summary_parts = [f"Все {total_organs} органов приняли решения за Раунд {turn}."]
    if error_count > 0:
        summary_parts.append(f"{error_count} органов вернули ошибки: {', '.join(agent_errors)}.")

    # Add key highlights from decisions
    rdc_neg = _safe_get(decisions.get("rdc", {}), "negotiation", default={})
    dhsc_neg = _safe_get(decisions.get("dhsc", {}), "negotiation", default={})
    if rdc_neg.get("demand"):
        summary_parts.append(f"RDC: {rdc_neg['demand'][:80]}.")
    if dhsc_neg.get("offer"):
        summary_parts.append(f"DHSC: {dhsc_neg['offer'][:80]}.")

    round_summary = " ".join(summary_parts)

    # Game over conditions
    is_game_over = False
    game_over_message = None
    if turn >= 5:
        is_game_over = True
        if referendum_projection.get("passes"):
            game_over_message = "Оферта принята на референдуме. Конфликт завершён."
        else:
            game_over_message = "Мандат истёк или оферта отклонена. Забастовки продолжаются."

    # Extract media for dashboard context
    updated_newspapers, updated_social_media = build_context_media_patch(
        context, decisions, turn
    )

    # Extract decisions for dashboard context
    updated_decisions = build_context_decisions_patch(context, decisions, turn)

    response = {
        "turn": turn,
        "roundSummary": round_summary,
        "narrative": narrative,
        "events": events,
        "negotiationsMap": negotiations_map,
        "referendumProjection": referendum_projection,
        "turnMetrics": new_metrics,
        "hiddenMetricsUpdates": {},
        "organScores": {},
        "agentResponsesReceived": agent_responses_received,
        "agentErrors": agent_errors,
        "isGameOver": is_game_over,
        "gameOverMessage": game_over_message,
        "clarification_request": None,
        # Dashboard media arrays (merged with existing context)
        "newspapers": updated_newspapers,
        "socialMedia": updated_social_media,
        # Dashboard decisions array (merged with existing context)
        "decisions": updated_decisions,
    }

    return response


def main():
    """CLI entry point."""
    import argparse
    parser = argparse.ArgumentParser(
        description="NHS Game Turn Aggregator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
ПРИМЕРЫ:
  # Агрегировать раунд и вывести JSON в stdout
  python3 tools/aggregate_turn.py --turn 2

  # Агрегировать и обновить context.json (newspapers + socialMedia)
  python3 tools/aggregate_turn.py --turn 2 --update-context

  # Только JSON без заголовков (для pipe)
  python3 tools/aggregate_turn.py --turn 2 --json-only
        """,
    )
    parser.add_argument("--turn", type=int, required=True, help="Turn number (1-5)")
    parser.add_argument(
        "--update-context", action="store_true",
        help="Записать обновлённые newspapers и socialMedia в context.json",
    )
    parser.add_argument(
        "--context", type=str, default=None,
        help="Путь к context.json (по умолчанию dashboard/public/context.json)",
    )
    parser.add_argument(
        "--json-only", action="store_true",
        help="Только JSON в stdout (без заголовков, для pipe)",
    )
    args = parser.parse_args()

    # Resolve context path
    global CONTEXT_FILE
    if args.context:
        CONTEXT_FILE = pathlib.Path(args.context)

    if not args.json_only:
        print(f"\n{'='*60}")
        print(f"АГРЕГАЦИЯ РАУНДА {args.turn}")
        print(f"{'='*60}\n")

    # Phase: Load context
    if not args.json_only:
        print("📊 Загрузка контекста...")
    context = load_context()

    # Phase: Load decisions
    if not args.json_only:
        print("📂 Загрузка решений агентов...")
    decisions = load_all_decisions(args.turn)
    if not args.json_only:
        print(f"  Получено {len(decisions)} решений: {', '.join(decisions.keys())}")

    # Phase: Calculate metrics
    if not args.json_only:
        print("\n🔢 Расчёт новых метрик...")
    new_metrics = calculate_metrics(context, decisions, args.turn)
    if not args.json_only:
        print("  Новые метрики:")
        for key, value in new_metrics.items():
            old_value = context["metrics"].get(key, "N/A")
            change = ""
            if isinstance(value, (int, float)) and isinstance(old_value, (int, float)):
                diff = value - old_value
                if diff != 0:
                    change = f" ({'+' if diff > 0 else ''}{diff:.1f})"
            print(f"    {key}: {old_value} → {value}{change}")

    # Phase: Build response
    if not args.json_only:
        print("\n📝 Генерация нарратива и событий...")
    response = build_response(args.turn, context, decisions, new_metrics)

    # Media & decisions stats
    new_arts = response.get("newspapers", [])
    new_posts = response.get("socialMedia", [])
    new_decisions_list = response.get("decisions", [])
    old_arts_count = len(context.get("newspapers", []))
    old_posts_count = len(context.get("socialMedia", []))
    old_decisions_count = len(context.get("decisions", []))
    added_arts = len(new_arts) - old_arts_count
    added_posts = len(new_posts) - old_posts_count
    added_decisions = len(new_decisions_list) - old_decisions_count

    if not args.json_only:
        print(f"\n📰 Медиа-активность:")
        print(f"  Статьи: {old_arts_count} → {len(new_arts)} (+{added_arts})")
        print(f"  Посты:  {old_posts_count} → {len(new_posts)} (+{added_posts})")
        print(f"  Решения: {old_decisions_count} → {len(new_decisions_list)} (+{added_decisions})")

        print(f"\n✅ Раунд {args.turn} агрегирован.")
        print(f"  Игроков: {len(response['agentResponsesReceived'])}")
        print(f"  Ошибок: {len(response['agentErrors'])}")
        print(f"  Игра окончена: {response['isGameOver']}")

    # Optionally update context.json
    if args.update_context:
        updated_decisions = response.get("decisions", [])
        context["metrics"] = new_metrics
        context["newspapers"] = new_arts
        context["socialMedia"] = new_posts
        context["decisions"] = updated_decisions

        # Advance game.currentTurn to the NEXT turn so the dashboard shows
        # which round is ready to play (capped at totalTurns)
        if "game" in context:
            total_turns = context["game"].get("totalTurns", 5)
            next_turn = min(args.turn + 1, total_turns)
            context["game"]["currentTurn"] = next_turn
            # Update lastUpdated timestamp
            context["game"]["lastUpdated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
            # Update currentPeriod from turnCalendar for the NEXT turn
            for entry in context.get("turnCalendar", []):
                if isinstance(entry, dict) and entry.get("turn") == next_turn:
                    period = entry.get("periodRu") or entry.get("phase", "")
                    if period:
                        context["game"]["currentPeriod"] = period
                    break

        # Write roundSummary and mark status into turnCalendar for the aggregated turn
        round_summary = response.get("roundSummary", "")
        for entry in context.get("turnCalendar", []):
            if isinstance(entry, dict) and entry.get("turn") == args.turn:
                entry["status"] = "completed"
                if round_summary:
                    entry["roundSummary"] = round_summary
                break

        with open(CONTEXT_FILE, "w", encoding="utf-8") as f:
            json.dump(context, f, ensure_ascii=False, indent=2)
        if not args.json_only:
            print(f"\n💾 context.json обновлён: {CONTEXT_FILE}")
            print(f"   game.currentTurn: {next_turn} (aggregated turn {args.turn}, advanced to next)")
            print(f"   metrics: {len(new_metrics)} полей")
            print(f"   newspapers: {len(new_arts)} записей")
            print(f"   socialMedia: {len(new_posts)} записей")
            print(f"   decisions: {len(updated_decisions)} записей")

    # Output final JSON
    if not args.json_only:
        print(f"\n{'='*60}")
        print("ИТОГОВЫЙ JSON РАУНДА:")
        print(f"{'='*60}\n")
    print(json.dumps(response, ensure_ascii=False, indent=2))

    return response


if __name__ == "__main__":
    main()
