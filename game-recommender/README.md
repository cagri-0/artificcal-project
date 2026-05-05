# 🎮 Interactive Game Recommendation Agent

An AI agent that recommends video games based on user input. It analyzes intent,
decides whether to use internal knowledge (RAG) or web search, and returns
**actionable** recommendations — *what* to play, *why*, and *what to do first*.

Built with the four required technologies:

| Technology     | Where it's used                                    |
|----------------|----------------------------------------------------|
| **LangGraph**  | `backend/graph.py` — `StateGraph` with a decision node and 3 branches (RAG / Web / Both) |
| **LangChain**  | `ChatOpenAI`, `OpenAIEmbeddings`, `@tool`, `ChatPromptTemplate`, `Document` |
| **RAG**        | `backend/rag.py` — 20 games embedded into a FAISS vector store |
| **Web Search** | `backend/web_tool.py` — Tavily (real) with mock fallback |

---

## 🏗️ Architecture

```
                     ┌─────────────────┐
   user query  ───▶  │   FastAPI       │  ───▶  React frontend
                     │   /recommend    │
                     └────────┬────────┘
                              │
                              ▼
                  ┌────────────────────────┐
                  │   LangGraph StateGraph │
                  └────────────┬───────────┘
                               │
                       ┌───────▼────────┐
                       │  decide node   │   keyword + heuristic
                       └───────┬────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                 ▼
         ┌────────┐       ┌────────┐        ┌────────┐
         │  RAG   │       │  WEB   │        │  BOTH  │
         │ FAISS  │       │ Tavily │        │  RAG + │
         │ search │       │ /Mock  │        │  WEB   │
         └────┬───┘       └────┬───┘        └────┬───┘
              └────────────────┼─────────────────┘
                               ▼
                       ┌──────────────┐
                       │  generate    │   ChatOpenAI + prompt template
                       │  (final LLM) │   "Recommend, explain, suggest"
                       └──────┬───────┘
                              ▼
                          final answer
```

### How the decision node works

The `decide` node uses a simple, transparent rule (easy to defend in a presentation):

1. If the query contains a recency keyword (`"latest"`, `"new"`, `"2026"`, `"upcoming"`, `"trending"`, …) → web is needed.
2. If recency **and** the query is descriptive (mentions a vibe, genre, or comparison) → use **both** RAG and web.
3. Otherwise → use **RAG**.

This gives predictable, explainable routing while still satisfying the
"agent decides" requirement.

---

## 📁 Project Structure

```
game-recommender/
├── backend/
│   ├── main.py           # FastAPI server
│   ├── graph.py          # LangGraph StateGraph (decision + branches)
│   ├── rag.py            # FAISS vector store + retriever
│   ├── web_tool.py       # @tool web_search (Tavily / mock)
│   ├── games_data.py     # 20-game knowledge base
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── styles.css
```

---

## 🚀 Setup & Run

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure your API key
cp .env.example .env
# Open .env and paste your OPENAI_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

The server will print `[RAG] Indexed 20 games.` on first start, confirming
the FAISS index is built.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

---

## 🧪 Example Queries & Expected Routes

| Query                                                | Route | Why                                           |
|------------------------------------------------------|-------|-----------------------------------------------|
| `"I want a relaxing game after work"`                | RAG   | No recency keywords → use the local KB        |
| `"Recommend something like The Witcher 3"`           | RAG   | Pure preference, KB has The Witcher 3         |
| `"What are the latest games in 2026?"`               | WEB   | Recency keyword "latest" + "2026"             |
| `"New cozy indie games similar to Stardew Valley"`   | BOTH  | "New" → web; long descriptive query → also RAG |

### Example response (RAG route)

> **Route taken: RAG**
>
> If you're looking for a relaxing game after work, here are three picks:
>
> 1. **Stardew Valley** — A cozy farming RPG that's perfect for unwinding…
>    *Start by:* clearing a small patch of weeds and planting parsnips on day 1.
> 2. **Animal Crossing: New Horizons** — Real-time island life…
>    *Start by:* fishing at the pier — it's the fastest early-game income.
> 3. **Minecraft** (Creative mode) — Pure stress-free building…
>    *Start by:* picking a flat biome and building a small starter cabin.

---

## ✅ Requirements Checklist

- [x] LangGraph `StateGraph` with **decision node** and **two+ branches**
- [x] LangChain abstractions for LLM calls and tool integration
- [x] RAG with **20 game documents** stored in **FAISS**
- [x] Web search **tool** (`@tool` decorator) the agent decides when to use
- [x] Agent recommends, explains *why*, and suggests *what to do*
- [x] React frontend with input, submit, response area, and loading indicator
- [x] FastAPI backend split into `main.py`, `rag.py`, `web_tool.py`, `graph.py`

---

## 🐛 Troubleshooting

- **`OPENAI_API_KEY` not set** → backend will fail on the first request. Add the key to `.env`.
- **CORS errors** → make sure backend is on port 8000 and frontend on 5173 (defaults).
- **No Tavily key** → totally fine; `web_tool.py` returns mock results automatically.
- **FAISS install fails on Windows** → try `pip install faiss-cpu --no-cache-dir`.
