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

## Push Notifications (iOS APNs Setup)

Push notifications require additional setup for iOS. Android works out of the box with the `google-services.json` file.

### Prerequisites

- Apple Developer Program membership ($99/year)
- Physical iOS device (simulators don't support push notifications)

### Step 1: Create an APNs Key

1. Go to [Apple Developer Console](https://developer.apple.com/account/resources/authkeys/list)
2. Click **Keys** in the sidebar, then **+** to create a new key
3. Enter a key name (e.g., "Push Notifications Key")
4. Check **Apple Push Notifications service (APNs)**
5. Click **Continue**, then **Register**
6. Download the `.p8` file and note the **Key ID** (you'll need both)
7. Also note your **Team ID** from the top right of the developer portal

### Step 2: Upload to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** (gear icon) > **Cloud Messaging** tab
4. Scroll to **Apple app configuration**
5. Under **APNs Authentication Key**, click **Upload**
6. Upload the `.p8` file you downloaded
7. Enter the **Key ID** and your **Team ID**
8. Click **Upload**

### Step 3: Rebuild the App

After configuring APNs, rebuild the native iOS project:

```bash
cd expo-app
npx expo prebuild --clean
npx expo run:ios
```

### Testing Push Notifications

1. Sign in to the app on a physical iOS device
2. Accept the notification permission prompt
3. Use the backend test endpoint:

```bash
curl -X POST http://localhost:8000/notifications/test \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json"
```

Or send a custom notification:

```bash
curl -X POST http://localhost:8000/notifications/send \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Hello", "body": "This is a test notification"}'
```
