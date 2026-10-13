from __future__ import annotations

import http.client
from urllib.parse import urlsplit

START_COMMAND = "nx run infrastructure:searxng:up"
TIMEOUT_SECONDS = 3.0


def require_searxng(host: str) -> None:
    """Raise a RuntimeError naming the fix when SearxNG is not answering at `host`.

    Any HTTP response, including a 4xx or 5xx, proves the server is up; only a
    failure to connect (refused, DNS, timeout) counts as down.
    """
    url = urlsplit(host)
    connection_class = (
        http.client.HTTPSConnection if url.scheme == "https" else http.client.HTTPConnection
    )
    connection = connection_class(url.netloc, timeout=TIMEOUT_SECONDS)
    try:
        connection.request("GET", url.path or "/")
        connection.getresponse()
    except (OSError, http.client.HTTPException) as error:
        message = f"SearxNG is not reachable at {host} ({error}). Start it with: {START_COMMAND}"
        raise RuntimeError(message) from error
    finally:
        connection.close()
