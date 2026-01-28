# ClassMate - Course Registration Application

**Why?** Building to solve the common issues faced by students in my university while registering for courses due to a substandard workflow - building for students, built by a student.

**Note:** This project is being actively developed, and is intended to be a potential replacement/extension to my university's existing course registration system by May 2026.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

## Overview

This repository contains the **full-stack course registration system**, including both the **frontend (Next.js)** and a **TypeScript-based backend (Node.js + Express)**. The system is being designed with clear separation of concerns, strong typing, and real-world authentication and data validation practices.

---

The system currently supports:

* Student signup and login
* Domain-restricted signup (`@northeastern.edu` emails only)
* Viewing available courses
* Registering for courses with seat availability checks (frontend development in-progress)

For development and testing purposes, the backend also allows course creation, editing, and deletion. These actions are intentionally kept flexible at the moment and are planned to be restricted to admin users in a future iteration.

---

## Tech Stack

### Frontend

* **Next.js (App Router)** – routing, layouts, and server/client component model
* **React** – UI composition
* **TypeScript** – strict typing across components and API calls
* **Tailwind CSS** – utility-first styling
* **shadcn/ui** – reusable, accessible UI primitives
* **Fetch API** – backend communication via a typed API layer

### Backend

* **Node.js** – runtime environment
* **Express** – HTTP server and routing
* **TypeScript** – end-to-end type safety
* **Zod** – request validation and schema enforcement
* **JWT (JSON Web Tokens)** – user authentication
* **bcrypt** – secure password hashing

---

### Database

* Currently, designed for **MongoDB** with future iterations planned to include PostgreSQL support.

---

## Project Structure

### Frontend

```
src/
├── app/
│   ├── login/          # Login page
│   ├── signup/         # Signup page
│   ├── courses/        # Course listing & registration
│   └── layout.tsx      # Root layout
│
├── components/
│   ├── Navbar.tsx      # Application navigation
│   └── ui/             # shadcn/ui components
│
├── lib/
│   └── api.ts          # Typed API wrapper
```

This separation keeps UI components, routing, and backend communication clearly defined and easy to scale.

### Backend

```
server/
├── src/
│   ├── models/         # Data models
│   ├── routes/         # Express route definitions
│   ├── controllers/   # Request handlers & business logic
│   ├── middleware/    # Auth & validation middleware
│   ├── validators/    # Zod schemas
│   └── index.ts        # Server entry point
|   └── types           # Used to extend Express' Request type
```

The backend follows a layered architecture to keep routing, validation, and business logic clearly separated.

---

## Authentication Flow

### Backend Authentication

* Passwords are **hashed using bcrypt** before being stored
* Users authenticate via **JWT-based authentication**
* Tokens are issued on successful login and used to protect restricted routes
* Authentication middleware verifies JWTs on incoming requests

### Signup

* Users sign up using an email ending with `@northeastern.edu`
* Requests are validated using **Zod schemas** before processing
* Passwords are hashed before persistence

### Login

* Credentials are validated and checked against hashed passwords
* A JWT is issued upon successful authentication

### Frontend Integration

* Credentials are sent via a centralized API layer
* Errors are surfaced cleanly to the UI
* Authentication state is currently page-scoped; global persistence is planned

---

## API Layer

### Frontend

All frontend-to-backend communication goes through a centralized API utility:

* Generic typing for endpoint responses
* Centralized error handling
* Consistent headers and configuration

This ensures frontend state stays aligned with backend contracts.

### Backend

* Express routes delegate logic to controllers
* Zod validators enforce request shapes at the boundary
* Controllers handle business logic and interact with models

This structure reduces duplication and makes the system easier to extend.

---

## Styling & UI

* Tailwind CSS is used for layout and spacing
* shadcn/ui components provide accessible, composable UI primitives
* Layout components (such as the Navbar) are custom-built to match application needs

The UI intentionally prioritizes clarity and usability over heavy visual customization.

---

## Environment Configuration

The frontend expects a backend API URL to be provided via environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

This allows seamless switching between local development and production environments - as planned for deployment on Vercel in the coming iterations.

---

## Planned Improvements

* Persistent authentication state (Auth context)
* Protected routes (login-required pages)
* "My Courses" dashboard
* Concurrency and race condition handling
* Migration to PostgreSQL
* Role-based access control (student vs admin)
* Improved loading states and skeletons
* Deployment to Vercel
