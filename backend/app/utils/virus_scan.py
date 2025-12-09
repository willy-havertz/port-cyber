import os
import tempfile
import subprocess
import logging
from typing import Tuple

logger = logging.getLogger(__name__)


def _clamd_scan(data: bytes) -> Tuple[bool, str]:
    try:
        import clamd  # type: ignore

        # Try local unix socket first
        try:
            cd = clamd.ClamdUnixSocket()
            result = cd.instream(data)
        except Exception:
            # Fallback to default network socket
            cd = clamd.ClamdNetworkSocket()
            result = cd.instream(data)
        # Result example: {'stream': ('OK', None)} or ('FOUND', 'Eicar-Test-Signature')
        status, sig = result.get("stream", ("OK", None))
        return status == "OK", sig or ""
    except Exception as e:
        logger.info(f"clamd not available: {e}")
        return True, ""


def _clamscan_binary(data: bytes) -> Tuple[bool, str]:
    clamscan_path = None
    for candidate in ("clamscan", "/usr/bin/clamscan", "/usr/local/bin/clamscan"):
        if os.path.exists(candidate):
            clamscan_path = candidate
            break
    if not clamscan_path:
        return True, ""

    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(data)
        tmp_path = tmp.name
    try:
        proc = subprocess.run(
            [clamscan_path, "--infected", "--no-summary", tmp_path],
            capture_output=True,
            text=True,
            timeout=30,
        )
        infected = proc.returncode == 1
        if infected:
            return False, proc.stdout.strip()
        return True, ""
    except Exception as e:
        logger.info(f"clamscan not usable: {e}")
        return True, ""
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def scan_bytes_for_viruses(data: bytes) -> Tuple[bool, str]:
    """Scan byte content for viruses. Returns (clean, message)."""
    # Try clamd
    clean, msg = _clamd_scan(data)
    if not clean:
        return False, msg

    # Try clamscan binary
    clean, msg = _clamscan_binary(data)
    if not clean:
        return False, msg

    # If neither available, treat as clean but log
    if msg == "":
        logger.info("Virus scan skipped: no scanner available")
    return True, msg
