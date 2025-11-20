## Local Development (Docker)

The repository now ships with a multi-service Docker setup that runs the MongoDB-backed API alongside the Vite development server.

### Requirements
- Docker 24+
- Docker Compose v2 (`docker compose` CLI)

### Bootstrapping the stack
```bash
docker compose up --build
```

Services:
- `api` → Express/TypeScript backend on `http://localhost:4000`
- `frontend` → Vite dev server (with HMR) on `http://localhost:5173`
- `mongo` → MongoDB 6.0 instance exposed on `localhost:27018`

Both the backend and frontend folders are bind-mounted, so you still edit files locally and watch the containers reload automatically. Node modules for each service stay inside Docker volumes (`backend_node_modules`, `frontend_node_modules`) so your host installation is untouched.

To stop the stack:
```bash
docker compose down
```

### Environment variables
Create a `.env` file in the repository root (Compose automatically picks it up) with your cloud credentials:

```
AWS_REGION=<your-region>
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret>
AWS_BUCKET_NAME=<public-bucket-name>
```

These values are injected into the backend container and are required for announcement avatar uploads to reach S3. When running the backend outside Docker, load the same variables via your preferred method (e.g., `backend/.env` + `dotenv`).
