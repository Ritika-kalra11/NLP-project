"""
Integration tests for FastAPI endpoints using TestClient.
"""

import sys
from pathlib import Path
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

client = TestClient(app)


def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"


def test_stats_endpoint():
    res = client.get("/api/stats")
    assert res.status_code == 200
    data = res.json()
    assert "total_papers" in data
    assert "indexed_chunks" in data
    assert data["total_papers"] >= 1


def test_papers_list():
    res = client.get("/api/papers")
    assert res.status_code == 200
    papers = res.json()
    assert isinstance(papers, list)
    assert len(papers) >= 1


def test_chat_endpoint():
    payload = {
        "query": "What are the common limitations reported across studies?",
        "top_k": 5,
        "similarity_threshold": 0.20
    }
    res = client.post("/api/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "content" in data
    assert "citations" in data
    assert len(data["content"]) > 10


def test_search_endpoint():
    payload = {
        "query": "sparse attention",
        "mode": "hybrid",
        "top_k": 5
    }
    res = client.post("/api/search", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "results" in data
    assert len(data["results"]) >= 1


def test_research_gaps_endpoint():
    res = client.get("/api/research-gaps")
    assert res.status_code == 200
    data = res.json()
    assert "gaps" in data
    assert len(data["gaps"]) >= 1


def test_evaluation_benchmark_endpoint():
    res = client.get("/api/evaluation")
    assert res.status_code == 200
    data = res.json()
    assert "mean_faithfulness_score" in data
    assert data["mean_faithfulness_score"] > 0


if __name__ == "__main__":
    test_root_endpoint()
    test_stats_endpoint()
    test_papers_list()
    test_chat_endpoint()
    test_search_endpoint()
    test_research_gaps_endpoint()
    test_evaluation_benchmark_endpoint()
    print("All API integration tests passed successfully!")
