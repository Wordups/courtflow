from difflib import SequenceMatcher


def _norm(value: str) -> str:
    return " ".join("".join(char for char in (value or "").lower() if char.isalnum() or char == " ").split())


def name_similarity(left: str, right: str) -> float:
    left, right = _norm(left), _norm(right)
    if not left or not right:
        return 0.0
    ratio = SequenceMatcher(None, left, right).ratio()
    left_tokens, right_tokens = set(left.split()), set(right.split())
    token_score = len(left_tokens & right_tokens) / max(1, len(left_tokens | right_tokens))
    return max(ratio, token_score)


def match_players(extracted_players: list[dict], roster: list[dict]) -> list[dict]:
    results: list[dict] = []
    used: set[str] = set()
    for extracted in extracted_players:
        best, best_score = None, 0.0
        for player in roster:
            if str(player["id"]) in used:
                continue
            score = name_similarity(extracted.get("name", ""), player.get("name", ""))
            if extracted.get("number") is not None and extracted["number"] == player.get("number"):
                score = min(1.0, score + 0.35)
            if score > best_score:
                best, best_score = player, score
        if best and best_score >= 0.55:
            used.add(str(best["id"]))
            results.append({"extracted": extracted, "match": best, "confidence": round(best_score, 2), "status": "matched"})
        else:
            results.append({"extracted": extracted, "match": None, "confidence": round(best_score, 2), "status": "new"})
    return results


def suggest_program(extracted_players: list[dict], rosters_by_program: dict[str, list[dict]]) -> dict:
    scores: dict[str, float] = {}
    for program_id, roster in rosters_by_program.items():
        matches = match_players(extracted_players, roster) if roster else []
        hits = [match["confidence"] for match in matches if match["status"] == "matched"]
        scores[program_id] = round(sum(hits) / max(1, len(extracted_players)), 3)
    best = max(scores, key=scores.get) if scores else None
    return {"suggested": best if best and scores[best] > 0 else None, "scores": scores}
