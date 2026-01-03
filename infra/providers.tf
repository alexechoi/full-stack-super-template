# Terraform and Provider Configuration

terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 5.0.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = ">= 1.0.0"
    }
    netlify = {
      source  = "netlify/netlify"
      version = ">= 0.2.0"
    }
  }
}

# =============================================================================
# Google Cloud Providers
# =============================================================================

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

# =============================================================================
# Vercel Provider (only used when frontend_platform = "vercel")
# =============================================================================

provider "vercel" {
  # API token from VERCEL_API_TOKEN env var or vercel_api_token variable
  api_token = var.vercel_api_token != "" ? var.vercel_api_token : null
  team      = var.vercel_org_id != "" ? var.vercel_org_id : null
}

# =============================================================================
# Netlify Provider (only used when frontend_platform = "netlify")
# =============================================================================

provider "netlify" {
  # Token from NETLIFY_TOKEN env var or netlify_token variable
  token = var.netlify_token != "" ? var.netlify_token : null
}

