from fastapi import APIRouter
from datetime import datetime
from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.env,
        "version": "0.1.0"
    }


@router.get("/health/config")
async def config_check():
    return {
        "riot_api_configured": bool(settings.riot_api_key),
        "database_configured": bool(settings.database_url),
        "ai_configured": bool(settings.anthropic_api_key),
    }