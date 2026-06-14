# PS-30: Modular Component Showcase Application

A full-stack system for showcasing reusable UI components with categories, live previews, documentation, role-based management, and intelligent semantic search.

## 10-Point Project Completion

1. **Problem Identification**
   - Teams repeatedly rebuild common UI components because reusable components are hard to discover, preview, and understand.
   - This application centralizes components, documentation, usage examples, and intelligent search.

2. **Frontend UI**
   - Dark responsive React frontend in `frontend/`.
   - Displays the problem statement, marks criteria, component cards, categories, documentation, semantic search, JWT login, and admin actions.
   - Uses the API Gateway as the single integration point.

3. **API Gateway: FastAPI**
   - Located in `gateway/`.
   - Exposes unified `/gateway/*` endpoints for frontend clients.
   - Proxies auth and JWT-protected CRUD requests to Spring Boot backend.
   - Performs MongoDB semantic search and writes search usage logs.

4. **Backend: Spring Boot**
   - Located in `backend/`.
   - Provides JWT authentication, role-based access, category CRUD, and component CRUD.
   - Admin users can create, update, and delete components and categories.
   - Normal users can view and semantically search components.

5. **Database Design: PostgreSQL**
   - SQL schema in `database/postgres/schema.sql`.
   - Tables: `users`, `categories`, `components`, `usage_logs`.
   - Components are linked to categories and creators.

6. **MongoDB Design**
   - Seed script in `database/mongo/seed.js`.
   - Collections:
     - `component_descriptions`
     - `component_embeddings`
     - `usage_logs`

7. **Vector Search Requirement**
   - Gateway implements semantic component search over MongoDB descriptions and embeddings.
   - Example queries:
     - `Form validation components`
     - `Reusable dashboard widgets`
   - The implementation includes deterministic fallback embeddings for local demo use.

8. **System Integration**
   - Frontend calls FastAPI Gateway.
   - Gateway calls Spring Boot for relational CRUD.
   - Gateway calls MongoDB for semantic descriptions, embeddings, and logs.
   - Spring Boot uses PostgreSQL for users, roles, categories, and components.

9. **Security**
   - Spring Boot uses JWT bearer tokens.
   - Role-based authorization protects admin-only write APIs.
   - Passwords are stored using BCrypt.

10. **Testing and Demo Flow**
   - Register/login user from backend.
   - Browse components from frontend.
   - Search semantically through gateway.
   - Admin can add reusable UI components.
   - Usage logs are inserted into MongoDB whenever semantic search is used.

## Project Structure

```text
frontend/                 Browser UI
gateway/                  FastAPI API Gateway and semantic search
backend/                  Spring Boot backend
database/postgres/        PostgreSQL schema and seed SQL
database/mongo/           MongoDB seed script

```

## Quick Start

Start databases:


Run Spring Boot backend:

```powershell
cd backend/coreservices
.\mvn.cmd spring-boot:run
```

Run FastAPI gateway:

```powershell
cd gateway
pip install -r requirements.txt
uvicorn main:app --reload --port 9000
```

Open the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Then visit:

```text
http://localhost:5173
```

Demo users:

```text
admin@gmail.com / admin123
user@gmail.com / user123
```

## Default API URLs

- Frontend: `http://localhost:5173`
- FastAPI Gateway: `http://localhost:9000`
- Spring Boot Backend: `http://localhost:8000`
- PostgreSQL: `localhost:5432/modular_showcase`
- MongoDB: `localhost:27017`

## Main Endpoints

Gateway:

```text
GET  /health
POST /gateway/auth/login
POST /gateway/auth/signup
GET  /gateway/components
POST /gateway/components                 ADMIN
PUT  /gateway/components/{id}            ADMIN
DELETE /gateway/components/{id}          ADMIN
GET  /gateway/categories
POST /gateway/categories                 ADMIN
POST /gateway/search/semantic
```

Backend:

```text
POST /auth/signup
POST /auth/login
GET  /api/components            JWT
POST /api/components            ADMIN
PUT  /api/components/{id}       ADMIN
DELETE /api/components/{id}     ADMIN
GET  /api/categories            JWT
POST /api/categories            ADMIN
```
