from fastapi import APIRouter, HTTPException
from app.services.riot import riot_service, get_champion_data

router = APIRouter()


@router.get("/player/{game_name}/{tag_line}")
async def get_player(game_name: str, tag_line: str):
    try:
        champion_map = await get_champion_data()

        puuid_data = await riot_service.get_puuid(game_name, tag_line)
        puuid = puuid_data["puuid"]

        summoner = await riot_service.get_summoner(puuid)
        masteries = await riot_service.get_champion_mastery(puuid)

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
            "top_champions": top_champions
        }
    except Exception as e:
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