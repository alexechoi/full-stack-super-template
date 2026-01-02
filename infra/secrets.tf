# Secret Manager Configuration
# Manages application secrets securely

# Helper local for accessing secrets in Cloud Run
locals {
  # Format: projects/PROJECT_ID/secrets/SECRET_NAME/versions/latest
  secret_prefix = "projects/${google_project.default.project_id}/secrets"
}

# =============================================================================
# Firebase Service Account for Backend Token Verification
# =============================================================================

# Create a dedicated service account for Firebase Admin SDK
resource "google_service_account" "firebase_admin" {
  provider = google-beta

  project      = google_project.default.project_id
  account_id   = "firebase-admin-sdk"
  display_name = "Firebase Admin SDK Service Account"
  description  = "Service account for Firebase Admin SDK token verification"

  depends_on = [google_project_service.serviceusage]
}

# Grant Firebase Auth Admin role to the service account
resource "google_project_iam_member" "firebase_admin_auth" {
  provider = google-beta

  project = google_project.default.project_id
  role    = "roles/firebaseauth.admin"
  member  = "serviceAccount:${google_service_account.firebase_admin.email}"
}

# Create a service account key for the Firebase Admin SDK
resource "google_service_account_key" "firebase_admin" {
  provider = google-beta

  service_account_id = google_service_account.firebase_admin.name
  public_key_type    = "TYPE_X509_PEM_FILE"
}

# Store the service account key in Secret Manager
resource "google_secret_manager_secret" "firebase_service_account" {
  provider = google-beta

  project   = google_project.default.project_id
  secret_id = "firebase-service-account"

  replication {
    auto {}
  }

  depends_on = [google_project_service.secretmanager]
}

# Add the service account key as a secret version
resource "google_secret_manager_secret_version" "firebase_service_account" {
  provider = google-beta

  secret      = google_secret_manager_secret.firebase_service_account.id
  secret_data = base64decode(google_service_account_key.firebase_admin.private_key)
}

# Grant the Cloud Run service account access to this specific secret
resource "google_secret_manager_secret_iam_member" "cloudrun_firebase_secret" {
  provider = google-beta

  project   = google_project.default.project_id
  secret_id = google_secret_manager_secret.firebase_service_account.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.cloudrun.email}"

  depends_on = [google_secret_manager_secret.firebase_service_account]
}

