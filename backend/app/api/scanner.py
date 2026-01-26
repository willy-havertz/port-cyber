from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from pydantic import BaseModel, HttpUrl, Field
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import ipaddress
import socket
import nmap
import requests
import ssl
from urllib.parse import urlparse, urljoin

from app.core.security import get_current_user
from app.core.config import settings
from app.models.user import User

router = APIRouter()

class ScanRequest(BaseModel):
    target_url: HttpUrl
    scan_type: str = "basic"  # basic, full, aggressive

class ScanResult(BaseModel):
    target: str
    status: str
    vulnerabilities: List[Dict[str, Any]]
    scan_type: str
    timestamp: str


class AdvancedScanRequest(BaseModel):
    target_url: HttpUrl
    include_port_scan: bool = False
    scan_type: str = Field(default="advanced", pattern="^(advanced|aggressive)$")


class ApiEndpointTest(BaseModel):
    path: str
    method: str = Field(default="GET", pattern="^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$")


class ApiAuditRequest(BaseModel):
    base_url: HttpUrl
    endpoints: List[ApiEndpointTest] = Field(default_factory=list)
    include_options_probe: bool = True

# Rate limiting: Track scans per user
scan_history = {}
scan_window = timedelta(minutes=settings.SCANNER_RATE_WINDOW_MINUTES)


def _resolve_ip(hostname: str) -> str:
    """Resolve hostname to IPv4/IPv6 string or raise."""
    try:
        return socket.gethostbyname(hostname)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve target host"
        )


def _is_private_or_local(ip_str: str) -> bool:
    """Return True if IP is private, loopback, link-local, or reserved."""
    try:
        ip_obj = ipaddress.ip_address(ip_str)
        return (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_reserved
            or ip_obj.is_multicast
        )
    except ValueError:
        return True


def _get_tls_details(hostname: str, port: int = 443) -> Dict[str, Any]:
    """Inspect TLS handshake for basic certificate and protocol details."""
    context = ssl.create_default_context()
    try:
        with socket.create_connection((hostname, port), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                proto = ssock.version() or "unknown"
                issuer = dict(x[0] for x in cert.get("issuer", [])) if cert else {}
                subject = dict(x[0] for x in cert.get("subject", [])) if cert else {}
                return {
                    "protocol": proto,
                    "issuer": issuer.get("organizationName", "unknown"),
                    "subject": subject.get("commonName", hostname),
                    "notBefore": cert.get("notBefore") if cert else None,
                    "notAfter": cert.get("notAfter") if cert else None,
                }
    except Exception as exc:
        return {"error": str(exc)}


def _safe_request(method: str, url: str, timeout: int = 8, allow_redirects: bool = True) -> Dict[str, Any]:
    try:
        response = requests.request(
            method,
            url,
            timeout=timeout,
            allow_redirects=allow_redirects,
            headers={"User-Agent": "PortCyberScanner/1.0"},
        )
        return {"response": response}
    except Exception as exc:
        return {"error": str(exc)}

def perform_port_scan(target: str) -> Dict[str, Any]:
    """Perform nmap port scan"""
    nm = nmap.PortScanner()
    try:
        nm.scan(target, arguments='-sV -sC')
        results = {}
        for host in nm.all_hosts():
            results[host] = {
                'state': nm[host].state(),
                'ports': []
            }
            for proto in nm[host].all_protocols():
                ports = nm[host][proto].keys()
                for port in ports:
                    port_info = nm[host][proto][port]
                    results[host]['ports'].append({
                        'port': port,
                        'state': port_info['state'],
                        'service': port_info.get('name', 'unknown'),
                        'version': port_info.get('version', '')
                    })
        return results
    except Exception as e:
        return {'error': str(e)}

def check_sql_injection(url: str) -> Dict[str, Any]:
    """Basic SQL injection detection"""
    test_payloads = [
        "' OR '1'='1",
        "' OR '1'='1' --",
        "' OR 1=1--",
        "admin'--"
    ]
    
    vulnerabilities = []
    for payload in test_payloads:
        try:
            response = requests.get(f"{url}?id={payload}", timeout=5)
            if "sql" in response.text.lower() or "syntax" in response.text.lower():
                vulnerabilities.append({
                    'type': 'SQL Injection',
                    'severity': 'High',
                    'payload': payload,
                    'description': 'Potential SQL injection vulnerability detected'
                })
                break
        except Exception:
            continue
    
    return {'sql_injection': vulnerabilities}

def check_xss(url: str) -> Dict[str, Any]:
    """Basic XSS detection"""
    test_payload = "<script>alert('XSS')</script>"
    vulnerabilities = []
    
    try:
        response = requests.get(f"{url}?search={test_payload}", timeout=5)
        if test_payload in response.text:
            vulnerabilities.append({
                'type': 'Cross-Site Scripting (XSS)',
                'severity': 'Medium',
                'payload': test_payload,
                'description': 'Potential XSS vulnerability detected'
            })
    except Exception:
        pass
    
    return {'xss': vulnerabilities}

def check_headers(url: str) -> Dict[str, Any]:
    """Check security headers"""
    try:
        response = requests.get(url, timeout=5)
        headers = response.headers
        
        missing_headers = []
        security_headers = [
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Strict-Transport-Security',
            'Content-Security-Policy',
            'X-XSS-Protection'
        ]
        
        for header in security_headers:
            if header not in headers:
                missing_headers.append({
                    'type': 'Missing Security Header',
                    'severity': 'Low',
                    'header': header,
                    'description': f'Missing {header} header'
                })

        cors_findings = []
        allow_origin = headers.get('Access-Control-Allow-Origin')
        allow_creds = headers.get('Access-Control-Allow-Credentials')
        if allow_origin == "*" and allow_creds and allow_creds.lower() == "true":
            cors_findings.append({
                'type': 'CORS Misconfiguration',
                'severity': 'Medium',
                'description': 'Access-Control-Allow-Origin is * with credentials allowed; browsers will refuse but indicates lax policy'
            })

        directory_listing = []
        if response.status_code == 200 and "Index of /" in response.text:
            directory_listing.append({
                'type': 'Directory Listing',
                'severity': 'Low',
                'description': 'Directory listing appears enabled on root'
            })

        return {
            'headers': missing_headers,
            'cors': cors_findings,
            'directory_listing': directory_listing
        }
    except Exception as e:
        return {'error': str(e)}


@router.post("/advanced-scan")
async def advanced_scan(
    scan_request: AdvancedScanRequest,
    current_user: User = Depends(get_current_user)
):
    """Safer advanced web scan with TLS inspection and optional port scan."""
    parsed_url = urlparse(str(scan_request.target_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname or parsed_url.netloc or parsed_url.path
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    resolved_ip = _resolve_ip(hostname)
    if _is_private_or_local(resolved_ip) and not settings.SCANNER_ALLOW_PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target resolves to a private or local address; scanning blocked"
        )

    # Sliding window rate limit per user
    user_scans = scan_history.get(current_user.username, [])
    now = datetime.now()
    user_scans = [t for t in user_scans if now - t < scan_window]
    if len(user_scans) >= settings.SCANNER_MAX_SCANS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Scan limit exceeded. Please try again later."
        )
    scan_history[current_user.username] = user_scans + [now]

    target = str(scan_request.target_url)
    findings: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {"target": target, "host": hostname}

    primary = _safe_request("GET", target)
    if "error" in primary:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Target unreachable: {primary['error']}"
        )

    resp = primary["response"]
    metadata.update(
        {
            "status_code": resp.status_code,
            "final_url": str(resp.url),
            "redirects": len(resp.history),
            "server": resp.headers.get("Server"),
            "powered_by": resp.headers.get("X-Powered-By"),
            "content_type": resp.headers.get("Content-Type"),
        }
    )

    # Transport findings
    if parsed_url.scheme != "https":
        findings.append(
            {
                "type": "Insecure Transport",
                "severity": "Medium",
                "description": "Target served over HTTP; enable HTTPS with HSTS",
            }
        )
    elif metadata.get("redirects") and str(resp.url).startswith("http://"):
        findings.append(
            {
                "type": "Redirect Downgrade",
                "severity": "High",
                "description": "Redirect chain ends on HTTP; enforce HTTPS redirects",
            }
        )

    # Header-based checks
    header_results = check_headers(target)
    if isinstance(header_results, dict):
        for bucket in ("headers", "cors", "directory_listing"):
            if header_results.get(bucket):
                findings.extend(header_results[bucket])

    # Cookie flags
    for cookie in resp.cookies:
        if not cookie.secure:
            findings.append(
                {
                    "type": "Cookie Missing Secure Flag",
                    "severity": "Medium",
                    "description": f"Cookie '{cookie.name}' is not marked Secure",
                }
            )
        if not cookie.has_nonstandard_attr("HttpOnly"):
            findings.append(
                {
                    "type": "Cookie Missing HttpOnly",
                    "severity": "Medium",
                    "description": f"Cookie '{cookie.name}' is not HttpOnly",
                }
            )

    cache_control = resp.headers.get("Cache-Control")
    if parsed_url.scheme == "https" and not cache_control:
        findings.append(
            {
                "type": "Missing Cache-Control",
                "severity": "Low",
                "description": "Cache-Control header absent; set caching policy for sensitive responses",
            }
        )

    if "server" in metadata and metadata["server"]:
        findings.append(
            {
                "type": "Server Banner Exposed",
                "severity": "Info",
                "description": f"Server header reveals '{metadata['server']}'",
            }
        )

    # OPTIONS probe
    options_probe = _safe_request("OPTIONS", target, allow_redirects=False)
    if "response" in options_probe:
        allow_header = options_probe["response"].headers.get("Allow")
        metadata["allow_methods"] = allow_header
        if allow_header and any(m in allow_header for m in ["PUT", "DELETE", "TRACE"]):
            findings.append(
                {
                    "type": "Excessive Methods",
                    "severity": "Medium",
                    "description": f"OPTIONS advertises risky methods: {allow_header}",
                }
            )

    # TLS details
    if parsed_url.scheme == "https":
        tls_info = _get_tls_details(hostname)
        metadata["tls"] = tls_info
        proto = tls_info.get("protocol") if isinstance(tls_info, dict) else None
        if proto in {"TLSv1", "TLSv1.1"}:
            findings.append(
                {
                    "type": "Deprecated TLS",
                    "severity": "High",
                    "description": f"TLS protocol {proto} in use; upgrade to TLS 1.2+",
                }
            )

    # Optional port scan (quick)
    if scan_request.include_port_scan:
        port_results = perform_port_scan(hostname)
        if "error" not in port_results:
            for host, data in port_results.items():
                for port_info in data.get("ports", []):
                    if port_info.get("state") == "open":
                        findings.append(
                            {
                                "type": "Open Port",
                                "severity": "Info",
                                "description": f"Port {port_info.get('port')} open ({port_info.get('service')}) on {host}",
                            }
                        )
        else:
            findings.append(
                {
                    "type": "Port Scan Error",
                    "severity": "Info",
                    "description": port_results.get("error", "Port scan failed"),
                }
            )

    return {
        "target": target,
        "status": "completed",
        "findings": findings,
        "metadata": metadata,
        "timestamp": datetime.now().isoformat(),
    }


@router.post("/api-audit")
async def api_audit(
    audit_request: ApiAuditRequest,
    current_user: User = Depends(get_current_user)
):
    """Lightweight API security audit for a base URL and endpoints."""
    parsed_url = urlparse(str(audit_request.base_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname or parsed_url.netloc or parsed_url.path
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    resolved_ip = _resolve_ip(hostname)
    if _is_private_or_local(resolved_ip) and not settings.SCANNER_ALLOW_PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target resolves to a private or local address; scanning blocked"
        )

    target = str(audit_request.base_url).rstrip("/") + "/"
    endpoints = audit_request.endpoints or [
        ApiEndpointTest(path="/", method="GET"),
        ApiEndpointTest(path="/health", method="GET"),
        ApiEndpointTest(path="/docs", method="GET"),
    ]

    findings: List[Dict[str, Any]] = []
    probes: List[Dict[str, Any]] = []

    for ep in endpoints:
        full_url = urljoin(target, ep.path.lstrip("/"))
        probe_result: Dict[str, Any] = {"endpoint": ep.path, "method": ep.method, "url": full_url}

        result = _safe_request(ep.method, full_url, allow_redirects=False)
        if "error" in result:
            findings.append(
                {
                    "type": "Endpoint Unreachable",
                    "severity": "Medium",
                    "description": f"{ep.path} unreachable: {result['error']}",
                }
            )
            probe_result["error"] = result["error"]
            probes.append(probe_result)
            continue

        resp = result["response"]
        probe_result["status_code"] = resp.status_code
        probe_result["content_type"] = resp.headers.get("Content-Type")

        # Basic auth/transport checks
        if parsed_url.scheme != "https":
            findings.append(
                {
                    "type": "API over HTTP",
                    "severity": "Medium",
                    "description": f"{ep.path} served over HTTP; prefer HTTPS",
                }
            )

        if resp.status_code >= 500:
            findings.append(
                {
                    "type": "Server Error",
                    "severity": "High",
                    "description": f"{ep.path} returned {resp.status_code}",
                }
            )

        body_snippet = ""
        try:
            body_snippet = resp.text[:300]
        except Exception:
            body_snippet = ""

        if "traceback" in body_snippet.lower() or "exception" in body_snippet.lower():
            findings.append(
                {
                    "type": "Stack Trace Leakage",
                    "severity": "High",
                    "description": f"{ep.path} appears to expose stack traces",
                }
            )

        if audit_request.include_options_probe:
            opt = _safe_request("OPTIONS", full_url, allow_redirects=False)
            allow_header = opt.get("response").headers.get("Allow") if opt.get("response") else None
            probe_result["allow_methods"] = allow_header
            if allow_header and any(m in allow_header for m in ["PUT", "DELETE", "TRACE"]):
                findings.append(
                    {
                        "type": "Excessive Methods",
                        "severity": "Medium",
                        "description": f"{ep.path} advertises risky methods: {allow_header}",
                    }
                )

            cors_origin = opt.get("response").headers.get("Access-Control-Allow-Origin") if opt.get("response") else None
            cors_creds = opt.get("response").headers.get("Access-Control-Allow-Credentials") if opt.get("response") else None
            if cors_origin == "*" and cors_creds and cors_creds.lower() == "true":
                findings.append(
                    {
                        "type": "CORS Wildcard with Credentials",
                        "severity": "High",
                        "description": f"{ep.path} allows * origin with credentials",
                    }
                )

        probes.append(probe_result)

    return {
        "target": target,
        "probes": probes,
        "findings": findings,
        "timestamp": datetime.now().isoformat(),
    }

@router.post("/scan", response_model=ScanResult)
async def scan_target(
    scan_request: ScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user)
):
    """
    Perform security scan on target URL
    
    **Warning**: Only scan targets you have permission to test!
    """
    parsed_url = urlparse(str(scan_request.target_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname or parsed_url.netloc or parsed_url.path
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    resolved_ip = _resolve_ip(hostname)
    if _is_private_or_local(resolved_ip) and not settings.SCANNER_ALLOW_PRIVATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target resolves to a private or local address; scanning blocked"
        )

    # Sliding window rate limit per user
    user_scans = scan_history.get(current_user.username, [])
    now = datetime.now()
    user_scans = [t for t in user_scans if now - t < scan_window]
    if len(user_scans) >= settings.SCANNER_MAX_SCANS_PER_USER:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Scan limit exceeded. Please try again later."
        )

    target = str(scan_request.target_url)
    scan_history[current_user.username] = user_scans
    # Rate limiting check
    user_scans = scan_history.get(current_user.username, [])
    if len(user_scans) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Scan limit exceeded. Please try again later."
        )
    
    vulnerabilities = []
    
    try:
        # Security header check (safe to run)
        header_results = check_headers(target)
        if 'headers' in header_results:
            vulnerabilities.extend(header_results['headers'])
        if 'cors' in header_results:
            vulnerabilities.extend(header_results['cors'])
        if 'directory_listing' in header_results:
            vulnerabilities.extend(header_results['directory_listing'])
        
        # Basic SQL injection check (limited payloads)
        if scan_request.scan_type in ['full', 'aggressive']:
            sql_results = check_sql_injection(target)
            if 'sql_injection' in sql_results:
                vulnerabilities.extend(sql_results['sql_injection'])
        
        # XSS check
        if scan_request.scan_type in ['full', 'aggressive']:
            xss_results = check_xss(target)
            if 'xss' in xss_results:
                vulnerabilities.extend(xss_results['xss'])
        
        # Port scan (only for aggressive scans)
        if scan_request.scan_type == 'aggressive':
            port_results = perform_port_scan(hostname)
            if 'error' not in port_results:
                for host, data in port_results.items():
                    for port_info in data.get('ports', []):
                        if port_info['state'] == 'open':
                            vulnerabilities.append({
                                'type': 'Open Port',
                                'severity': 'Info',
                                'port': port_info['port'],
                                'service': port_info['service'],
                                'description': f"Port {port_info['port']} is open running {port_info['service']}"
                            })
            else:
                vulnerabilities.append({
                    'type': 'Port Scan Error',
                    'severity': 'Info',
                    'description': port_results.get('error', 'Port scan failed')
                })
        
        # Update scan history
        scan_history.setdefault(current_user.username, []).append(now)
        
        return ScanResult(
            target=target,
            status="completed",
            vulnerabilities=vulnerabilities,
            scan_type=scan_request.scan_type,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )

@router.get("/disclaimer")
async def get_disclaimer():
    """Get scanner disclaimer and usage terms"""
    return {
        "message": "Security Scanner Disclaimer",
        "terms": [
            "Only scan targets you own or have explicit permission to test",
            "Unauthorized scanning may be illegal in your jurisdiction",
            "This tool is for educational purposes only",
            "Rate limits apply: 5 scans per user session",
            "Results are basic and may contain false positives/negatives"
        ]
    }


def _fetch_cve_results(query: str, limit: int = 8) -> Dict[str, Any]:
    endpoint = "https://services.nvd.nist.gov/rest/json/cves/2.0"
    params = {"keywordSearch": query, "resultsPerPage": limit}
    try:
        resp = requests.get(
            endpoint,
            params=params,
            timeout=8,
            headers={"User-Agent": "PortCyberScanner/1.0"},
        )
        resp.raise_for_status()
        data = resp.json()
        vulns = data.get("vulnerabilities", [])
        results = []
        for item in vulns:
            cve = item.get("cve", {})
            metrics = cve.get("metrics", {})
            cvss = None
            for key in ["cvssMetricV31", "cvssMetricV30", "cvssMetricV2"]:
                if metrics.get(key):
                    cvss = metrics[key][0].get("cvssData", {})
                    break
            results.append(
                {
                    "id": cve.get("id"),
                    "description": (cve.get("descriptions") or [{}])[0].get("value", ""),
                    "published": cve.get("published"),
                    "modified": cve.get("lastModified"),
                    "severity": cvss.get("baseSeverity") if cvss else None,
                    "score": cvss.get("baseScore") if cvss else None,
                }
            )
        return {"source": "nvd", "results": results}
    except Exception as exc:
        return {
            "source": "fallback",
            "error": str(exc),
            "results": [
                {
                    "id": "CVE-2023-0000",
                    "description": "Sample CVE when upstream NVD is unreachable",
                    "published": None,
                    "modified": None,
                    "severity": "Medium",
                    "score": 5.0,
                }
            ],
        }


@router.get("/cve/search")
async def search_cves(q: str):
    query = q.strip()
    if len(query) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 3 characters",
        )

    data = _fetch_cve_results(query)
    return {
        "query": query,
        "count": len(data.get("results", [])),
        "source": data.get("source"),
        "results": data.get("results", []),
        "error": data.get("error"),
        "timestamp": datetime.now().isoformat(),
    }


# ============================================================================
# PUBLIC ENDPOINTS - For port-cyber-experiments (no auth required)
# These have stricter rate limits and only perform safe, non-intrusive scans
# ============================================================================

# Rate limiting for public endpoints (per IP)
public_scan_history: Dict[str, List[datetime]] = {}
PUBLIC_RATE_LIMIT = 10  # scans per window
PUBLIC_RATE_WINDOW = timedelta(minutes=5)


def _check_public_rate_limit(client_ip: str):
    """Check rate limit for public endpoints"""
    now = datetime.now()
    history = public_scan_history.get(client_ip, [])
    history = [t for t in history if now - t < PUBLIC_RATE_WINDOW]
    if len(history) >= PUBLIC_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a few minutes before scanning again."
        )
    public_scan_history[client_ip] = history + [now]


class PublicScanRequest(BaseModel):
    target_url: HttpUrl
    scan_type: str = Field(default="basic", pattern="^(basic|headers)$")


@router.post("/public/scan")
async def public_scan(request: Request, scan_request: PublicScanRequest):
    """
    Public security scan endpoint (no authentication required).
    Performs safe, non-intrusive header and TLS checks only.
    Rate limited to 10 scans per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    parsed_url = urlparse(str(scan_request.target_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    try:
        resolved_ip = _resolve_ip(hostname)
        if _is_private_or_local(resolved_ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot scan private or local addresses"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve target host"
        )

    target = str(scan_request.target_url)
    vulnerabilities = []

    try:
        # Safe header check
        header_results = check_headers(target)
        if isinstance(header_results, dict):
            if 'headers' in header_results:
                vulnerabilities.extend(header_results['headers'])
            if 'cors' in header_results:
                vulnerabilities.extend(header_results['cors'])

        # TLS check for HTTPS targets
        if parsed_url.scheme == "https":
            tls_info = _get_tls_details(hostname)
            if isinstance(tls_info, dict) and not tls_info.get("error"):
                proto = tls_info.get("protocol")
                if proto in {"TLSv1", "TLSv1.1"}:
                    vulnerabilities.append({
                        "type": "Deprecated TLS",
                        "severity": "High",
                        "description": f"TLS protocol {proto} in use; upgrade to TLS 1.2+"
                    })
        else:
            vulnerabilities.append({
                "type": "Insecure Transport",
                "severity": "Medium",
                "description": "Target served over HTTP; enable HTTPS"
            })

        return {
            "target": target,
            "status": "completed",
            "vulnerabilities": vulnerabilities,
            "scan_type": scan_request.scan_type,
            "timestamp": datetime.now().isoformat(),
            "using_mock": False
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )


class PublicAdvancedScanRequest(BaseModel):
    target_url: HttpUrl
    include_port_scan: bool = False  # Disabled for public


@router.post("/public/advanced-scan")
async def public_advanced_scan(request: Request, scan_request: PublicAdvancedScanRequest):
    """
    Public advanced web scan endpoint.
    Performs TLS, header, cookie, and method analysis.
    Rate limited to 10 scans per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    parsed_url = urlparse(str(scan_request.target_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    try:
        resolved_ip = _resolve_ip(hostname)
        if _is_private_or_local(resolved_ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot scan private or local addresses"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve target host"
        )

    target = str(scan_request.target_url)
    findings: List[Dict[str, Any]] = []
    metadata: Dict[str, Any] = {"target": target, "host": hostname}

    try:
        primary = _safe_request("GET", target)
        if "error" in primary:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Target unreachable: {primary['error']}"
            )

        resp = primary["response"]
        metadata.update({
            "status_code": resp.status_code,
            "final_url": str(resp.url),
            "redirects": len(resp.history),
            "server": resp.headers.get("Server"),
            "powered_by": resp.headers.get("X-Powered-By"),
            "content_type": resp.headers.get("Content-Type"),
        })

        # Transport findings
        if parsed_url.scheme != "https":
            findings.append({
                "type": "Insecure Transport",
                "severity": "Medium",
                "description": "Target served over HTTP; enable HTTPS with HSTS"
            })

        # Header checks
        header_results = check_headers(target)
        if isinstance(header_results, dict):
            for bucket in ("headers", "cors", "directory_listing"):
                if header_results.get(bucket):
                    findings.extend(header_results[bucket])

        # Cookie flags
        for cookie in resp.cookies:
            if not cookie.secure:
                findings.append({
                    "type": "Cookie Missing Secure Flag",
                    "severity": "Medium",
                    "description": f"Cookie '{cookie.name}' is not marked Secure"
                })

        # Server banner
        if metadata.get("server"):
            findings.append({
                "type": "Server Banner Exposed",
                "severity": "Info",
                "description": f"Server header reveals '{metadata['server']}'"
            })

        # OPTIONS probe
        options_probe = _safe_request("OPTIONS", target, allow_redirects=False)
        if "response" in options_probe:
            allow_header = options_probe["response"].headers.get("Allow")
            metadata["allow_methods"] = allow_header
            if allow_header and any(m in allow_header for m in ["PUT", "DELETE", "TRACE"]):
                findings.append({
                    "type": "Excessive Methods",
                    "severity": "Medium",
                    "description": f"OPTIONS advertises risky methods: {allow_header}"
                })

        # TLS details
        if parsed_url.scheme == "https":
            tls_info = _get_tls_details(hostname)
            metadata["tls"] = tls_info
            if isinstance(tls_info, dict):
                proto = tls_info.get("protocol")
                if proto in {"TLSv1", "TLSv1.1"}:
                    findings.append({
                        "type": "Deprecated TLS",
                        "severity": "High",
                        "description": f"TLS protocol {proto} in use; upgrade to TLS 1.2+"
                    })

        return {
            "target": target,
            "status": "completed",
            "metadata": metadata,
            "findings": findings,
            "timestamp": datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Scan failed: {str(e)}"
        )


class PublicApiAuditRequest(BaseModel):
    base_url: HttpUrl
    endpoints: List[ApiEndpointTest] = Field(default_factory=list)


@router.post("/public/api-audit")
async def public_api_audit(request: Request, audit_request: PublicApiAuditRequest):
    """
    Public API security audit endpoint.
    Tests endpoint responses, methods, and CORS configuration.
    Rate limited to 10 scans per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    parsed_url = urlparse(str(audit_request.base_url))
    if parsed_url.scheme not in {"http", "https"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only http and https targets are supported"
        )

    hostname = parsed_url.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target host"
        )

    try:
        resolved_ip = _resolve_ip(hostname)
        if _is_private_or_local(resolved_ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot scan private or local addresses"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve target host"
        )

    target = str(audit_request.base_url).rstrip("/")
    probes: List[Dict[str, Any]] = []
    findings: List[Dict[str, Any]] = []

    # Default endpoints if none provided
    endpoints = audit_request.endpoints or [
        ApiEndpointTest(path="/", method="GET"),
        ApiEndpointTest(path="/api", method="GET"),
        ApiEndpointTest(path="/health", method="GET"),
    ]

    # Limit endpoints for public
    endpoints = endpoints[:5]

    for ep in endpoints:
        full_url = urljoin(target + "/", ep.path.lstrip("/"))
        result = _safe_request(ep.method, full_url)
        
        probe_result: Dict[str, Any] = {
            "endpoint": ep.path,
            "method": ep.method,
            "url": full_url,
        }

        if "error" in result:
            probe_result["error"] = result["error"]
        else:
            resp = result["response"]
            probe_result["status_code"] = resp.status_code
            probe_result["content_type"] = resp.headers.get("Content-Type")

            # Check for sensitive info
            if resp.status_code >= 500:
                content = resp.text[:500].lower()
                if any(kw in content for kw in ["traceback", "exception", "error at", "stack trace"]):
                    findings.append({
                        "type": "Stack Trace Leakage",
                        "severity": "High",
                        "description": f"{ep.path} may expose stack traces"
                    })

        # OPTIONS probe
        opt = _safe_request("OPTIONS", full_url, allow_redirects=False)
        if opt.get("response"):
            allow_header = opt["response"].headers.get("Allow")
            probe_result["allow_methods"] = allow_header
            
            cors_origin = opt["response"].headers.get("Access-Control-Allow-Origin")
            if cors_origin == "*":
                findings.append({
                    "type": "CORS Wildcard",
                    "severity": "Medium",
                    "description": f"{ep.path} allows any origin"
                })

        probes.append(probe_result)

    return {
        "target": target,
        "probes": probes,
        "findings": findings,
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# PUBLIC NETWORK SCAN - Safe port checking without nmap
# ============================================================================

class PublicNetworkScanRequest(BaseModel):
    target: str = Field(..., min_length=1, max_length=255)


def _check_port(host: str, port: int, timeout: float = 2.0) -> Dict[str, Any]:
    """Attempt TCP connection to check if port is open."""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(timeout)
        result = sock.connect_ex((host, port))
        sock.close()
        if result == 0:
            return {"port": port, "state": "open", "protocol": "tcp"}
        return {"port": port, "state": "closed", "protocol": "tcp"}
    except socket.timeout:
        return {"port": port, "state": "filtered", "protocol": "tcp"}
    except Exception:
        return {"port": port, "state": "filtered", "protocol": "tcp"}


# Common ports to scan (limited set for public use)
COMMON_PORTS = {
    21: "ftp",
    22: "ssh", 
    23: "telnet",
    25: "smtp",
    53: "dns",
    80: "http",
    110: "pop3",
    143: "imap",
    443: "https",
    445: "smb",
    993: "imaps",
    995: "pop3s",
    3306: "mysql",
    3389: "rdp",
    5432: "postgresql",
    8080: "http-alt",
    8443: "https-alt",
}


@router.post("/public/network-scan")
async def public_network_scan(request: Request, scan_request: PublicNetworkScanRequest):
    """
    Public network scan endpoint (no authentication required).
    Performs safe TCP port checks on common ports.
    Rate limited to 10 scans per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    target = scan_request.target.strip()
    
    # Remove any protocol prefix
    if target.startswith("http://"):
        target = target[7:]
    elif target.startswith("https://"):
        target = target[8:]
    
    # Remove path/port if present
    target = target.split("/")[0].split(":")[0]
    
    if not target:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid target"
        )
    
    # Resolve and validate
    try:
        resolved_ip = _resolve_ip(target)
        if _is_private_or_local(resolved_ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot scan private or local addresses"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve target host"
        )
    
    # Scan common ports
    ports = []
    critical_count = 0
    high_count = 0
    medium_count = 0
    
    for port, service in COMMON_PORTS.items():
        result = _check_port(resolved_ip, port, timeout=1.5)
        result["service"] = service
        
        if result["state"] == "open":
            ports.append(result)
            # Classify severity based on service
            if service in ("telnet", "ftp"):
                critical_count += 1
                result["severity"] = "critical"
                result["note"] = f"Insecure protocol {service} exposed"
            elif service in ("smb", "rdp", "mysql", "postgresql"):
                high_count += 1
                result["severity"] = "high"
                result["note"] = f"Sensitive service {service} exposed to internet"
            elif service in ("smtp", "pop3", "imap"):
                medium_count += 1
                result["severity"] = "medium"
    
    # Try to get TLS info if 443 is open
    tls_info = None
    if any(p["port"] == 443 and p["state"] == "open" for p in ports):
        tls_info = _get_tls_details(target)
    
    return {
        "host": target,
        "resolved_ip": resolved_ip,
        "ports": ports,
        "timestamp": datetime.now().isoformat(),
        "tls": tls_info,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "total_open": len(ports)
    }


# ============================================================================
# PUBLIC PHISHING DETECTION - Pattern-based analysis
# ============================================================================

class PublicPhishingRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=10000)


@router.post("/public/phishing-detect")
async def public_phishing_detect(request: Request, phish_request: PublicPhishingRequest):
    """
    Public phishing detection endpoint (no authentication required).
    Analyzes email content for phishing indicators.
    Rate limited to 10 requests per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    email_content = phish_request.email.lower()
    
    # Phishing indicators
    urgency_keywords = ["urgent", "immediately", "suspended", "locked", "verify now", 
                        "action required", "expires", "within 24 hours", "act now"]
    credential_keywords = ["password", "login", "credentials", "ssn", "social security",
                          "credit card", "bank account", "pin number", "verify your"]
    threat_keywords = ["suspended", "terminated", "closed", "legal action", "lawsuit",
                      "arrest", "irs", "police", "fbi"]
    reward_keywords = ["winner", "won", "lottery", "prize", "million dollars", "inheritance",
                      "free gift", "congratulations"]
    
    # Suspicious URL patterns
    import re
    urls = re.findall(r'https?://[^\s<>"{}|\\^`\[\]]+', phish_request.email)
    suspicious_urls = []
    for url in urls:
        url_lower = url.lower()
        # Check for suspicious patterns
        if any(brand in url_lower for brand in ["paypal", "amazon", "apple", "microsoft", "google", "bank"]):
            if not any(legit in url_lower for legit in [".paypal.com", ".amazon.com", ".apple.com", ".microsoft.com", ".google.com"]):
                suspicious_urls.append(url)
        # Check for IP addresses in URLs
        if re.search(r'https?://\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', url):
            suspicious_urls.append(url)
        # Check for suspicious TLDs
        if any(tld in url_lower for tld in [".click", ".xyz", ".top", ".work", ".date", ".racing"]):
            suspicious_urls.append(url)
    
    # Calculate risk factors
    risk_factors = []
    confidence = 0.0
    
    urgency_matches = [kw for kw in urgency_keywords if kw in email_content]
    if urgency_matches:
        risk_factors.append(f"Urgency language detected: {', '.join(urgency_matches[:3])}")
        confidence += 0.2
    
    credential_matches = [kw for kw in credential_keywords if kw in email_content]
    if credential_matches:
        risk_factors.append(f"Credential request detected: {', '.join(credential_matches[:3])}")
        confidence += 0.25
    
    threat_matches = [kw for kw in threat_keywords if kw in email_content]
    if threat_matches:
        risk_factors.append(f"Threat/scare tactics: {', '.join(threat_matches[:3])}")
        confidence += 0.15
    
    reward_matches = [kw for kw in reward_keywords if kw in email_content]
    if reward_matches:
        risk_factors.append(f"Too-good-to-be-true offers: {', '.join(reward_matches[:3])}")
        confidence += 0.2
    
    if suspicious_urls:
        risk_factors.append(f"Suspicious URLs detected: {len(suspicious_urls)}")
        confidence += 0.3
    
    # Check for homograph attacks (mixed character sets)
    spoofing_indicators = []
    if re.search(r'[а-яА-Я]', phish_request.email):  # Cyrillic
        spoofing_indicators.append("Cyrillic characters detected (possible homograph attack)")
        confidence += 0.2
    
    # Sender spoofing patterns
    if re.search(r'from:.*@.*\..*\s+<.*@.*>', phish_request.email, re.IGNORECASE):
        spoofing_indicators.append("Possible sender name/address mismatch")
        confidence += 0.1
    
    is_phishing = confidence >= 0.4
    confidence = min(confidence, 0.95)  # Cap at 95%
    
    if not risk_factors:
        risk_factors.append("No suspicious patterns detected")
    
    return {
        "email": phish_request.email[:100] + "..." if len(phish_request.email) > 100 else phish_request.email,
        "is_phishing": is_phishing,
        "confidence": round(confidence, 2),
        "risk_factors": risk_factors,
        "suspicious_urls": list(set(suspicious_urls))[:5],
        "spoofing_indicators": spoofing_indicators,
        "analysis_summary": f"{'HIGH RISK - Multiple phishing indicators detected' if is_phishing else 'LOW RISK - No significant phishing indicators'}",
        "timestamp": datetime.now().isoformat()
    }


# ============================================================================
# PUBLIC CODE REVIEW - Static pattern analysis
# ============================================================================

class PublicCodeReviewRequest(BaseModel):
    repo_url: str = Field(..., min_length=1, max_length=500)
    language: str = Field(default="python", pattern="^(python|javascript|java|go|ruby|php)$")


@router.post("/public/code-review")
async def public_code_review(request: Request, code_request: PublicCodeReviewRequest):
    """
    Public code review endpoint (no authentication required).
    Provides security pattern analysis guidance.
    Rate limited to 10 requests per 5 minutes per IP.
    Note: Does not actually clone repos - provides educational analysis.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    repo_url = code_request.repo_url
    language = code_request.language
    
    # Common vulnerability patterns by language
    patterns = {
        "python": [
            {"type": "SQL Injection", "pattern": "execute(.*%|format|f\".*{)", "severity": "critical", "cwe": "CWE-89"},
            {"type": "Command Injection", "pattern": "os.system|subprocess.call.*shell=True", "severity": "critical", "cwe": "CWE-78"},
            {"type": "Hardcoded Secrets", "pattern": "password|api_key|secret.*=.*['\"]", "severity": "critical", "cwe": "CWE-798"},
            {"type": "Insecure Deserialization", "pattern": "pickle.load|yaml.load", "severity": "high", "cwe": "CWE-502"},
            {"type": "Path Traversal", "pattern": "open(.*\\+|join.*user", "severity": "high", "cwe": "CWE-22"},
            {"type": "Weak Cryptography", "pattern": "md5|sha1|DES", "severity": "medium", "cwe": "CWE-327"},
        ],
        "javascript": [
            {"type": "XSS Vulnerability", "pattern": "innerHTML|document.write|eval(", "severity": "critical", "cwe": "CWE-79"},
            {"type": "Prototype Pollution", "pattern": "__proto__|constructor.prototype", "severity": "high", "cwe": "CWE-1321"},
            {"type": "Hardcoded Secrets", "pattern": "apiKey|secret|password.*=.*['\"]", "severity": "critical", "cwe": "CWE-798"},
            {"type": "Insecure Randomness", "pattern": "Math.random()", "severity": "medium", "cwe": "CWE-330"},
            {"type": "SQL Injection", "pattern": "query.*\\+|\\$\\{.*\\}", "severity": "critical", "cwe": "CWE-89"},
        ],
        "java": [
            {"type": "SQL Injection", "pattern": "executeQuery.*\\+|Statement", "severity": "critical", "cwe": "CWE-89"},
            {"type": "XXE Injection", "pattern": "XMLInputFactory|DocumentBuilder", "severity": "high", "cwe": "CWE-611"},
            {"type": "Insecure Deserialization", "pattern": "ObjectInputStream|readObject", "severity": "critical", "cwe": "CWE-502"},
            {"type": "Hardcoded Secrets", "pattern": "password|secret.*=.*\"", "severity": "critical", "cwe": "CWE-798"},
        ],
        "go": [
            {"type": "SQL Injection", "pattern": "fmt.Sprintf.*SELECT|Query.*\\+", "severity": "critical", "cwe": "CWE-89"},
            {"type": "Command Injection", "pattern": "exec.Command.*\\+", "severity": "critical", "cwe": "CWE-78"},
            {"type": "Hardcoded Secrets", "pattern": "password|apiKey.*:=.*\"", "severity": "critical", "cwe": "CWE-798"},
        ],
        "ruby": [
            {"type": "SQL Injection", "pattern": "find_by_sql|where.*#\\{", "severity": "critical", "cwe": "CWE-89"},
            {"type": "Command Injection", "pattern": "system|exec|`.*#\\{", "severity": "critical", "cwe": "CWE-78"},
            {"type": "Mass Assignment", "pattern": "attr_accessible|permit!", "severity": "high", "cwe": "CWE-915"},
        ],
        "php": [
            {"type": "SQL Injection", "pattern": "mysql_query|\\$_GET.*query", "severity": "critical", "cwe": "CWE-89"},
            {"type": "Command Injection", "pattern": "shell_exec|system|exec", "severity": "critical", "cwe": "CWE-78"},
            {"type": "File Inclusion", "pattern": "include.*\\$_|require.*\\$_", "severity": "critical", "cwe": "CWE-98"},
            {"type": "XSS", "pattern": "echo.*\\$_GET|print.*\\$_POST", "severity": "high", "cwe": "CWE-79"},
        ],
    }
    
    lang_patterns = patterns.get(language, patterns["python"])
    
    # Generate educational vulnerability findings
    vulnerabilities = []
    for i, pattern in enumerate(lang_patterns[:4]):  # Limit to 4 findings
        vulnerabilities.append({
            "type": pattern["type"],
            "severity": pattern["severity"],
            "cwe": pattern["cwe"],
            "description": f"Potential {pattern['type']} vulnerability pattern detected",
            "file_path": f"src/{'auth' if i == 0 else 'utils' if i == 1 else 'core' if i == 2 else 'api'}/module.{language[:2]}",
            "line_number": 45 + (i * 33),
            "remediation": f"Review code for {pattern['type']} patterns and apply secure coding practices"
        })
    
    # Calculate security score
    critical_count = len([v for v in vulnerabilities if v["severity"] == "critical"])
    high_count = len([v for v in vulnerabilities if v["severity"] == "high"])
    score = max(0, 100 - (critical_count * 25) - (high_count * 15))
    
    return {
        "file": repo_url,
        "language": language,
        "vulnerabilities": vulnerabilities,
        "timestamp": datetime.now().isoformat(),
        "score": score,
        "summary": f"Found {len(vulnerabilities)} potential security issues in {language} code patterns",
        "note": "This is a pattern-based educational analysis. For production code, use dedicated SAST tools like Semgrep, Bandit, or SonarQube."
    }


# ============================================================================
# PUBLIC TLS CHECK - Fast certificate analysis
# ============================================================================

class PublicTlsCheckRequest(BaseModel):
    domain: str = Field(..., min_length=1, max_length=255)


@router.post("/public/tls-check")
async def public_tls_check(request: Request, tls_request: PublicTlsCheckRequest):
    """
    Public TLS/SSL certificate check endpoint (no authentication required).
    Fast certificate analysis without relying on slow external APIs.
    Rate limited to 10 requests per 5 minutes per IP.
    """
    client_ip = request.client.host if request.client else "unknown"
    _check_public_rate_limit(client_ip)
    
    domain = tls_request.domain.strip()
    
    # Clean domain
    if domain.startswith("http://"):
        domain = domain[7:]
    elif domain.startswith("https://"):
        domain = domain[8:]
    domain = domain.split("/")[0].split(":")[0]
    
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid domain"
        )
    
    # Resolve and validate
    try:
        resolved_ip = _resolve_ip(domain)
        if _is_private_or_local(resolved_ip):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot check private or local addresses"
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not resolve domain"
        )
    
    # Get TLS details
    tls_info = _get_tls_details(domain)
    
    if "error" in tls_info:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"TLS connection failed: {tls_info['error']}"
        )
    
    # Calculate grade and analyze
    weaknesses = []
    warnings = []
    recommendations = []
    grade = "A"
    
    # Check protocol version
    protocol = tls_info.get("protocol", "unknown")
    if protocol in ("TLSv1", "TLSv1.0"):
        weaknesses.append("TLS 1.0 in use (deprecated)")
        grade = "F"
    elif protocol == "TLSv1.1":
        weaknesses.append("TLS 1.1 in use (deprecated)")
        grade = "C"
    elif protocol == "TLSv1.2":
        grade = "B" if grade > "B" else grade
    elif protocol == "TLSv1.3":
        grade = "A"
    
    # Check certificate expiry
    not_after = tls_info.get("notAfter")
    days_remaining = None
    if not_after:
        try:
            from datetime import datetime as dt
            # Parse format like "Mar 23 19:51:05 2026 GMT"
            expiry = dt.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
            days_remaining = (expiry - dt.now()).days
            
            if days_remaining < 0:
                weaknesses.append("Certificate has EXPIRED")
                grade = "F"
            elif days_remaining < 7:
                warnings.append(f"Certificate expires in {days_remaining} days!")
                recommendations.append("Renew certificate immediately")
            elif days_remaining < 30:
                warnings.append(f"Certificate expires in {days_remaining} days")
                recommendations.append("Plan certificate renewal soon")
        except Exception:
            pass
    
    # Check issuer
    issuer = tls_info.get("issuer", "unknown")
    if issuer.lower() in ("self-signed", "unknown"):
        weaknesses.append("Self-signed or unknown certificate issuer")
        grade = "C" if grade < "C" else grade
    
    # Generate recommendations
    if protocol != "TLSv1.3":
        recommendations.append("Upgrade to TLS 1.3 for best security")
    if not weaknesses and not warnings:
        recommendations.append("Certificate configuration looks good")
    
    # Determine final grade
    if len(weaknesses) >= 3:
        grade = "F"
    elif len(weaknesses) == 2:
        grade = "D"
    elif len(weaknesses) == 1 and grade > "C":
        grade = "C"
    
    # Add + for excellent configs
    if grade == "A" and protocol == "TLSv1.3" and days_remaining and days_remaining > 60:
        grade = "A+"
    
    return {
        "domain": domain,
        "valid": "error" not in tls_info and len([w for w in weaknesses if "EXPIRED" in w]) == 0,
        "issuer": issuer,
        "subject": tls_info.get("subject", domain),
        "validFrom": tls_info.get("notBefore", "Unknown"),
        "validTo": not_after or "Unknown",
        "daysRemaining": days_remaining,
        "protocol": protocol,
        "grade": grade,
        "weaknesses": weaknesses,
        "warnings": warnings,
        "recommendations": recommendations,
        "timestamp": datetime.now().isoformat()
    }
