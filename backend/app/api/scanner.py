from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any
import nmap
import requests
from urllib.parse import urlparse

from app.core.security import get_current_user
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

# Rate limiting: Track scans per user
scan_history = {}

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
        
        return {'headers': missing_headers}
    except Exception as e:
        return {'error': str(e)}

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
    # Rate limiting check
    user_scans = scan_history.get(current_user.username, [])
    if len(user_scans) >= 5:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Scan limit exceeded. Please try again later."
        )
    
    target = str(scan_request.target_url)
    parsed_url = urlparse(target)
    hostname = parsed_url.netloc or parsed_url.path
    
    vulnerabilities = []
    
    try:
        # Security header check (safe to run)
        header_results = check_headers(target)
        if 'headers' in header_results:
            vulnerabilities.extend(header_results['headers'])
        
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
        
        # Update scan history
        from datetime import datetime
        scan_history.setdefault(current_user.username, []).append(datetime.now())
        
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
