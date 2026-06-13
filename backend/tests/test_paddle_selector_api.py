import pytest

pytestmark = pytest.mark.asyncio


async def test_health(client):
    r = await client.get("/api/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


async def test_get_questions_returns_7(client):
    r = await client.get("/api/paddle-selector/questions")
    assert r.status_code == 200
    data = r.json()
    assert len(data["questions"]) == 7


async def test_questions_sorted_by_order(client):
    r = await client.get("/api/paddle-selector/questions")
    orders = [q["order"] for q in r.json()["questions"]]
    assert orders == sorted(orders)


async def test_create_session(client):
    r = await client.post("/api/paddle-selector/sessions", json={"source": "website", "locale": "en-US"})
    assert r.status_code == 200
    data = r.json()
    assert "sessionId" in data
    assert data["status"] == "in_progress"
    assert data["currentQuestion"]["id"] == "skillLevel"
    assert data["progress"]["total"] == 7


async def test_full_happy_path(client):
    r = await client.post("/api/paddle-selector/sessions", json={})
    session_id = r.json()["sessionId"]

    answers = [
        ("skillLevel", "beginner"),
        ("playFrequency", "occasionally"),
        ("budget", "under_100"),
        ("playPriority", "power"),
        ("twoHandedBackhand", "yes"),
        ("upgradeOpenness", "yes"),
        ("gripFeel", "small"),
    ]
    for q_id, answer_value in answers[:-1]:
        r = await client.post(
            f"/api/paddle-selector/sessions/{session_id}/answer",
            json={"questionId": q_id, "answerValue": answer_value},
        )
        assert r.status_code == 200, r.text
        assert r.json()["status"] == "in_progress"

    r = await client.post(
        f"/api/paddle-selector/sessions/{session_id}/answer",
        json={"questionId": answers[-1][0], "answerValue": answers[-1][1]},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "completed"
    assert "recommendation" in data
    assert data["recommendation"]["matchType"] in ("exact", "none")


async def test_submit_invalid_answer(client):
    r = await client.post("/api/paddle-selector/sessions", json={})
    session_id = r.json()["sessionId"]
    r = await client.post(
        f"/api/paddle-selector/sessions/{session_id}/answer",
        json={"questionId": "skillLevel", "answerValue": "INVALID"},
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "INVALID_ANSWER"


async def test_out_of_order_answer(client):
    r = await client.post("/api/paddle-selector/sessions", json={})
    session_id = r.json()["sessionId"]
    r = await client.post(
        f"/api/paddle-selector/sessions/{session_id}/answer",
        json={"questionId": "budget", "answerValue": "under_100"},
    )
    assert r.status_code == 422
    assert r.json()["error"]["code"] == "OUT_OF_ORDER"


async def test_unknown_session(client):
    r = await client.get("/api/paddle-selector/sessions/does-not-exist")
    assert r.status_code == 404


async def test_restart_session(client):
    r = await client.post("/api/paddle-selector/sessions", json={})
    session_id = r.json()["sessionId"]
    r = await client.post(f"/api/paddle-selector/sessions/{session_id}/restart")
    assert r.status_code == 200
    new_data = r.json()
    assert new_data["sessionId"] != session_id
    assert new_data["currentQuestion"]["id"] == "skillLevel"


async def test_stateless_recommendation(client):
    r = await client.post("/api/paddle-selector/recommendations", json={
        "answers": {
            "skillLevel": "beginner",
            "playFrequency": "occasionally",
            "budget": "under_100",
            "playPriority": "power",
            "twoHandedBackhand": "yes",
            "upgradeOpenness": "yes",
            "gripFeel": "small",
        }
    })
    assert r.status_code == 200
    data = r.json()
    assert data["matchType"] in ("exact", "none")
    assert "metadata" in data


async def test_stateless_recommendation_no_match(client):
    r = await client.post("/api/paddle-selector/recommendations", json={
        "answers": {"skillLevel": "beginner"}
    })
    assert r.status_code == 200
    assert r.json()["matchType"] == "none"
