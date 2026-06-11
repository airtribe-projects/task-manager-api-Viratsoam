# Task Manager API

A lightweight RESTful API for managing tasks, built with **Node.js** and **Express**. Tasks are persisted to a local JSON file ([task.json](task.json)), making it simple to set up and experiment with — no external database required.

This project is part of **Assignment 1 for the Airtribe Backend Engineering Launchpad**.

---

## Overview

The Task Manager API provides full CRUD (Create, Read, Update, Delete) functionality over a collection of tasks. Each task has the following structure:

```json
{
  "id": 1,
  "title": "Set up environment",
  "description": "Install Node.js, npm, and git",
  "completed": true
}
```

**Key features:**

- Create, read, update, and delete tasks
- Server-side input validation (types, required fields, empty strings)
- File-based persistence (no DB setup required)
- Automated test suite using [`tap`](https://www.npmjs.com/package/tap) and [`supertest`](https://www.npmjs.com/package/supertest)
- Postman collection for manual exploration
- Clear, conventional HTTP status codes (`200`, `201`, `400`, `404`)

---

## Project Structure

```
task-manager-api-Viratsoam/
├── app.js                          # Express app with all route handlers
├── task.json                       # Persistent storage for tasks
├── package.json                    # Dependencies and scripts
├── test/
│   └── server.test.js              # tap + supertest test suite
├── postman/
│   └── task-manager-api.postman_collection.json
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js** `>= 18.0.0` — check with `node -v`
- **npm** — bundled with Node.js

### 1. Clone the repository

```bash
git clone <repository-url>
cd task-manager-api-Viratsoam
```

### 2. Install dependencies

```bash
npm install
```

This installs:
- **express** — web framework
- **tap** (dev) — test runner
- **supertest** (dev) — HTTP assertions

### 3. Start the server

```bash
node app.js
```

You should see:

```
Server is listening on 3000
```

The API is now available at `http://localhost:3000`.

### 4. Run the test suite (optional)

```bash
npm test
```

This runs [`test/server.test.js`](test/server.test.js) against the Express app using `supertest` and `tap`.

---

## API Endpoints

Base URL: `http://localhost:3000`

All request and response bodies are JSON. For `POST` and `PUT`, send a `Content-Type: application/json` header.

| Method | Endpoint       | Description           | Success | Errors              |
| ------ | -------------- | --------------------- | ------- | ------------------- |
| GET    | `/tasks`       | List all tasks        | `200`   | —                   |
| GET    | `/tasks/:id`   | Get a single task     | `200`   | `400`, `404`        |
| POST   | `/tasks`       | Create a new task     | `201`   | `400`               |
| PUT    | `/tasks/:id`   | Update an existing task | `200` | `400`, `404`        |
| DELETE | `/tasks/:id`   | Delete a task         | `200`   | `400`, `404`        |

### Validation rules (POST and PUT)

A request body is **invalid** (`400`) if any of the following are true:

- Body is not a JSON object
- `title`, `description`, or `completed` is missing
- `title` or `description` is not a string, or `completed` is not a boolean
- `title` or `description` is an empty / whitespace-only string

---

## Testing the API

You can exercise the API in three ways: the automated test suite, the included Postman collection, or manual `curl` requests.

### Option A — Run the automated tests

```bash
npm test
```

The suite in [`test/server.test.js`](test/server.test.js) covers:

- `POST /tasks` — valid input, missing fields, empty title/description, wrong type for `completed`
- `GET /tasks` — response shape and field types
- `GET /tasks/:id` — existing task, non-existent ID, non-numeric ID
- `PUT /tasks/:id` — valid update, non-existent ID, invalid data, empty title
- `DELETE /tasks/:id` — existing task, non-existent ID

### Option B — Postman collection

A ready-to-use Postman collection is included at [postman/task-manager-api.postman_collection.json](postman/task-manager-api.postman_collection.json). It contains pre-configured requests for every endpoint, including example payloads and example responses.

**To import:**

1. Open Postman.
2. Click **Import** (top-left).
3. Select **Upload Files** and pick `postman/task-manager-api.postman_collection.json`, or drag-and-drop the file.
4. The collection **Task Manager API** appears in the sidebar.

**Optional: configure an environment**

1. Click **Environments** → **Create new environment**.
2. Add a variable:
   - **Variable:** `baseUrl`
   - **Initial value / Current value:** `http://localhost:3000`
3. Activate the environment from the environment dropdown (top-right).
4. In the collection, every request URL is written as `{{baseUrl}}/tasks` — Postman will substitute it automatically.

**Collection contents:**

| # | Request                       | Method | URL                          |
| - | ----------------------------- | ------ | ---------------------------- |
| 1 | Get all tasks                 | GET    | `{{baseUrl}}/tasks`          |
| 2 | Get task by ID                | GET    | `{{baseUrl}}/tasks/1`        |
| 3 | Create a task                 | POST   | `{{baseUrl}}/tasks`          |
| 4 | Update a task                 | PUT    | `{{baseUrl}}/tasks/1`        |
| 5 | Delete a task                 | DELETE | `{{baseUrl}}/tasks/1`        |
| 6 | Get task with invalid ID      | GET    | `{{baseUrl}}/tasks/abc`      |
| 7 | Get non-existent task         | GET    | `{{baseUrl}}/tasks/999`      |
| 8 | Create task with invalid body | POST   | `{{baseUrl}}/tasks`          |

**Make sure the server is running** (`node app.js`) before sending requests from Postman.

### Option C — Manual requests with `curl`

> The examples below assume the server is running on port 3000. If a request mutates the file (POST, PUT, DELETE), seed data will change — restart from a fresh `task.json` if you want a clean slate.

**Get all tasks**

```bash
curl -i http://localhost:3000/tasks
```

**Get a single task (id = 1)**

```bash
curl -i http://localhost:3000/tasks/1
```

**Create a new task**

```bash
curl -i -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread","completed":false}'
```

Expected response: `201 Created` with the new task (including its assigned `id`).

**Update a task (id = 1)**

```bash
curl -i -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Set up environment (updated)","description":"Install Node.js, npm, and git","completed":true}'
```

**Delete a task (id = 1)**

```bash
curl -i -X DELETE http://localhost:3000/tasks/1
```

Expected response: `200 OK` with the deleted task body.

### Expected status codes at a glance

| Scenario                                  | Status |
| ----------------------------------------- | ------ |
| Successful read / update / delete         | `200`  |
| Successful create                         | `201`  |
| Validation failure (POST/PUT)             | `400`  |
| Non-numeric `:id` in URL                  | `400`  |
| Task with given `:id` does not exist      | `404`  |

---

## License

ISC — see [package.json](package.json).
