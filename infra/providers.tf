# Terraform and Provider Configuration

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 5.0.0"
    }
  }
}

# Default provider with user project override for quota billing
provider "google-beta" {
  user_project_override = true
}

# Provider without user project override for initial project creation
# Used before the project exists to accept quota checks
provider "google-beta" {
  alias                 = "no_user_project_override"
  user_project_override = false
}

