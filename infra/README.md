# Infrastructure

This directory contains Terraform configuration for provisioning the GCP infrastructure.

## Quickstart

```bash
# 1. Install prerequisites
brew install terraform google-cloud-sdk

# 2. Authenticate with GCP
gcloud auth application-default login

# 3. Configure your project
cd infra
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values:
#   - project_id: unique GCP project ID (e.g., "my-app-prod")
#   - billing_account: your GCP billing account ID
#   - github_repo: your repo (e.g., "myorg/myrepo")

# 4. Deploy infrastructure
terraform init
terraform plan    # Preview changes
terraform apply   # Apply changes

# 5. Configure GitHub Actions (after terraform apply)
# Go to GitHub repo > Settings > Secrets and variables > Actions
#
# Add Variables:
#   GCP_PROJECT_ID      = <your project id>
#   GCP_REGION          = us-central1
#   GCP_BILLING_ACCOUNT = <your billing account>
#
# Add Secrets (get values from terraform output):
#   GCP_WORKLOAD_IDENTITY_PROVIDER = $(terraform output -raw workload_identity_provider)
#   GCP_SERVICE_ACCOUNT            = $(terraform output -raw github_actions_service_account)
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Google Cloud Platform                       │
│                                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                      │
│  │   Cloud Run     │    │   Cloud Run     │                      │
│  │   (Backend)     │    │   (Frontend)    │                      │
│  │   FastAPI       │    │   Next.js       │                      │
│  └────────┬────────┘    └────────┬────────┘                      │
│           │                      │                               │
│           └──────────┬───────────┘                               │
│                      │                                           │
│           ┌──────────▼──────────┐                                │
│           │      Firebase       │                                │
│           │  ┌───────────────┐  │                                │
│           │  │ Authentication│  │                                │
│           │  │ Email/Google/ │  │                                │
│           │  │ Apple Sign-In │  │                                │
│           │  └───────────────┘  │                                │
│           │  ┌───────────────┐  │                                │
│           │  │   Firestore   │  │                                │
│           │  │   Database    │  │                                │
│           │  └───────────────┘  │                                │
│           └─────────────────────┘                                │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Artifact Registry                         │ │
│  │                    (Docker Images)                           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. **Install Terraform CLI** (v1.0+)

   ```bash
   brew install terraform
   ```

2. **Install Google Cloud CLI**

   ```bash
   brew install google-cloud-sdk
   ```

3. **Authenticate with GCP**

   ```bash
   gcloud auth application-default login
   ```

4. **Create a GCP Billing Account** (if not existing)
   - Go to [Google Cloud Console Billing](https://console.cloud.google.com/billing)

## Quick Start

1. **Copy the example variables file**

   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit `terraform.tfvars`** with your values:
   - `project_id` - Unique GCP project ID
   - `billing_account` - Your GCP billing account ID
   - `github_repo` - Your GitHub repository (e.g., `your-org/your-repo`)

3. **Initialize Terraform**

   ```bash
   terraform init
   ```

4. **Preview changes**

   ```bash
   terraform plan
   ```

5. **Apply configuration**
   ```bash
   terraform apply
   ```

## Files

| File                   | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `providers.tf`         | Terraform and provider configuration              |
| `variables.tf`         | Input variable definitions                        |
| `main.tf`              | GCP project and API enablement                    |
| `firebase.tf`          | Firebase Auth and Firestore setup                 |
| `artifact-registry.tf` | Docker container registry                         |
| `cloud-run.tf`         | Backend and Frontend Cloud Run services           |
| `iam.tf`               | Service accounts and Workload Identity Federation |
| `secrets.tf`           | Secret Manager configuration                      |
| `outputs.tf`           | Output values (URLs, config)                      |

## CI/CD Integration

The infrastructure uses **Workload Identity Federation** for secure, keyless authentication from GitHub Actions.

### Required GitHub Configuration

#### Secrets (Settings > Secrets > Actions)

| Secret                           | Description                | Example                                                                                             |
| -------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Provider | `projects/123/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT`            | Service account email      | `github-actions@your-project.iam.gserviceaccount.com`                                               |

#### Variables (Settings > Variables > Actions)

| Variable              | Description        | Example                |
| --------------------- | ------------------ | ---------------------- |
| `GCP_PROJECT_ID`      | GCP project ID     | `my-project-id`        |
| `GCP_REGION`          | GCP region         | `us-central1`          |
| `GCP_BILLING_ACCOUNT` | Billing account ID | `XXXXXX-XXXXXX-XXXXXX` |

### Getting Output Values

After applying Terraform, get the values for GitHub configuration:

```bash
# Get Workload Identity Provider
terraform output workload_identity_provider

# Get GitHub Actions service account
terraform output github_actions_service_account
```

## Secret Manager

GCP Secret Manager is enabled for secure storage of sensitive configuration. Cloud Run services have access to secrets via the `secretmanager.secretAccessor` role.

### Creating Secrets

```bash
# Create a secret
gcloud secrets create my-api-key --project=YOUR_PROJECT_ID

# Add a secret version
echo -n "your-secret-value" | gcloud secrets versions add my-api-key --data-file=-
```

### Accessing Secrets in Cloud Run

Secrets can be mounted as environment variables or files. Update `cloud-run.tf` to add secret references:

```hcl
env {
  name = "API_KEY"
  value_source {
    secret_key_ref {
      secret  = "my-api-key"
      version = "latest"
    }
  }
}
```

## Firebase Authentication

### Email/Password

Enabled by default.

### Google Sign-In

1. Create OAuth credentials in [GCP Console](https://console.cloud.google.com/apis/credentials)
2. Add to `terraform.tfvars`:
   ```hcl
   oauth_client_id     = "your-client-id.apps.googleusercontent.com"
   oauth_client_secret = "your-client-secret"
   ```

### Apple Sign-In

1. Register your app in [Apple Developer Console](https://developer.apple.com/)
2. Create a Sign In with Apple key
3. Add to `terraform.tfvars`:
   ```hcl
   apple_team_id     = "XXXXXXXXXX"
   apple_key_id      = "XXXXXXXXXX"
   apple_private_key = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
   apple_bundle_id   = "com.yourcompany.yourapp"
   ```

## Outputs

After applying, you can view outputs:

```bash
# View all outputs
terraform output

# Get specific values
terraform output backend_url
terraform output frontend_url
terraform output firebase_config
```

## Destroying Infrastructure

To tear down all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the Firestore database. Make sure to backup any important data first.
