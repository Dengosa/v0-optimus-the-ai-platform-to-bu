from __future__ import annotations

import os
from typing import List, Dict


def _split_csv(value: str | None) -> List[str]:
    if not value:
        return []
    return [v.strip() for v in value.split(",") if v.strip()]


def build_cors_settings() -> Dict[str, object]:
    """Secure CORS configuration.

    Security posture:
    - Default is to deny cross-origin access (empty allow_origins).
    - Client origins must be explicitly allowlisted.

    Env:
      KOMMUNE_CORS_ALLOW_ORIGINS = "https://example.com,https://app.example.com"
      KOMMUNE_CORS_ALLOW_CREDENTIALS = "true" | "false"
    """

    allow_origins = _split_csv(os.getenv("KOMMUNE_CORS_ALLOW_ORIGINS"))
    allow_credentials = os.getenv("KOMMUNE_CORS_ALLOW_CREDENTIALS", "false").lower() == "true"

    return {
        "allow_origins": allow_origins,
        "allow_credentials": allow_credentials,
        # For a SPA calling a JSON API.
        "allow_methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": [
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "X-Session-Id",
        ],
    }

