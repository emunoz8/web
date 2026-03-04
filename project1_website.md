# CompilingJava Web Platform
### Full-Stack Portfolio and Publishing System
**2026**

This project is the platform behind my portfolio site. Rather than treating the website as a static set of pages, I designed it as a small full-stack application with its own content model, publishing workflow, authentication, and administrative tooling.

The objective was to build a portfolio that functions like a maintainable product: content can be created and updated through the application itself, public pages remain fast and structured, and the platform can continue to absorb new features over time without being rebuilt from scratch.

---

## Overview

The platform supports both public content delivery and authenticated content management.

Public-facing capabilities include:

- project and blog presentation through a unified content system
- category-based browsing and filtering
- markdown-backed long-form content rendering
- interactive project pages integrated into the portfolio experience

Administrative capabilities include:

- authenticated content publishing and editing
- online management of projects and blog entries
- category management for content organization
- protected admin workflows separated from the public experience

---

## Architecture

The application is built as a React and TypeScript frontend backed by a Java Spring Boot API with a PostgreSQL data layer.

At a high level, the system is responsible for:

- serving structured content through API endpoints
- persisting portfolio and blog data in a relational schema
- rendering public-facing content in a browser-first frontend
- handling authenticated admin operations through protected backend routes
- supporting iterative feature development without coupling all changes to static page edits

This architecture lets the site behave more like a lightweight content platform than a traditional portfolio.

---

## Technical Focus

Several engineering decisions shaped the project:

- content is modeled centrally so projects and blog posts can share querying, browsing, and management flows
- markdown support is used to keep long-form content maintainable without hardcoding presentation into the frontend
- admin workflows are handled through the application itself, reducing the need for manual content deployments
- the backend is structured to support authenticated operations, public read APIs, and future feature expansion
- the platform doubles as a safe place to ship experimental interfaces and product ideas

Recent platform work has also included improving production auth behavior, session handling, CSRF protection, and deployment readiness for the live environment.

---

## Why It Matters

The most valuable outcome of this project is not the website alone, but the system it created.

Once the platform existed, it became infrastructure for everything else on the site:

- new projects can be published through the admin flow
- blog content can be managed as application data rather than hardcoded UI
- new interactive experiences can be added as first-class parts of the portfolio
- the site can evolve continuously without rethinking the entire foundation each time

In practice, this project turned the portfolio into a reusable software platform rather than a one-off presentation layer.

---

## Scope

This writeup intentionally focuses on product architecture, system design, and public-facing functionality. It avoids implementation details that are better kept out of a public project summary, particularly around internal security and operational configuration.

If you are viewing this on the live site, then this project description is being served by the same platform it describes.
