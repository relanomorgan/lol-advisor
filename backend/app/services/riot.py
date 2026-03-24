import httpx
from app.core.config import settings

REGIONS = {
    "euw": {
        "platform": "euw1.api.riotgames.com",
        "regional": "europe.api.riotgames.com"
    }
}


class RiotService:
    def __init__(self):
        self.platform = REGIONS["euw"]["platform"]
        self.regional = REGIONS["euw"]["regional"]

    @property
    def headers(self):
        return {"X-Riot-Token": settings.riot_api_key}

    async def get_puuid(self, game_name: str, tag_line: str) -> dict:
        url = f"https://{self.regional}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def get_summoner(self, puuid: str) -> dict:
        url = f"https://{self.platform}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

    async def get_live_game(self, puuid: str) -> dict | None:
        url = f"https://{self.platform}/lol/spectator/v5/active-games/by-summoner/{puuid}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 404:
                return None
            response.raise_for_status()
            return response.json()

    async def get_champion_mastery(self, puuid: str, count: int = 5) -> list:
        url = f"https://{self.platform}/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count={count}"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()

async def get_champion_data() -> dict:
    url = "https://ddragon.leagueoflegends.com/api/versions.json"
    async with httpx.AsyncClient() as client:
        versions = await client.get(url)
        latest = versions.json()[0]
        champions = await client.get(
            f"https://ddragon.leagueoflegends.com/cdn/{latest}/data/fr_FR/champion.json"
        )
        data = champions.json()["data"]
        return {
            int(v["key"]): {
                "name": v["name"],
                "id": k,
                "image": f"https://ddragon.leagueoflegends.com/cdn/{latest}/img/champion/{k}.png"
            }
            for k, v in data.items()
        }

riot_service = RiotService()