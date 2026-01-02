"""
Firebase Admin SDK service for token verification.

This service initializes Firebase Admin and provides methods to verify
Firebase ID tokens sent from frontend/mobile clients.
"""

import logging
import os
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials

logger = logging.getLogger(__name__)


class FirebaseService:
    """Singleton service for Firebase Admin operations."""

    _initialized: bool = False
    _app: firebase_admin.App | None = None

    @classmethod
    def initialize(cls) -> None:
        """
        Initialize Firebase Admin SDK.

        Tries to initialize in the following order:
        1. GOOGLE_APPLICATION_CREDENTIALS environment variable (path to service account JSON)
        2. FIREBASE_SERVICE_ACCOUNT_JSON environment variable (JSON string)
        3. Default credentials (for Cloud Run, Cloud Functions, etc.)
        """
        if cls._initialized:
            logger.debug("Firebase already initialized")
            return

        try:
            # Option 1: Service account file path
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if cred_path and os.path.exists(cred_path):
                cred = credentials.Certificate(cred_path)
                cls._app = firebase_admin.initialize_app(cred)
                cls._initialized = True
                logger.info("Firebase initialized with service account file")
                return

            # Option 2: Service account JSON string (useful for containerized deployments)
            import json

            cred_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
            if cred_json:
                cred_dict = json.loads(cred_json)
                cred = credentials.Certificate(cred_dict)
                cls._app = firebase_admin.initialize_app(cred)
                cls._initialized = True
                logger.info("Firebase initialized with service account JSON")
                return

            # Option 3: Default credentials (GCP environments)
            cred = credentials.ApplicationDefault()
            cls._app = firebase_admin.initialize_app(cred)
            cls._initialized = True
            logger.info("Firebase initialized with application default credentials")

        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            raise RuntimeError(f"Firebase initialization failed: {e}") from e

    @classmethod
    def verify_token(cls, id_token: str) -> dict:
        """
        Verify a Firebase ID token.

        Args:
            id_token: The Firebase ID token from the client

        Returns:
            Decoded token containing user info (uid, email, etc.)

        Raises:
            RuntimeError: If Firebase is not initialized
            ValueError: If token is invalid or expired
        """
        if not cls._initialized:
            raise RuntimeError(
                "Firebase is not initialized. Call FirebaseService.initialize() first."
            )

        try:
            decoded_token = auth.verify_id_token(id_token)
            logger.info(f"Token verified for user: {decoded_token.get('uid')}")
            return decoded_token

        except auth.InvalidIdTokenError as e:
            logger.warning(f"Invalid token: {e}")
            raise ValueError("Invalid authentication token") from e

        except auth.ExpiredIdTokenError as e:
            logger.warning(f"Expired token: {e}")
            raise ValueError("Authentication token has expired") from e

        except auth.RevokedIdTokenError as e:
            logger.warning(f"Revoked token: {e}")
            raise ValueError("Authentication token has been revoked") from e

        except auth.CertificateFetchError as e:
            logger.error(f"Certificate fetch error: {e}")
            raise ValueError("Unable to verify token at this time") from e

        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise ValueError("Token verification failed") from e


@lru_cache
def get_firebase_service() -> type[FirebaseService]:
    """Get the Firebase service singleton."""
    FirebaseService.initialize()
    return FirebaseService


# Initialize on import if credentials are available
def auto_initialize() -> None:
    """Auto-initialize Firebase if credentials are available."""
    try:
        get_firebase_service()
    except RuntimeError:
        logger.warning(
            "Firebase not auto-initialized. Set GOOGLE_APPLICATION_CREDENTIALS or "
            "FIREBASE_SERVICE_ACCOUNT_JSON environment variable."
        )
