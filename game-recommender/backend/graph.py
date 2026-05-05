"""
graph.py
--------
LangGraph StateGraph that orchestrates the whole agent.

Flow:

           ┌────────────┐
           │  decide    │  (decision node — picks RAG, WEB, or BOTH)
           └─────┬──────┘
                 │
        ┌────────┼─────────┐
        ▼        ▼         ▼
     ┌─────┐  ┌─────┐  ┌──────┐
     │ RAG │  │ WEB │  │ BOTH │
     └──┬──┘  └──┬──┘  └──┬───┘
        └────────┼────────┘
                 ▼
           ┌──────────┐
           │ generate │  (final LLM answer)
           └──────────┘

The decision is made by a small LLM call that classifies the query.
We also have a keyword shortcut ("2026", "latest", "new"...) so the
behavior is predictable for the demo even if the LLM is offline.
"""

from typing import TypedDict, Literal
from langgraph.graph import StateGraph, END
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

from rag import retrieve_games
from web_tool import web_search


# ---------- State definition ----------
class AgentState(TypedDict):
    """Everything that flows through the graph."""
    query: str                      # original user question
    route: str                      # "rag" | "web" | "both"
    rag_context: str                # text retrieved from FAISS
    web_context: str                # text returned by web_search tool
    answer: str                     # final natural-language answer


# ---------- LLM ----------
# A single shared LLM. ChatOpenAI is a LangChain abstraction (mandatory tech).
# Gemini bazen 503 (overloaded) dönebilir. Otomatik 2 kez tekrar denesin.
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.4,
    max_retries=3,
)

# ---------- Node 1: decision ----------
RECENCY_KEYWORDS = [
    "2025", "2026", "2027",
    "latest", "newest", "new", "recent", "recently",
    "upcoming", "trending", "this year", "this month",
    "just released", "just came out",
]


# Decision yapan küçük prompt — LLM'in karar vermesini sağlar
ROUTING_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a routing classifier for a game recommendation agent.\n"
     "Decide which data source(s) the agent should use to answer the user.\n\n"
     "Available sources:\n"
     "- RAG: a curated local database of ~20 well-known classic and indie games "
     "(The Witcher 3, Skyrim, Stardew Valley, Hades, Elden Ring, Hollow Knight, etc.). "
     "Good for general preference / vibe / mood / genre questions when the user "
     "is open to suggestions from a small classic catalog.\n"
     "- WEB: live internet search. Good for recent/upcoming games, specific named "
     "games NOT in the local DB (Valorant, CS2, League of Legends, Fortnite, "
     "Apex, Dota, Overwatch, Minecraft mods, mobile games, niche titles), "
     "trending/competitive/online games, and 'games similar to X' where X is "
     "a multiplayer or very recent game.\n"
     "- BOTH: use when the user asks for similar games and X exists in our DB, "
     "or when both classic + recent context would help.\n\n"
     "Reply with EXACTLY one word: rag, web, or both. Nothing else."),
    ("human", "User query: {query}"),
])


def decide_route(state: AgentState) -> AgentState:
    """Ask the LLM which data source to use."""
    query = state["query"]

    # Quick keyword shortcut — recency words always need the web
    lowered = query.lower()
    if any(k in lowered for k in RECENCY_KEYWORDS):
        route = "both" if len(query.split()) > 5 else "web"
        print(f"[decide] keyword shortcut → route = {route}")
        return {**state, "route": route}

    # Otherwise, let the LLM classify
    try:
        chain = ROUTING_PROMPT | llm
        raw = chain.invoke({"query": query}).content.strip().lower()
        # Normalize — just in case the LLM adds punctuation
        if "both" in raw:
            route = "both"
        elif "web" in raw:
            route = "web"
        else:
            route = "rag"
    except Exception as e:
        print(f"[decide] LLM routing failed ({e}), defaulting to both")
        route = "both"

    print(f"[decide] LLM → route = {route}")
    return {**state, "route": route}


def route_selector(state: AgentState) -> Literal["rag", "web", "both"]:
    """LangGraph conditional edge function — just returns the route."""
    return state["route"]

# ---------- Node 2: RAG branch ----------
def rag_node(state: AgentState) -> AgentState:
    print("[rag] retrieving from FAISS...")
    context = retrieve_games(state["query"])
    return {**state, "rag_context": context, "web_context": ""}


# ---------- Node 3: Web branch ----------
def web_node(state: AgentState) -> AgentState:
    print("[web] calling web_search tool...")
    context = web_search.invoke(state["query"])
    return {**state, "web_context": context, "rag_context": ""}


# ---------- Node 4: Both branches ----------
def both_node(state: AgentState) -> AgentState:
    print("[both] using RAG + web search...")
    rag_ctx = retrieve_games(state["query"])
    web_ctx = web_search.invoke(state["query"])
    return {**state, "rag_context": rag_ctx, "web_context": web_ctx}


# ---------- Node 5: final generation ----------
GENERATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system",
     "You are a friendly video-game recommendation expert.\n"
     "Use ONLY the provided context to recommend games. "
     "If the context is empty or irrelevant, say so honestly.\n\n"
     "Format your answer in clean Markdown EXACTLY like this:\n"
     "Start with one short intro sentence (no heading).\n\n"
     "Then for EACH of 2–3 recommended games, output this exact block:\n"
     "## 🎮 [Game Name]\n"
     "**Genre:** [genre]\n\n"
     "**Why it fits you:** [1–2 sentence reason]\n\n"
     "**Where to start:** [one concrete first-step tip]\n\n"
     "Keep the tone warm. Use **bold** to emphasize key words. "
     "Do not add any text after the last game block."),
    ("human",
     "User query: {query}\n\n"
     "Knowledge-base context (from RAG):\n{rag_context}\n\n"
     "Web search context:\n{web_context}\n\n"
     "Write the recommendation now."),
])


def generate_node(state: AgentState) -> AgentState:
    print("[generate] composing final answer...")
    chain = GENERATION_PROMPT | llm

    # Gemini Flash yoğunsa Lite modeline düş.
    fallback_llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash-lite",
        temperature=0.4,
        max_retries=3,
    )
    fallback_chain = GENERATION_PROMPT | fallback_llm

    inputs = {
        "query": state["query"],
        "rag_context": state.get("rag_context") or "(none)",
        "web_context": state.get("web_context") or "(none)",
    }

    try:
        response = chain.invoke(inputs)
    except Exception as e:
        print(f"[generate] primary model failed ({e}), trying fallback...")
        try:
            response = fallback_chain.invoke(inputs)
        except Exception as e2:
            return {
                **state,
                "answer": (
                    "⚠️ Gemini is currently overloaded. "
                    "Please try again in a few seconds.\n\n"
                    f"(Technical detail: {e2})"
                ),
            }

    return {**state, "answer": response.content}


# ---------- Build the graph ----------
def build_graph():
    g = StateGraph(AgentState)

    g.add_node("decide", decide_route)
    g.add_node("rag", rag_node)
    g.add_node("web", web_node)
    g.add_node("both", both_node)
    g.add_node("generate", generate_node)

    g.set_entry_point("decide")

    # decide → one of three branches
    g.add_conditional_edges(
        "decide",
        route_selector,
        {"rag": "rag", "web": "web", "both": "both"},
    )

    # all branches → generate → END
    g.add_edge("rag", "generate")
    g.add_edge("web", "generate")
    g.add_edge("both", "generate")
    g.add_edge("generate", END)

    return g.compile()


# Compile once so main.py can import it.
agent_graph = build_graph()


def run_agent(query: str) -> dict:
    """Convenience wrapper used by main.py."""
    initial: AgentState = {
        "query": query,
        "route": "",
        "rag_context": "",
        "web_context": "",
        "answer": "",
    }
    final = agent_graph.invoke(initial)
    return {
        "route": final["route"],
        "answer": final["answer"],
    }


if __name__ == "__main__":
    # Quick manual test
    print(run_agent("I want a relaxing game to play after work"))
