# Input Variables for Terraform Configuration

variable "project_id" {
  description = "The unique identifier for the GCP project"
  type        = string
}

variable "project_name" {
  description = "The display name for the GCP project"
  type        = string
  default     = "Full Stack Super Template"
}

variable "region" {
  description = "The GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "billing_account" {
  description = "The billing account ID to associate with the project"
  type        = string
}

variable "github_repo" {
  description = "The GitHub repository in format 'owner/repo' for Workload Identity Federation"
  type        = string
}

# Firebase Auth Configuration
variable "oauth_client_id" {
  description = "Google OAuth client ID for Firebase Auth"
  type        = string
  default     = ""
}

variable "oauth_client_secret" {
  description = "Google OAuth client secret for Firebase Auth"
  type        = string
  default     = ""
  sensitive   = true
}

variable "apple_team_id" {
  description = "Apple Developer Team ID for Apple Sign-In"
  type        = string
  default     = ""
}

variable "apple_key_id" {
  description = "Apple Sign-In Key ID"
  type        = string
  default     = ""
}

variable "apple_private_key" {
  description = "Apple Sign-In private key content"
  type        = string
  default     = ""
  sensitive   = true
}

variable "apple_bundle_id" {
  description = "Apple app bundle ID for Apple Sign-In"
  type        = string
  default     = ""
}

# Expo Mobile App Configuration
variable "expo_ios_bundle_id" {
  description = "iOS Bundle ID for the Expo app (e.g., com.yourcompany.expoapp)"
  type        = string
  default     = ""
}

variable "expo_android_package_name" {
  description = "Android Package Name for the Expo app (e.g., com.yourcompany.expoapp)"
  type        = string
  default     = ""
}

# Push Notifications Configuration
variable "fcm_vapid_key" {
  description = "Firebase Cloud Messaging VAPID key for web push notifications. Generate in Firebase Console: Project Settings > Cloud Messaging > Web Push certificates"
  type        = string
  default     = ""
  sensitive   = true
}

# =============================================================================
# Frontend Deployment Platform
# =============================================================================

variable "frontend_platform" {
  description = "Platform to deploy the frontend. Options: 'cloudrun' (default), 'vercel', 'netlify'"
  type        = string
  default     = "cloudrun"

  validation {
    condition     = contains(["cloudrun", "vercel", "netlify"], var.frontend_platform)
    error_message = "frontend_platform must be one of: cloudrun, vercel, netlify"
  }
}

# Vercel Configuration (required if frontend_platform = "vercel")
variable "vercel_api_token" {
  description = "Vercel API token. Get from: https://vercel.com/account/tokens"
  type        = string
  default     = ""
  sensitive   = true
}

variable "vercel_org_id" {
  description = "Vercel organization/team ID. Find in Vercel dashboard settings."
  type        = string
  default     = ""
}

# Netlify Configuration (required if frontend_platform = "netlify")
variable "netlify_token" {
  description = "Netlify personal access token. Get from: https://app.netlify.com/user/applications#personal-access-tokens"
  type        = string
  default     = ""
  sensitive   = true
}

variable "netlify_site_id" {
  description = "Netlify Site ID. Create the site in the Netlify UI first, then find the ID in Site Settings > General > Site ID"
  type        = string
  default     = ""
}

