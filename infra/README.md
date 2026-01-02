# Infrastructure

Terraform configuration for provisioning GCP infrastructure.

## ⚠️ Do NOT Create the GCP Project Manually

Terraform creates the project for you. You only need a **Billing Account ID** before starting.

## Quickstart

```bash
# 1. Install & authenticate
brew install terraform google-cloud-sdk
gcloud auth application-default login

# 2. Configure
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your billing_account, project_id, and github_repo

# 3. Deploy
terraform init
terraform apply

# 4. Get Firebase config for frontend
terraform output -json firebase_config | jq -r '
  "NEXT_PUBLIC_FIREBASE_API_KEY=\(.api_key)",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=\(.auth_domain)",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID=\(.project_id)",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=\(.storage_bucket)",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=\(.messaging_sender_id)",
  "NEXT_PUBLIC_FIREBASE_APP_ID=\(.app_id)"
' > ../frontend/.env.local

# 5. Get Firebase config for Expo app (if configured)
# For iOS: Download GoogleService-Info.plist
terraform output -json firebase_ios_config | jq -r '.config_file_contents' | base64 -d > ../expo-app/GoogleService-Info.plist

# For Android: Download google-services.json
terraform output -json firebase_android_config | jq -r '.config_file_contents' | base64 -d > ../expo-app/google-services.json

# 6. Configure GitHub Actions secrets
terraform output workload_identity_provider  # → GCP_WORKLOAD_IDENTITY_PROVIDER secret
terraform output github_actions_service_account  # → GCP_SERVICE_ACCOUNT secret
```

## Mobile App Configuration (Optional)

To enable Firebase for the Expo mobile app, set these variables in `terraform.tfvars`:

```hcl
expo_ios_bundle_id        = "com.yourcompany.expoapp"
expo_android_package_name = "com.yourcompany.expoapp"
```

After running `terraform apply`, download the Firebase config files:

```bash
# iOS: GoogleService-Info.plist
terraform output -json firebase_ios_config | jq -r '.config_file_contents' | base64 -d > ../expo-app/GoogleService-Info.plist

# Android: google-services.json
terraform output -json firebase_android_config | jq -r '.config_file_contents' | base64 -d > ../expo-app/google-services.json
```

Then run `npm run prebuild` in the expo-app directory to generate native projects.

## What Gets Created

- GCP Project with Firebase, Firestore, Cloud Run, Artifact Registry
- Cloud Run services for backend & frontend (placeholder images initially)
- GitHub Actions Workload Identity for keyless CI/CD
- Firebase iOS and Android apps (optional, for Expo mobile app)

## Next Steps

1. Push to GitHub to trigger CI/CD and deploy your actual app
2. View your URLs: `terraform output backend_url` and `terraform output frontend_url`

## Destroying

```bash
terraform destroy
```
