from __future__ import annotations

import socket
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import TYPE_CHECKING

import pytest

from src.services import require_searxng

if TYPE_CHECKING:
    from collections.abc import Callable, Iterator

START_COMMAND = "nx run infrastructure:searxng:up"


def _handler_for(status: int) -> type[BaseHTTPRequestHandler]:
    class StatusHandler(BaseHTTPRequestHandler):
        def do_GET(self) -> None:
            self.send_response(status)
            self.send_header("Content-Length", "0")
            self.end_headers()

        def log_message(self, format: str, *args: object) -> None:
            return

    return StatusHandler


@pytest.fixture()
def serve() -> Iterator[Callable[[int], str]]:
    servers: list[HTTPServer] = []

    def start(status: int) -> str:
        server = HTTPServer(("127.0.0.1", 0), _handler_for(status))
        threading.Thread(target=server.serve_forever, daemon=True).start()
        servers.append(server)
        return f"http://127.0.0.1:{server.server_port}"

    yield start
    for server in servers:
        server.shutdown()
        server.server_close()


@pytest.fixture()
def closed_host() -> str:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    return f"http://127.0.0.1:{port}"


def test_reachable_host_returns_none(serve: Callable[[int], str]) -> None:
    assert require_searxng(serve(200)) is None


@pytest.mark.parametrize("status", [403, 404, 500])
def test_non_success_response_still_counts_as_running(
    serve: Callable[[int], str], status: int
) -> None:
    assert require_searxng(serve(status)) is None


def test_unreachable_host_raises_naming_host_and_fix(closed_host: str) -> None:
    with pytest.raises(RuntimeError) as error:
        require_searxng(closed_host)
    assert closed_host in str(error.value)
    assert START_COMMAND in str(error.value)
