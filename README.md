# Full Stack Super Template

A starter template with frontend, backend, mobile app, and GCP infrastructure.

## Components

| Directory | Description |
|-----------|-------------|
| `frontend/` | Next.js 16 + React 19 + Tailwind CSS |
| `backend/` | FastAPI + Python 3.13 (managed with uv) |
| `expo-app/` | Expo 54 + React Native mobile app |
| `infra/` | Terraform configs for GCP (Cloud Run, Firebase, Artifact Registry) |

## Quickstart

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### Backend

```bash
cd backend
uv sync
uv run main
```

Open http://localhost:8000

### Mobile App

```bash
cd expo-app
npm install
npx expo start
```

Scan the QR code with Expo Go or run on a simulator.

### Infrastructure

See [`infra/README.md`](./infra/README.md) for GCP setup. Quick version:

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your GCP project ID, billing account, and GitHub repo
terraform init
terraform apply
```

## CI/CD

GitHub Actions workflows in `.github/workflows/`:

- `deploy.yml` - Builds and deploys frontend/backend to Cloud Run on push to main
- `terraform.yml` - Runs `terraform plan` on PRs, `terraform apply` on merge to main

Requires GitHub secrets/variables configured per [`infra/README.md`](./infra/README.md#cicd-integration).
