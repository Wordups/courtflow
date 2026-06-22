def test_existing_mobile_ai_contract(client):
    response = client.post(
        "/api/ai/coach",
        json={
            "sport": "basketball",
            "assistantName": "CourtIQ",
            "message": "Build a shooting plan",
            "messages": [{"role": "user", "content": "Help"}],
            "context": {
                "players": [{"id": "p1", "name": "Aaliyah", "position": "Guard", "skills": {"shooting": 62}}],
                "drillLinks": [{"id": "d1", "title": "Form shooting", "category": "Shooting", "attachedTo": ["p1"]}],
            },
        },
    )
    assert response.status_code == 200
    assert response.json() == {"reply": "Plan for Build a shooting plan"}
