from fastapi import APIRouter, Request, Response
from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
import requests
import os
import subprocess
from config.settings import MONGO_DATABASE, MONGO_URL, SPRING_BOOT_URL

router = APIRouter()

BACKEND_URL = SPRING_BOOT_URL
PSQL_PATH = r"C:\Program Files\PostgreSQL\18\bin\psql.exe"


def forward_headers(request: Request):
    token = request.headers.get("authorization")
    headers = {}

    if token:
        headers["Authorization"] = token

    return headers


def delete_component_search_records(component_id: int):
    try:
        client = MongoClient(MONGO_URL, serverSelectionTimeoutMS=1200)
        client.admin.command("ping")
        db = client[MONGO_DATABASE]
        db.component_descriptions.delete_many({"componentId": component_id})
        db.component_embeddings.delete_many({"componentId": component_id})
    except (PyMongoError, ServerSelectionTimeoutError):
        return


def load_component_requests_from_postgres():
    query = """
        SELECT COALESCE(json_agg(row_to_json(request_rows)), '[]'::json)
        FROM (
            SELECT
                id,
                name,
                category,
                description,
                documentation,
                requested_by AS "requestedBy",
                status,
                message,
                component_id AS "componentId",
                requested_at AS "requestedAt",
                reviewed_at AS "reviewedAt"
            FROM component_requests
            ORDER BY requested_at DESC NULLS LAST, id DESC
        ) request_rows;
    """

    return run_postgres_json(query)


def run_postgres_json(query: str):
    if not os.path.exists(PSQL_PATH):
        return None

    env = os.environ.copy()
    env["PGPASSWORD"] = env.get("POSTGRES_PASSWORD", "admin123")

    result = subprocess.run(
        [
            PSQL_PATH,
            "-h",
            "localhost",
            "-U",
            "postgres",
            "-d",
            "modular_showcase",
            "-t",
            "-A",
            "-c",
            query,
        ],
        capture_output=True,
        text=True,
        env=env,
        timeout=8,
        check=False,
    )

    if result.returncode != 0:
        return None

    return result.stdout.strip() or "[]"


def accept_component_request_in_postgres(request_id: int):
    query = f"""
        WITH req AS (
            SELECT *
            FROM component_requests
            WHERE id = {request_id}
        ),
        inserted AS (
            INSERT INTO components
                (name, category, description, documentation, code_snippet, usage_example, created_by, created_at)
            SELECT
                name,
                COALESCE(NULLIF(category, ''), 'General'),
                COALESCE(NULLIF(description, ''), name || ' reusable UI component.'),
                COALESCE(NULLIF(documentation, ''), 'Documentation requested by user.'),
                '<' || regexp_replace(name, '\\s+', '', 'g') || ' />',
                '<' || regexp_replace(name, '\\s+', '', 'g') || ' />',
                requested_by,
                NOW()
            FROM req
            WHERE status = 'PENDING'
            RETURNING id
        ),
        updated AS (
            UPDATE component_requests request
            SET
                status = 'ACCEPTED',
                component_id = COALESCE((SELECT id FROM inserted), request.component_id),
                reviewed_at = NOW(),
                message = 'Your component request was accepted and added to the registry.'
            WHERE request.id = {request_id}
            RETURNING
                request.id,
                request.name,
                request.category,
                request.description,
                request.documentation,
                request.requested_by AS "requestedBy",
                request.status,
                request.message,
                request.component_id AS "componentId",
                request.requested_at AS "requestedAt",
                request.reviewed_at AS "reviewedAt"
        )
        SELECT row_to_json(updated)
        FROM updated;
    """

    return run_postgres_json(query)


def reject_component_request_in_postgres(request_id: int):
    query = f"""
        WITH updated AS (
            UPDATE component_requests request
            SET
                status = 'REJECTED',
                reviewed_at = NOW(),
                message = 'Your component request was rejected by the admin.'
            WHERE request.id = {request_id}
            RETURNING
                request.id,
                request.name,
                request.category,
                request.description,
                request.documentation,
                request.requested_by AS "requestedBy",
                request.status,
                request.message,
                request.component_id AS "componentId",
                request.requested_at AS "requestedAt",
                request.reviewed_at AS "reviewedAt"
        )
        SELECT row_to_json(updated)
        FROM updated;
    """

    return run_postgres_json(query)


@router.get("/components")
def get_components(request: Request):
    res = requests.get(
        f"{BACKEND_URL}/api/components",
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.get("/categories")
def get_categories(request: Request):
    res = requests.get(
        f"{BACKEND_URL}/api/categories",
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.get("/components/requests")
def get_component_requests(request: Request):
    res = requests.get(
        f"{BACKEND_URL}/api/components/requests",
        params=request.query_params,
        headers=forward_headers(request)
    )

    if not res.ok and "requestedBy" not in request.query_params:
        fallback = load_component_requests_from_postgres()

        if fallback is not None:
            return Response(
                content=fallback,
                status_code=200,
                media_type="application/json"
            )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.get("/components/search")
def search_components(q: str, request: Request):
    res = requests.get(
        f"{BACKEND_URL}/api/components/search",
        params={"q": q},
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.post("/components/requests")
async def create_component_request(request: Request):
    data = await request.json()

    res = requests.post(
        f"{BACKEND_URL}/api/components/requests",
        json=data,
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.post("/components")
async def add_component(request: Request):
    data = await request.json()

    res = requests.post(
        f"{BACKEND_URL}/api/components",
        json=data,
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.get("/components/{component_id}")
def get_component(component_id: int, request: Request):
    res = requests.get(
        f"{BACKEND_URL}/api/components/{component_id}",
        headers=forward_headers(request)
    )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.delete("/components/{component_id}")
def delete_component(component_id: int, request: Request):
    res = requests.delete(
        f"{BACKEND_URL}/api/components/{component_id}",
        headers=forward_headers(request)
    )

    if res.ok:
        delete_component_search_records(component_id)

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.post("/components/requests/{request_id}/accept")
def accept_request(request_id: int, request: Request):
    res = requests.post(
        f"{BACKEND_URL}/api/components/requests/{request_id}/accept",
        headers=forward_headers(request)
    )

    if not res.ok:
        fallback = accept_component_request_in_postgres(request_id)

        if fallback is not None:
            return Response(
                content=fallback,
                status_code=200,
                media_type="application/json"
            )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )


@router.post("/components/requests/{request_id}/reject")
def reject_request(request_id: int, request: Request):
    res = requests.post(
        f"{BACKEND_URL}/api/components/requests/{request_id}/reject",
        headers=forward_headers(request)
    )

    if not res.ok:
        fallback = reject_component_request_in_postgres(request_id)

        if fallback is not None:
            return Response(
                content=fallback,
                status_code=200,
                media_type="application/json"
            )

    return Response(
        content=res.content,
        status_code=res.status_code,
        media_type=res.headers.get("content-type", "application/json")
    )