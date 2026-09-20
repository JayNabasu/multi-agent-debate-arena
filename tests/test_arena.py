from fastapi.testclient import TestClient
from backend.server import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

def test_get_agents():
    res = client.get("/api/v1/agents")
    assert res.status_code == 200
    agents = res.json()
    assert len(agents) == 4
    agent_ids = [a["id"] for a in agents]
    assert "architect" in agent_ids
    assert "skeptic" in agent_ids

def test_execute_debate():
    payload = {
        "topic": "Should microservices be adopted over modular monoliths for financial clearing systems?",
        "rounds": 3
    }
    res = client.post("/api/v1/debate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["total_rounds"] == 3
    assert len(data["turns"]) == 12 # 4 agents * 3 rounds
    assert data["consensus_score"] > 0
    assert "STRONGLY" in data["consensus_verdict"] or "CONDITIONAL" in data["consensus_verdict"] or "REJECTED" in data["consensus_verdict"]
