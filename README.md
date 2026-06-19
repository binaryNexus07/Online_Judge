# Judge{0} — Minimalist React Online Judge

Bansal OJ is a minimalist, responsive, light/dark themed React Single-Page Application (SPA) designed as an automated algorithmic evaluation platform. It aligns exactly with the design specifications of `online_judge_design.pdf`, focusing on Frontend Routing, Axios API service layers, and route authorizations.

To allow immediate, standalone operations without requiring a separate running database server, the application comes with a **Mock API Layer** that runs entirely client-side, intercepting standard Axios calls and simulating PostgreSQL state inside the browser's `localStorage`.

---

## 🎨 Theme & Appearance
The platform is designed with a high-fidelity, highly minimal developer interface that supports **Light Mode** and **Dark Mode**:
* **Light Mode (Ivory shade)**: Clean warm ivory background (`#FAF9F5`), white card containers, and dark typography.
* **Dark Mode (Charcoal shade)**: Matte dark gray background (`#121212`), charcoal elevations (`#1E1E1E`), and soft white typography.

---

## 📂 Question Structure
Every problem statement is displayed and created in the system matching the exact required schema:
* **id of question**: Unique identifier (e.g. `Q1`)
* **description**: Detailed challenge statement.
* **constraints**: Run limits and value ranges.
* **input**: Sample input representations.
* **output**: Expected sample output values.

---

## ⚡ Key Architectural Features

### 1. In-Memory JWT & Split Token Refresh
Adhering to security best practices outlined in the system design:
* **Access Tokens** are kept strictly in JS memory (within `AuthContext.jsx` state) rather than `localStorage`, preventing XSS theft.
* **Refresh Tokens** are sent via `httpOnly` secure cookies.
* **Axios Interceptors (`src/api/client.js`)** automatically intercept outgoing requests. If a request returns `401 Unauthorized` due to token expiry, the interceptor pauses the queue, calls `POST /auth/refresh` to secure a new in-memory `accessToken`, and retries all original requests transparently.

### 2. Client-Side Sandboxed Evaluation (JavaScript)
For JavaScript submissions, the workspace does not just mock execution; it **actually evaluates** the user's code using sandboxed client-side `Function` loops. It runs their algorithm against sample test cases and validates whether it returns correct objects/arrays/values. Non-JavaScript languages (Python, C++) simulate compile progress and produce realistic status queues.

### 3. PostgreSQL Local Database Simulation
The mock layer (`src/api/mock.js`) seeds and maintains three main tables in `localStorage`:
* **users**: Stores ID, email, password_hash, username, and role (`user` or `admin`).
* **problems**: Stores problem definitions (id, title, slug, description, constraints, input, output, difficulty, tags).
* **comments**: Stores comments with soft-delete flag (`is_deleted`). When deleted, comment bodies render as `[deleted]`.

---

## 🛠️ API Routing Compatibility Map
The frontend Axios client connects directly to standard URLs compatible with the target Express.js backend routers:

| Method | Endpoint | Description | Guard / Auth |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new coder account | Public |
| **POST** | `/api/auth/login` | Login and set refresh cookie | Public |
| **POST** | `/api/auth/refresh` | Silent page-load token refresh | Public |
| **POST** | `/api/auth/logout` | Clear session cookies | Public |
| **GET** | `/api/problems` | List problems with search/filters/pages | Public |
| **GET** | `/api/problems/:slug` | View details of a single question | Public |
| **POST** | `/api/problems` | Add a new question (id, description, etc.) | Admin Only |
| **PUT** | `/api/problems/:id` | Modify an existing question | Admin Only |
| **DELETE** | `/api/problems/:id` | Remove a question from database | Admin Only |
| **GET** | `/api/comments/:slug` | View discussion thread (soft deletes formatting) | Public |
| **POST** | `/api/comments` | Post a new discussion comment | Authenticated |
| **DELETE** | `/api/comments/:id` | Delete a comment (soft delete `is_deleted = true`) | Owner / Admin |

---
