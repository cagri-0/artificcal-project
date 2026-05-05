"""
web_tool.py
-----------
Web search tool. Uses Tavily if a key is set, otherwise mock data.
"""

import os
from dotenv import load_dotenv
from langchain_core.tools import tool

load_dotenv()


_MOCK_RESULTS = [
    {
        "title": "Most anticipated games of 2026",
        "snippet": (
            "GTA VI launches in late 2026 and is breaking pre-order records. "
            "Other heavy hitters include Hollow Knight: Silksong, Fable, "
            "and the new Elder Scrolls VI teaser."
        ),
    },
    {
        "title": "Trending indie games right now",
        "snippet": (
            "Balatro continues to dominate the indie charts. Hades II is getting "
            "strong reviews, and Animal Well is praised as a modern Metroidvania."
        ),
    },
    {
        "title": "Latest AAA releases",
        "snippet": (
            "Recent releases include Black Myth: Wukong, Avowed, and "
            "Monster Hunter Wilds. All well-reviewed."
        ),
    },
]


def _mock_search(query: str) -> str:
    chunks = [f"- {r['title']}: {r['snippet']}" for r in _MOCK_RESULTS]
    return (
        f"[Mock web search for: {query}]\n"
        + "\n".join(chunks)
        + "\n(Using mock — TAVILY_API_KEY not set.)"
    )


def _real_search(query: str) -> str:
    try:
        from tavily import TavilyClient
        client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
        biased = f"video games {query}"
        resp = client.search(
            query=biased,
            max_results=5,
            search_depth="basic",
        )
        results = resp.get("results", [])
        if not results:
            return f"[Tavily returned no results for: {query}]"
        chunks = []
        for r in results:
            title = r.get("title", "")
            content = (r.get("content", "") or "")[:300]
            chunks.append(f"- {title}: {content}")
        return f"[Live web search results for: {query}]\n" + "\n".join(chunks)
    except Exception as e:
        return _mock_search(query) + f"\n(Tavily error, used mock: {e})"


@tool
def web_search(query: str) -> str:
    """
    Search the web for recent / trending / new game information.
    Use this for queries about latest games, 2026 releases,
    upcoming titles, or anything that requires current info.
    """
    if os.getenv("TAVILY_API_KEY"):
        return _real_search(query)
    return _mock_search(query)


if __name__ == "__main__":
    print(web_search.invoke("best new games 2026"))