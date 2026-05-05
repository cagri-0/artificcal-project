"""
main.py
-------
FastAPI server that exposes the agent over HTTP so the React frontend
can talk to it.

Endpoints:
- GET  /           — health check
- POST /recommend  — body: {"query": "..."} → {"route": "...", "answer": "..."}
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load OPENAI_API_KEY (and optional TAVILY_API_KEY) from a .env file
# in the backend folder. This must run before we import graph.py
# because graph.py constructs the LLM at import time.
load_dotenv()

if not os.getenv("OPENAI_API_KEY"):
    print("[warn] OPENAI_API_KEY not set — the agent will fail on first request.")

from graph import run_agent   # noqa: E402


app = FastAPI(title="Game Recommendation Agent")

# Allow the local React dev server to call us.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Query(BaseModel):
    query: str


@app.get("/")
def health():
    return {"status": "ok", "service": "game-recommender"}


@app.post("/recommend")
def recommend(payload: Query):
    result = run_agent(payload.query)
    return result
