# CompilingJava

CompilingJava is a full-stack portfolio platform built as a real application rather than a static personal site. The repo combines a React and TypeScript frontend with a Spring Boot backend that supports content publishing, project case studies, admin workflows, authentication, comments, likes, and interactive feature routes.

## What This Repo Contains

- `frontend/`
  React 18, TypeScript, Tailwind CSS, React Router, and a route-driven portfolio UI.
- `backend/`
  Spring Boot 3.5, Java 17, PostgreSQL, Flyway, Spring Security, caching, and deployment scripts.
- `JIT_cafe/`
  A separate React/Vite product prototype kept alongside the main site workspace.

## Why This Exists

This project is the platform behind `compilingjava.com`. The goal is to show software engineering work through the product itself:

- structured project and blog publishing
- interactive product demos and feature routes
- backend-backed engagement and admin tooling
- local development and production deployment workflows

## Stack

- Frontend: React, TypeScript, Tailwind CSS, React Router, React Markdown
- Backend: Java 17, Spring Boot, Spring Security, JPA, Flyway
- Data: PostgreSQL
- Deployment: GitHub Pages for the frontend, Google Cloud Run and Cloud SQL support for the backend

## Repo Layout

```text
frontend/
  src/
    components/
    context/
    features/
    lib/
    pages/
    routes/
backend/
  src/main/java/com/compilingjava/
    auth/
    comment/
    content/
    like/
    security/
    spotify/
    user/
  src/main/resources/
    db/migration/
  scripts/
  docs/
JIT_cafe/
```

## Local Development

### Frontend

```powershell
cd frontend
npm install
npm start
```

The frontend expects the backend at `http://localhost:8080` in local development.

### Backend

The backend includes Windows PowerShell scripts for starting PostgreSQL and running Spring Boot locally.

```powershell
cd backend
.\scripts\start-localdb.ps1
.\scripts\run-backend-localdb.ps1
```

Useful alternatives:

- `.\mvnw.cmd test`
- `.\mvnw.cmd spring-boot:run`

## Key Features

- portfolio and blog content platform with typed frontend models
- admin content creation and editing flows
- session-based auth plus Google auth support
- comments and like engagement features
- feature routes including AddToTheAUX, Tic Tac Toe, and JIT Cafe
- production-oriented backend config, migrations, and deployment docs

## Deployment Notes

Backend deployment references live in:

- `backend/docs/PRODUCTION_GO_LIVE.md`
- `backend/docs/CLOUDRUN_CLOUDSQL_TESTING.md`

Frontend deployment is configured through the scripts in `frontend/package.json`.

## Status

This is an active working codebase. Some parts of the repo are under active iteration, but the platform is structured as a real deployed system rather than a throwaway demo.
