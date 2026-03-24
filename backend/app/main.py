from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.riot import router as riot_router
from app.core.config import settings

app = FastAPI(
    title="LoL Advisor API",
    description="Backend pour l'analyse de drafts League of Legends",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(riot_router, prefix="/api/v1", tags=["Riot"])


@app.get("/")
async def root():
    return {
        "message": "LoL Advisor API",
        "docs": "/docs",
        "status": "running"
    }