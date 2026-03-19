import asyncio
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from app.db.session import engine
from app.main import app


@pytest.fixture(scope="session", autouse=True)
def ensure_tables_exist() -> None:
	async def _create_tables() -> None:
		async with engine.begin() as conn:
			await conn.run_sync(SQLModel.metadata.create_all)
		# Avoid reusing pooled connections created on this setup loop.
		await engine.dispose()

	asyncio.run(_create_tables())


@pytest.fixture
def client() -> TestClient:
	asyncio.run(engine.dispose())
	with TestClient(app) as test_client:
		yield test_client
	asyncio.run(engine.dispose())


def _register_and_login(
	client: TestClient,
	*,
	username_prefix: str,
	password: str = "Password123!",
) -> tuple[str, str]:
	unique_suffix = uuid.uuid4().hex[:8]
	username = f"{username_prefix}_{unique_suffix}"
	email = f"{username}@example.com"

	register_response = client.post(
		"/api/v1/auth/register",
		json={"username": username, "email": email, "password": password},
	)
	assert register_response.status_code == 201

	register_data = register_response.json()["data"]
	user_id = register_data["id"]

	login_response = client.post(
		"/api/v1/auth/login",
		json={"username": username, "password": password},
	)
	assert login_response.status_code == 200

	token = login_response.json()["data"]["access_token"]
	return token, user_id


def test_create_todo_success(client: TestClient):
	token, user_id = _register_and_login(
		client,
		username_prefix="todo_creator",
	)

	unique_title = f"Write backend tests {uuid.uuid4().hex[:6]}"
	payload = {
		"title": unique_title,
		"description": "Cover create and list todos",
		"priority": "HIGH",
	}
	response = client.post(
		"/api/v1/todos",
		json=payload,
		headers={"Authorization": f"Bearer {token}"},
	)

	assert response.status_code == 201

	body = response.json()
	assert body["code"] == 201
	assert body["message"] == "created"

	todo = body["data"]
	assert todo["title"] == payload["title"]
	assert todo["description"] == payload["description"]
	assert todo["priority"] == payload["priority"]
	assert todo["status"] == "NOT_STARTED"
	assert todo["owner_id"] == user_id


def test_get_all_todos(client: TestClient):
	owner_token, owner_id = _register_and_login(
		client,
		username_prefix="owner_user",
	)
	other_token, other_id = _register_and_login(
		client,
		username_prefix="other_user",
	)

	owner_title = f"Owner todo {uuid.uuid4().hex[:6]}"
	other_title = f"Other user todo {uuid.uuid4().hex[:6]}"
	owner_payload = {
		"title": owner_title,
		"description": "Owner should see this",
		"priority": "MEDIUM",
	}
	other_payload = {
		"title": other_title,
		"description": "This should be hidden from owner",
		"priority": "LOW",
	}

	owner_create = client.post(
		"/api/v1/todos",
		json=owner_payload,
		headers={"Authorization": f"Bearer {owner_token}"},
	)
	assert owner_create.status_code == 201

	other_create = client.post(
		"/api/v1/todos",
		json=other_payload,
		headers={"Authorization": f"Bearer {other_token}"},
	)
	assert other_create.status_code == 201

	response = client.get(
		"/api/v1/todos",
		headers={"Authorization": f"Bearer {owner_token}"},
	)

	assert response.status_code == 200

	body = response.json()
	assert body["code"] == 200
	assert body["message"] == "ok"

	data = body["data"]
	assert data["meta"]["total_count"] >= 2

	todos_by_title = {todo["title"]: todo for todo in data["results"]}
	assert owner_title in todos_by_title
	assert other_title in todos_by_title

	owner_todo = todos_by_title[owner_title]
	other_todo = todos_by_title[other_title]

	assert owner_todo["owner_id"] == owner_id
	assert other_todo["owner_id"] == other_id

	assert owner_todo["description"] == owner_payload["description"]
	assert other_todo["description"] is None
