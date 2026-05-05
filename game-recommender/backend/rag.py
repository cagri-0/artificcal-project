"""
rag.py
------
RAG module — uses Google Gemini embeddings + FAISS.
"""

import os
from dotenv import load_dotenv

# .env'in import zamanında yüklenmesini garantile
load_dotenv()

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from games_data import GAMES


def _build_documents():
    docs = []
    for game in GAMES:
        content = (
            f"Name: {game['name']}\n"
            f"Genre: {game['genre']}\n"
            f"Description: {game['description']}"
        )
        docs.append(
            Document(
                page_content=content,
                metadata={"name": game["name"], "genre": game["genre"]},
            )
        )
    return docs


print("[RAG] Building FAISS vector store from game dataset...")
_documents = _build_documents()
_embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY"),
)
_vector_store = FAISS.from_documents(_documents, _embeddings)
_retriever = _vector_store.as_retriever(search_kwargs={"k": 4})
print(f"[RAG] Indexed {len(_documents)} games.")


def retrieve_games(query: str) -> str:
    results = _retriever.invoke(query)
    if not results:
        return "No relevant games found in the knowledge base."
    formatted = []
    for i, doc in enumerate(results, start=1):
        formatted.append(f"[Game {i}]\n{doc.page_content}")
    return "\n\n".join(formatted)