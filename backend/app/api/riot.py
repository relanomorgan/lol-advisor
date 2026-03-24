import asyncio
import traceback
from fastapi import APIRouter, HTTPException
from app.services.riot import riot_service, get_champion_data

router = APIRouter()


def format_rank(entry):
    if not entry:
        return None
    return {
        "tier": entry["tier"],
        "rank": entry["rank"],
        "lp": entry["leaguePoints"],
        "wins": entry["wins"],
        "losses": entry["losses"],
        "winrate": round(entry["wins"] / (entry["wins"] + entry["losses"]) * 100)
    }


@router.get("/player/{game_name}/{tag_line}")
async def get_player(game_name: str, tag_line: str):
    try:
        champion_map = await get_champion_data()

        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]

        summoner = await riot_service.get_summoner(puuid)
        masteries = await riot_service.get_champion_mastery(puuid)
        ranked_data = await riot_service.get_ranked_info(puuid)

        soloq = next((r for r in ranked_data if r["queueType"] == "RANKED_SOLO_5x5"), None)
        flex = next((r for r in ranked_data if r["queueType"] == "RANKED_FLEX_SR"), None)

        top_champions = []
        for m in masteries:
            champ = champion_map.get(m["championId"], {})
            top_champions.append({
                "id": m["championId"],
                "name": champ.get("name", "Inconnu"),
                "image": champ.get("image", ""),
                "level": m["championLevel"],
                "points": m["championPoints"],
            })

        return {
            "game_name": puuid_data["gameName"],
            "tag_line": puuid_data["tagLine"],
            "summoner_level": summoner["summonerLevel"],
            "profile_icon_id": summoner["profileIconId"],
            "rank": format_rank(soloq),
            "flex": format_rank(flex),
            "top_champions": top_champions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def compute_stats(puuid: str, match_ids: list, champion_map: dict) -> dict:
    if not match_ids:
        return {"total_games": 0, "champion_stats": []}

    matches = await asyncio.gather(*[
        riot_service.get_match(mid) for mid in match_ids
    ])

    champion_stats: dict = {}

    for match in matches:
        participants = match["info"]["participants"]
        player = next((p for p in participants if p["puuid"] == puuid), None)
        if not player:
            continue

        champ_id = player["championId"]
        champ_name = champion_map.get(champ_id, {}).get("name", "Inconnu")
        champ_image = champion_map.get(champ_id, {}).get("image", "")
        won = player["win"]

        if champ_id not in champion_stats:
            champion_stats[champ_id] = {
                "id": champ_id,
                "name": champ_name,
                "image": champ_image,
                "wins": 0, "losses": 0,
                "kills": 0, "deaths": 0, "assists": 0,
                "games": 0
            }

        s = champion_stats[champ_id]
        s["games"] += 1
        s["kills"] += player["kills"]
        s["deaths"] += player["deaths"]
        s["assists"] += player["assists"]
        if won:
            s["wins"] += 1
        else:
            s["losses"] += 1

    result = []
    for s in champion_stats.values():
        s["winrate"] = round(s["wins"] / s["games"] * 100)
        s["kda"] = round((s["kills"] + s["assists"]) / max(1, s["deaths"]), 2)
        result.append(s)

    result.sort(key=lambda x: x["games"], reverse=True)

    return {
        "total_games": len(matches),
        "champion_stats": result
    }


@router.get("/player/{game_name}/{tag_line}/stats/soloq")
async def get_stats_soloq(game_name: str, tag_line: str):
    try:
        champion_map = await get_champion_data()
        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]
        match_ids = await riot_service.get_match_ids(puuid, queue=420, count=20)
        return await compute_stats(puuid, match_ids, champion_map)
    except Exception as e:
        print(">>> SOLOQ ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{game_name}/{tag_line}/stats/flex")
async def get_stats_flex(game_name: str, tag_line: str):
    try:
        champion_map = await get_champion_data()
        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]
        match_ids = await riot_service.get_match_ids(puuid, queue=440, count=20)
        return await compute_stats(puuid, match_ids, champion_map)
    except Exception as e:
        print(">>> FLEX ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{game_name}/{tag_line}/stats/normal")
async def get_stats_normal(game_name: str, tag_line: str):
    try:
        champion_map = await get_champion_data()
        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]
        match_ids = await riot_service.get_match_ids(puuid, queue=None, count=20)
        return await compute_stats(puuid, match_ids, champion_map)
    except Exception as e:
        print(">>> NORMAL ERROR:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/player/{game_name}/{tag_line}/live")
async def get_live_game(game_name: str, tag_line: str):
    try:
        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]
        live_game = await riot_service.get_live_game(puuid)

        if not live_game:
            return {
                "in_game": False,
                "message": "Ce joueur n'est pas en partie actuellement"
            }

        return {
            "in_game": True,
            "game_id": live_game["gameId"],
            "game_mode": live_game["gameMode"],
            "game_length": live_game["gameLength"],
            "participants": [
                {
                    "summoner_name": p["summonerName"],
                    "champion_id": p["championId"],
                    "team_id": p["teamId"],
                    "puuid": p["puuid"]
                }
                for p in live_game["participants"]
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))