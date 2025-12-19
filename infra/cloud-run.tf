# Cloud Run Configuration
# Backend (FastAPI) and Frontend (Next.js) services

locals {
  docker_registry = "${var.region}-docker.pkg.dev/${var.project_id}/docker"
}

# Backend Cloud Run Service
resource "google_cloud_run_v2_service" "backend" {
  provider = google-beta

  project  = google_project.default.project_id
  name     = "backend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudrun.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${local.docker_registry}/backend:latest"

      ports {
        container_port = 8000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "GCP_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }

      # Startup probe
      startup_probe {
        http_get {
          path = "/health"
          port = 8000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }

      # Liveness probe
      liveness_probe {
        http_get {
          path = "/health"
          port = 8000
        }
        period_seconds = 30
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.cloudrun,
    google_artifact_registry_repository.docker,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# Frontend Cloud Run Service
resource "google_cloud_run_v2_service" "frontend" {
  provider = google-beta

  project  = google_project.default.project_id
  name     = "frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudrun.email

    scaling {
      min_instance_count = 0
      max_instance_count = 10
    }

    containers {
      image = "${local.docker_registry}/frontend:latest"

      ports {
        container_port = 3000
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

      env {
        name  = "NEXT_PUBLIC_API_URL"
        value = "" # Will be set after backend is deployed
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_API_KEY"
        value = data.google_firebase_web_app_config.default.api_key
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
        value = data.google_firebase_web_app_config.default.auth_domain
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
        value = data.google_firebase_web_app_config.default.storage_bucket
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
        value = data.google_firebase_web_app_config.default.messaging_sender_id
      }

      env {
        name  = "NEXT_PUBLIC_FIREBASE_APP_ID"
        value = google_firebase_web_app.default.app_id
      }

      # Startup probe
      startup_probe {
        http_get {
          path = "/"
          port = 3000
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        failure_threshold     = 3
      }
    }
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_project_service.cloudrun,
    google_artifact_registry_repository.docker,
    google_firebase_web_app.default,
  ]

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}

# Allow unauthenticated access to backend
resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  provider = google-beta

  project  = google_project.default.project_id
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Allow unauthenticated access to frontend
resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  provider = google-beta

  project  = google_project.default.project_id
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

