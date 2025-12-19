# Terraform Outputs
# Values exported for use in CI/CD and application configuration

output "project_id" {
  description = "The GCP project ID"
  value       = google_project.default.project_id
}

output "project_number" {
  description = "The GCP project number"
  value       = google_project.default.number
}

# Cloud Run URLs
output "backend_url" {
  description = "The URL of the backend Cloud Run service"
  value       = google_cloud_run_v2_service.backend.uri
}

output "frontend_url" {
  description = "The URL of the frontend Cloud Run service"
  value       = google_cloud_run_v2_service.frontend.uri
}

# Artifact Registry
output "docker_registry" {
  description = "The Docker registry URL for container images"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/docker"
}

# Workload Identity Federation
output "workload_identity_provider" {
  description = "The Workload Identity Provider resource name for GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "github_actions_service_account" {
  description = "The service account email for GitHub Actions"
  value       = google_service_account.github_actions.email
}

# Firebase Configuration
output "firebase_config" {
  description = "Firebase configuration for web apps"
  value = {
    api_key             = data.google_firebase_web_app_config.default.api_key
    auth_domain         = data.google_firebase_web_app_config.default.auth_domain
    project_id          = var.project_id
    storage_bucket      = data.google_firebase_web_app_config.default.storage_bucket
    messaging_sender_id = data.google_firebase_web_app_config.default.messaging_sender_id
    app_id              = google_firebase_web_app.default.app_id
  }
  sensitive = true
}

