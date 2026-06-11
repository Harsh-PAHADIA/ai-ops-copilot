import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.config import (
    GITHUB_API_VERSION,
    GITHUB_ENDPOINT,
    GITHUB_MODEL,
    GITHUB_TOKEN,
    github_token_debug_info,
)

logger = logging.getLogger(__name__)

logger.warning("GitHub Models config debug: %s", github_token_debug_info())


def _chat_completions_url() -> str:
    return f"{GITHUB_ENDPOINT.rstrip('/')}/chat/completions"


def generate_response(
    user_input: str,
    system_prompt: str = "You are an AI assistant that helps employees automate tasks.",
):
    """
    Generate a response using GitHub Models.
    """
    if not GITHUB_TOKEN:
        return "Error: GITHUB_TOKEN is not configured. Add it to backend/.env or the backend deployment environment."

    payload = {
        "model": GITHUB_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input},
        ],
    }

    request = Request(
        _chat_completions_url(),
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {GITHUB_TOKEN}",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=60) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        logger.error(
            "GitHub Models request failed: status=%s reason=%s debug=%s body=%s",
            exc.code,
            exc.reason,
            github_token_debug_info(),
            error_body,
        )
        if exc.code == 401:
            return (
                "Error: GitHub Models rejected GITHUB_TOKEN with Unauthorized. "
                "Create a new GitHub fine-grained token with Models: Read permission, "
                "update the backend deployment environment, and restart the backend."
            )
        return f"Error: GitHub Models request failed with status {exc.code}: {error_body}"
    except URLError as exc:
        logger.error("GitHub Models connection failed: %s", exc)
        return f"Error: Could not connect to GitHub Models: {exc.reason}"
    except Exception as exc:
        logger.exception("Unexpected GitHub Models error")
        return f"Error: {str(exc)}"
