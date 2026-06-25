from __future__ import annotations

from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent / ".env"

CONTENT = """ANTHROPIC_API_KEY=I_WILL_PASTE_THIS
GEMINI_API_KEY=I_WILL_PASTE_THIS
KOMMUNE_CORS_ALLOW_ORIGINS=https://v0-optimus-the-ai-platform-to-bu-mu-lovat-39.vercel.app
ADMIN_SECRET=kommune2026
RESEND_FROM_EMAIL=Kommune <hello@kommune.app>
PORT=8000
"""


def main() -> None:
    # Ensure parent exists (it does in this repo, but keep it robust)
    ENV_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Write the .env file
    ENV_PATH.write_text(CONTENT, encoding="utf-8")

    # Print Done
    print("Done")

    # Read back and print to confirm
    read_back = ENV_PATH.read_text(encoding="utf-8")
    print(read_back, end="")


if __name__ == "__main__":
    main()

