# 🎮 GameMind AI — Interactive Game Recommendation Agent

> An agentic AI system that recommends video games using **LangGraph**, **LangChain**, **RAG** (FAISS), and **live web search** (Tavily). The agent doesn't just answer — it analyzes your intent, decides which knowledge source to use, and explains *why* each game fits *and* where to start.

---

## ✨ Features

- 🧠 **Intent-aware routing** — the agent uses an LLM-based classifier to decide whether to use the local knowledge base, the live web, or both
- 📚 **RAG over a curated game corpus** — 20 hand-picked games embedded into a FAISS vector store
- 🌐 **Live web search** — Tavily-powered retrieval for trending, upcoming, and competitive titles
- 🎨 **Gaming-themed React UI** — animated mascot, popular-game cards with real Steam cover art, markdown-rendered answers, route badges
- 🔄 **Graceful fallbacks** — if Gemini Flash is overloaded, the agent automatically falls back to Gemini Flash Lite

---

## 🏗️ Architecture

```
                       ┌───────────────────┐
   user query  ───▶    │  React Frontend   │  ◀──── Steam CDN (cover art)
                       │   (Vite + Tailwind)│
                       └─────────┬──────────┘
                                 │  POST /recommend
                                 ▼
                       ┌───────────────────┐
                       │   FastAPI server  │
                       └─────────┬──────────┘
                                 │
                                 ▼
                  ┌────────────────────────────┐
                  │   LangGraph StateGraph     │
                  └─────────────┬──────────────┘
                                │
                       ┌────────▼─────────┐
                       │   decide node    │   LLM-based classifier
                       │  (rag/web/both)  │   + recency keyword shortcut
                       └────────┬─────────┘
                                │
              ┌─────────────────┼──────────────────┐
              ▼                 ▼                  ▼
         ┌────────┐        ┌────────┐         ┌────────┐
         │  RAG   │        │  WEB   │         │  BOTH  │
         │ FAISS  │        │ Tavily │         │ RAG +  │
         │ +Gemini│        │ search │         │  WEB   │
         │embed.  │        │ tool   │         │        │
         └────┬───┘        └────┬───┘         └────┬───┘
              └─────────────────┼──────────────────┘
                                ▼
                       ┌─────────────────┐
                       │   generate      │  Gemini 2.5 Flash
                       │   (final LLM)   │  → markdown answer
                       └────────┬────────┘
                                ▼
                          {route, answer}
```

### How the decision node works

The `decide` node combines two strategies:

1. **Keyword shortcut** — if the query contains recency words (`"latest"`, `"new"`, `"2026"`, `"trending"`, `"upcoming"`, …), the agent immediately routes to web (or both, for descriptive queries).
2. **LLM-based classification** — for everything else, the LLM is asked: *"For this query, should we use the local DB, the web, or both?"* The classifier knows the local DB contains classic single-player titles, so queries about competitive or recent games (e.g. *"recommend something like Valorant"*) correctly route to the web.

This hybrid approach is fast, predictable for the demo, and intelligent for edge cases.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Agent orchestration | **LangGraph** (StateGraph) |
| LLM & tool abstractions | **LangChain** |
| LLM | **Google Gemini 2.5 Flash** (with Lite as fallback) |
| Embeddings | **Gemini Embedding-001** |
| Vector store | **FAISS** |
| Web search | **Tavily** |
| Backend API | **FastAPI** + **Uvicorn** |
| Frontend | **React 18** + **Vite** + **Tailwind CSS** |
| Markdown rendering | **react-markdown** + **remark-gfm** |

---

## 📁 Project Structure

```
game-recommender/
├── backend/
│   ├── main.py           # FastAPI server (POST /recommend)
│   ├── graph.py          # LangGraph StateGraph + decision node
│   ├── rag.py            # FAISS index + Gemini embeddings
│   ├── web_tool.py       # @tool web_search (Tavily)
│   ├── games_data.py     # 20-game curated corpus
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx       # Single-page UI
│   │   ├── main.jsx
│   │   └── index.css     # Tailwind directives
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

---

## 🚀 Setup

### Prerequisites

- **Python 3.10+** ([download](https://www.python.org/downloads/))
- **Node.js 18+** ([download](https://nodejs.org/))
- A **Google Gemini API key** ([get one free](https://aistudio.google.com/app/apikey))
- *(Optional)* A **Tavily API key** for live web search ([get one free](https://tavily.com))

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure API keys
copy .env.example .env         # Windows
# cp .env.example .env         # macOS / Linux
```

Open `backend/.env` and fill in your keys:

```env
GOOGLE_API_KEY=AIza...
TAVILY_API_KEY=tvly-...
```

> If `TAVILY_API_KEY` is omitted, the agent automatically falls back to mock search results so it remains demo-able.

Start the server:

```bash
uvicorn main:app --reload --port 8000
```

You should see:

```
[RAG] Building FAISS vector store from game dataset...
[RAG] Indexed 20 games.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Frontend

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## 🧪 Example Queries

| Query | Expected Route | What Happens |
|-------|---------------|--------------|
| `"I want a relaxing game after work"` | **RAG** | Pulls Stardew Valley, Animal Crossing, Minecraft from the local DB |
| `"Recommend something like The Witcher 3"` | **BOTH** | Uses local DB (Witcher 3 is in it) + web for similar recent games |
| `"What are the best new games in 2026?"` | **WEB** | Triggers Tavily, returns IGN/GameSpot 2026 release info |
| `"Recommend games like Valorant"` | **WEB** | LLM classifier sees Valorant isn't in local DB → web search returns CS2, Apex, Overwatch |
| `"A challenging RPG with deep story"` | **RAG** | Returns Elden Ring, Disco Elysium, Baldur's Gate 3 |

### Example response

> **Route taken: RAG**
>
> If you want to wind down after a long day, here are three picks:
>
> ## 🎮 Stardew Valley
> **Genre:** Farming Simulation
>
> **Why it fits you:** It's the gold standard of cozy gaming — slow-paced, charming, and you control the rhythm.
>
> **Where to start:** Day 1, clear a small patch of weeds and plant parsnips. Don't worry about optimizing — just play.
>
> ## 🎮 Animal Crossing: New Horizons
> ...

---

## 🧠 Agent Behavior — Why Each Tech Earns Its Place

This project must demonstrate *meaningful* use of all four required technologies:

- **LangGraph** — The agent is a `StateGraph` with five nodes (`decide`, `rag`, `web`, `both`, `generate`) and a conditional edge that branches on the routing decision. State flows through `AgentState` (a `TypedDict`).
- **LangChain** — Used for `ChatGoogleGenerativeAI` (LLM), `GoogleGenerativeAIEmbeddings`, `ChatPromptTemplate`, the `@tool` decorator on `web_search`, and `Document` objects in the corpus.
- **RAG** — The 20-game corpus in `games_data.py` is embedded with Gemini Embedding-001 and indexed in FAISS. At query time, top-4 most similar games are retrieved and inserted into the generation prompt.
- **Web Search** — The `web_search` LangChain tool is invoked autonomously by the agent only when the routing decision selects `web` or `both`. It uses Tavily for live results.

A query like *"Recommend games similar to The Witcher 3 that came out in 2026"* visibly uses **both** RAG (Witcher 3 lives in our DB) and web (the 2026 part) in a single run.

---

## 🔧 Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend exits on first request: `503 UNAVAILABLE` | Gemini servers are temporarily overloaded. The agent already retries automatically and falls back to Gemini Flash Lite — wait a few seconds and try again. |
| `[RAG]` index never finishes building | `GOOGLE_API_KEY` is missing or invalid. Check `.env`. |
| Frontend shows *"Backend bağlantısı kurulamadı"* | Backend isn't running, or it's on a different port. Confirm `localhost:8000` returns `{"status":"ok",...}`. |
| `pip install faiss-cpu` fails | Try a newer version: `pip install faiss-cpu>=1.12.0`. |
| Pylance shows red squiggles in VS Code | Run *Python: Select Interpreter* and pick the one inside `backend/venv`. |

---

## 🔒 Security Notes

- API keys live in `.env` (gitignored). Never commit them.
- `.env.example` documents which variables are needed without exposing secrets.
- Tavily and Gemini both use HTTPS-only endpoints.

---

## 📜 License

This project was built for an academic AI agents course. Code is provided for educational purposes.
