"""
FastAPI Server for Autonomous Multi-Agent Debate Arena.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import sys

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.arena import ArenaEngine, DebateRequest, DebateSessionResponse, AGENTS

app = FastAPI(
    title="Multi-Agent AI Debate & Consensus Arena",
    version="1.0.0",
    description="Autonomous deliberation engine simulating adversarial and collaborative multi-agent consensus."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = ArenaEngine()
FRONTEND_DIR = BASE_DIR / "frontend"

@app.get("/health")
def health():
    return {
        "status": "HEALTHY",
        "active_personas": len(AGENTS),
        "engine": "Autonomous Multi-Agent Consensus Swarm"
    }

@app.get("/api/v1/agents")
def get_agents():
    return AGENTS

@app.post("/api/v1/debate", response_model=DebateSessionResponse)
def run_debate(request: DebateRequest):
    try:
        return engine.execute_debate(request)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Debate simulation error: {str(e)}"
        )

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return {"message": "Multi-Agent Debate Arena is operational. Visit /docs for OpenAPI specifications."}
