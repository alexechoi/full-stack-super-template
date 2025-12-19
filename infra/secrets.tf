# Secret Manager Configuration
# Manages application secrets securely

# Example secret for API keys or other sensitive configuration
# Uncomment and modify as needed for your application

# resource "google_secret_manager_secret" "api_key" {
#   provider = google-beta
#
#   project   = google_project.default.project_id
#   secret_id = "api-key"
#
#   replication {
#     auto {}
#   }
#
#   depends_on = [google_project_service.secretmanager]
# }

# To add a secret version, use:
# resource "google_secret_manager_secret_version" "api_key_v1" {
#   provider = google-beta
#
#   secret      = google_secret_manager_secret.api_key.id
#   secret_data = var.api_key  # Define in variables.tf with sensitive = true
# }

# Helper local for accessing secrets in Cloud Run
locals {
  # Format: projects/PROJECT_ID/secrets/SECRET_NAME/versions/latest
  secret_prefix = "projects/${google_project.default.project_id}/secrets"
}

