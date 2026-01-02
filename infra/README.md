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

# 5. Configure GitHub Actions secrets
terraform output workload_identity_provider  # → GCP_WORKLOAD_IDENTITY_PROVIDER secret
terraform output github_actions_service_account  # → GCP_SERVICE_ACCOUNT secret
```

## What Gets Created

- GCP Project with Firebase, Firestore, Cloud Run, Artifact Registry
- Cloud Run services for backend & frontend (placeholder images initially)
- GitHub Actions Workload Identity for keyless CI/CD

## Next Steps

1. Push to GitHub to trigger CI/CD and deploy your actual app
2. View your URLs: `terraform output backend_url` and `terraform output frontend_url`

## Destroying

```bash
terraform destroy
```
