import json


EXTRACTION_PROMPT = """Read this basketball box-score image. Extract both teams exactly as printed.
Return only JSON with this shape:
{"meta":{"tournament":null,"date":null},"teams":[{"name":"","score":0,"players":[{"number":null,"name":"","pts":0,"fgm":0,"fga":0,"tpm":0,"tpa":0,"ftm":0,"fta":0,"oreb":0,"dreb":0,"reb":0,"ast":0,"stl":0,"blk":0,"tov":0,"pf":0,"min":0,"plus_minus":0}]}]}
Preserve plus/minus signs, skip total rows, and use zero for unreadable stat integers."""


def parse_provider_json(text: str) -> dict:
    cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    result = json.loads(cleaned)
    if not isinstance(result.get("teams"), list) or len(result["teams"]) < 2:
        raise ValueError("Parser response must contain both teams")
    return result
