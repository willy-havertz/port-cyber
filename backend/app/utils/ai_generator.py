from typing import Dict, List
import json
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Lazy import to avoid errors if package not installed
try:
    import google.generativeai as genai  # type: ignore
    GENAI_AVAILABLE = True
    # Configure Gemini
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
except ImportError:
    GENAI_AVAILABLE = False
    genai = None
    logger.warning("google-generativeai not installed. AI features will be disabled.")

class AIContentGenerator:
    """Generate writeup content using Google Gemini AI"""
    
    def __init__(self):
        if GENAI_AVAILABLE and genai:
            # Use a current, supported Gemini model (latest alias)
            self.model = genai.GenerativeModel('gemini-1.5-pro-latest')
        else:
            self.model = None
    
    async def generate_writeup_content(
        self,
        title: str,
        category: str,
        difficulty: str,
        platform: str,
        summary: str = "",
        tools_hint: List[str] | None = None,
        methodology_hint: List[str] | None = None,
        writeup_content: str = "",
    ) -> Dict[str, List[str]]:
        """
        Generate all writeup content sections using AI
        
        Args:
            writeup_content: Full text of PDF or markdown content for context
        
        Returns:
            Dict with keys: methodology, tools_used, key_findings, lessons_learned
        """
        if not GENAI_AVAILABLE or not self.model:
            logger.warning("AI generation not available - package not installed")
            return self._get_fallback_content(category, difficulty)
        
        if not settings.AI_GENERATION_ENABLED or not settings.GEMINI_API_KEY:
            logger.warning("AI generation is not enabled or API key not configured")
            return self._get_fallback_content(category, difficulty)
        
        try:
            prompt = self._build_comprehensive_prompt(
                title, category, difficulty, platform, summary, tools_hint or [], methodology_hint or [], writeup_content
            )
            
            response = self.model.generate_content(prompt)
            content = self._parse_ai_response(response.text)
            
            logger.info(f"Successfully generated AI content for writeup: {title}")
            return content
            
        except Exception as e:
            logger.error(f"Error generating AI content: {str(e)}")
            return self._get_fallback_content(category, difficulty, tools_hint=tools_hint, methodology_hint=methodology_hint)
    
    def _build_comprehensive_prompt(
        self,
        title: str,
        category: str,
        difficulty: str,
        platform: str,
        summary: str,
        tools_hint: List[str],
        methodology_hint: List[str],
        writeup_content: str = "",
    ) -> str:
        """Build detailed prompt for Gemini"""
        content_section = ""
        if writeup_content:
            # Truncate to first 8000 chars to avoid excessive token usage
            truncated = writeup_content[:8000]
            content_section = f"""
**Writeup Content (for context):**
{truncated}
{"..." if len(writeup_content) > 8000 else ""}

"""

        # Build optional sections outside the main f-string to avoid complex expressions
        summary_line = f"- Summary: {summary}" if summary else ""
        tools_section = ""
        if tools_hint:
            tools_section = (
                "Provided Tools (use and prioritize these where relevant):\n"
                + "\n".join(f"- {t}" for t in tools_hint)
            )
        methodology_section = ""
        if methodology_hint:
            methodology_section = (
                "Provided Methodology (derive findings and lessons from these steps):\n"
                + "\n".join(f"- {m}" for m in methodology_hint)
            )
        
        return f"""You are a cybersecurity expert writing detailed content for a CTF writeup.

**Writeup Details:**
- Title: {title}
- Category: {category}
- Difficulty: {difficulty}
- Platform: {platform}
{summary_line}
{tools_section}
{methodology_section}
{content_section}

Generate the following sections in JSON format:

1. **methodology**: List 5-7 specific, actionable steps that would typically be followed in this type of challenge. Be technical and specific to {category} challenges.{' Use the provided methodology if available.' if methodology_hint else ''}

2. **tools_used**: List 8-12 cybersecurity tools commonly used for {category} challenges. Include both common tools and category-specific ones. If a list of tools is provided above, incorporate and prioritize those tools when appropriate.{' Extract any tools mentioned in the writeup content.' if writeup_content else ''}

3. **key_findings**: List 4-6 technical findings or vulnerabilities.{f' Based on the writeup content provided, extract the actual vulnerabilities and security issues found in this challenge.' if writeup_content else f' Typical for {difficulty} difficulty {category} challenges.'}{' If a methodology is provided, derive findings from those steps.' if methodology_hint else ''}

4. **lessons_learned**: List 5-7 educational takeaways about security best practices, prevention techniques, or insights gained.{f' Base these on the actual content and techniques discussed in the writeup.' if writeup_content else ''}{' If a methodology is provided, align lessons with those steps.' if methodology_hint else ''}

**Important:** 
- Be specific to {category} and {difficulty} level
- Use technical terminology
- Focus on practical, realistic findings and lessons
- If writeup content is provided, prioritize extracting real details from it
- Output ONLY valid JSON with no markdown formatting

Output format:
{{
  "methodology": ["step 1", "step 2", ...],
  "tools_used": ["tool 1", "tool 2", ...],
  "key_findings": ["finding 1", "finding 2", ...],
  "lessons_learned": ["lesson 1", "lesson 2", ...]
}}"""
    
    def _parse_ai_response(self, response_text: str) -> Dict[str, List[str]]:
        """Parse AI response and extract structured content"""
        try:
            # Remove markdown code blocks if present
            clean_text = response_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            clean_text = clean_text.strip()
            
            # Parse JSON
            content = json.loads(clean_text)
            
            # Validate structure
            required_keys = ["methodology", "tools_used", "key_findings", "lessons_learned"]
            for key in required_keys:
                if key not in content or not isinstance(content[key], list):
                    raise ValueError(f"Missing or invalid key: {key}")
            
            return content
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {str(e)}")
            logger.debug(f"Raw response: {response_text}")
            raise
    
    def _get_fallback_content(self, category: str, difficulty: str, tools_hint: List[str] | None = None, methodology_hint: List[str] | None = None) -> Dict[str, List[str]]:
        """Return hardcoded fallback content if AI generation fails"""
        category_lower = category.lower()
        
        if "linux" in category_lower:
            methodology = [
                "Perform comprehensive port scanning using nmap to identify open services",
                "Enumerate services and extract useful information from discovered ports",
                "Identify and exploit vulnerabilities in discovered services",
                "Gain initial access and establish foothold on the system",
                "Escalate privileges using discovered misconfigurations or exploits",
                "Access sensitive files and capture flags",
                "Document findings and exploitation techniques used"
            ]
            tools = [
                "nmap", "netcat", "python", "bash scripting", "SSH",
                "privilege escalation tools", "LinPEAS", "grep/awk",
                "Burp Suite", "Metasploit", "Wireshark", "curl"
            ]
            findings = [
                f"{difficulty} difficulty challenge requiring solid understanding of Linux systems",
                "Multiple exploitation paths available for privilege escalation",
                "Vulnerable SUID binaries found allowing privilege escalation",
                "Misconfigured permissions on critical system files",
                "Default or weak credentials present in the system",
                "Insufficient access controls allowing unauthorized data access"
            ]
            lessons = [
                "Importance of thorough enumeration and reconnaissance",
                "Always check for SUID binaries and file permissions",
                "Weak credential management poses significant security risks",
                "System hardening and regular patching is critical",
                "Principle of least privilege should be applied to all processes",
                "Documentation of exploitation steps aids in reproducibility",
                f"{difficulty} challenges require attention to detail and persistence"
            ]
        
        elif "web" in category_lower:
            methodology = [
                "Perform reconnaissance and gather target information",
                "Map application functionality and identify entry points",
                "Test for common web vulnerabilities (OWASP Top 10)",
                "Exploit identified vulnerabilities to gain access",
                "Extract sensitive data and credentials",
                "Escalate privileges if possible within the application",
                "Document and report findings with proof of concept"
            ]
            tools = [
                "Burp Suite", "OWASP ZAP", "SQLmap", "curl", "browser DevTools",
                "nmap", "nikto", "gobuster", "ffuf", "Metasploit",
                "Wireshark", "wfuzz"
            ]
            findings = [
                f"{difficulty} difficulty web application challenge",
                "SQL injection vulnerability in user input fields",
                "Cross-Site Scripting (XSS) vulnerabilities present",
                "Insufficient input validation and sanitization",
                "Weak session management and authentication mechanisms",
                "Sensitive data exposure through improper access controls"
            ]
            lessons = [
                "Always sanitize and validate user inputs server-side",
                "Implement proper authentication and session management",
                "Use parameterized queries to prevent SQL injection",
                "Content Security Policy (CSP) helps mitigate XSS attacks",
                "Regular security testing identifies vulnerabilities early",
                "Follow OWASP guidelines for secure web development",
                f"{difficulty} web challenges require understanding of application logic"
            ]
        
        elif "windows" in category_lower:
            methodology = [
                "Scan and enumerate Windows services and open ports",
                "Identify vulnerable services and misconfigurations",
                "Exploit vulnerabilities to gain initial access",
                "Perform privilege escalation enumeration",
                "Execute privilege escalation exploit techniques",
                "Establish persistence and access system resources",
                "Extract sensitive information and capture flags"
            ]
            tools = [
                "nmap", "Metasploit", "mimikatz", "PowerShell", "Impacket",
                "WinPEAS", "Windows Exploit Suggester", "Evil-WinRM",
                "Burp Suite", "Wireshark", "Responder", "BloodHound"
            ]
            findings = [
                f"{difficulty} difficulty Windows system challenge",
                "Unpatched Windows service with known exploits",
                "Clear-text credentials stored in configuration files",
                "Weak service permissions allowing privilege escalation",
                "Misconfigured registry settings exposing vulnerabilities",
                "Default Windows configurations exploitable for lateral movement"
            ]
            lessons = [
                "Keep Windows systems patched and up to date",
                "Never store credentials in plain text",
                "Implement proper service permission configurations",
                "Regular auditing of Windows security settings is essential",
                "Defense in depth principles apply to Windows environments",
                "Understanding Windows internals aids in exploitation",
                f"{difficulty} Windows challenges require OS-specific knowledge"
            ]
        
        elif "forensic" in category_lower:
            methodology = [
                "Preserve evidence and verify hashes of acquired data",
                "Perform triage to locate volatile and high-value artifacts",
                "Analyze memory image for processes, network, and handles",
                "Extract timeline of file/system activity for correlation",
                "Hunt for malicious indicators (strings, YARA, persistence)",
                "Carve files and recover artifacts of interest",
                "Document findings with hashes, paths, and timestamps"
            ]
            tools = [
                "Volatility", "Autopsy", "The Sleuth Kit", "YARA",
                "strings", "foremost", "bulk_extractor", "exiftool",
                "Wireshark", "hashdeep", "plaso/log2timeline"
            ]
            findings = [
                "Suspicious process and injected module identified in memory",
                "Persistence mechanism discovered in user run keys/scheduled task",
                "Recovered exfiltration archive from temp directory",
                "Network IOCs observed communicating with external C2 endpoint",
                "Timestamps show execution sequence matching intrusion window"
            ]
            lessons = [
                "Maintain evidence integrity with proper hashing and chain of custody",
                "Volatile data often contains the most actionable indicators",
                "Timelining multiple sources helps validate and correlate events",
                "Proactive YARA rules greatly speed up indicator discovery",
                "Comprehensive documentation enables reproducible analysis"
            ]
        elif "crypt" in category_lower:
            methodology = [
                "Identify cipher family, encoding, and data characteristics",
                "Check for key/IV reuse and weak/random parameters",
                "Attempt classical attacks (frequency/Kasiski/known-plaintext)",
                "Probe implementation for padding-oracle or timing issues",
                "Validate decrypted output and iterate on hypotheses",
                "Document working decryption pipeline and constraints"
            ]
            tools = [
                "CyberChef", "OpenSSL", "hashcat", "John the Ripper",
                "SageMath", "RsaCtfTool", "gmpy2", "pycryptodome"
            ]
            findings = [
                "Weak key management led to feasible key recovery",
                "IV/nonce reuse enabled keystream reuse and plaintext inference",
                "Use of ECB exposed structural patterns in ciphertext",
                "Padding oracle permitted decryption without key",
                "Predictable RNG compromised cryptographic strength"
            ]
            lessons = [
                "Use AEAD modes (e.g., GCM/ChaCha20-Poly1305) with unique nonces",
                "Derive keys with modern KDFs (Argon2, scrypt, PBKDF2)",
                "Never reuse IVs/nonces; ensure high-entropy randomness",
                "Avoid ECB; prefer authenticated encryption",
                "Threat-model implementation flaws, not just algorithms"
            ]
        elif "reverse" in category_lower or "revers" in category_lower:
            methodology = [
                "Perform static triage (strings, headers, packers, sections)",
                "Load into disassembler for control/data-flow understanding",
                "Identify obfuscation/anti-debug and implement bypasses",
                "Run under debugger/sandbox to observe runtime behavior",
                "Trace APIs and decrypt/deserialize hidden data",
                "Extract IOCs and reconstruct key logic/algorithms"
            ]
            tools = [
                "Ghidra", "IDA", "radare2", "x64dbg", "Frida",
                "strace/ltrace", "Detect It Easy", "capa", "strings"
            ]
            findings = [
                "Hardcoded credentials/keys discovered in binary",
                "Custom crypto routine implemented insecurely",
                "Anti-debug/anti-VM checks identified and neutralized",
                "Network IOCs and command protocol reverse-engineered",
                "Licensing/feature flags controlled by predictable checks"
            ]
            lessons = [
                "Do not embed secrets in binaries; use secure storage",
                "Security-by-obscurity fails against basic reversing",
                "Code signing and integrity checks reduce tampering",
                "Telemetry helps detect misuse and suspicious behavior",
                "Defensive obfuscation should be paired with real controls"
            ]
        elif "osint" in category_lower:
            methodology = [
                "Define targets and scope; enumerate identifiers and assets",
                "Pivot across platforms to build profiles and relationships",
                "Harvest metadata from public content and documents",
                "Enumerate domains/subdomains, buckets, and exposed services",
                "Correlate findings to map risks and likely entry points",
                "Document sources, timestamps, and verification steps"
            ]
            tools = [
                "theHarvester", "Maltego", "Recon-ng", "Amass",
                "Shodan", "crt.sh", "exiftool", "Google dorks"
            ]
            findings = [
                "Publicly exposed credentials and API keys discovered",
                "Sensitive documents leaked via misconfigured storage",
                "High-value subdomains with outdated software identified",
                "Linked personas enable spear-phishing and social engineering",
                "Metadata reveals internal tooling and environment details"
            ]
            lessons = [
                "Reduce public footprint and enforce data handling policies",
                "Continuously monitor for exposed assets and credentials",
                "Harden external attack surface and decommission stale hosts",
                "Train staff on phishing and operational security",
                "Sanitize metadata before publishing documents"
            ]
        elif "stego" in category_lower or "steganograph" in category_lower:
            methodology = [
                "Validate container format and file integrity; inspect headers",
                "Extract and review metadata (EXIF, ID3, container tags)",
                "Scan for appended archives and embedded sections",
                "Analyze color channels/LSB patterns and bit planes",
                "Run format-specific tools (images/audio/video) to detect payloads",
                "Carve and decode discovered artifacts; verify hashes"
            ]
            tools = [
                "exiftool", "binwalk", "strings", "steghide", "zsteg",
                "stegsolve", "ffmpeg", "audacity", "foremost", "xxd"
            ]
            findings = [
                "Hidden payload discovered via LSB manipulation in PNG",
                "EXIF comment contained base64-encoded secret",
                "ZIP archive appended to JPEG trailer recovered",
                "Audio spectrogram revealed concealed Morse/code message",
                "Corrupted header signature indicated tampering and embedded data"
            ]
            lessons = [
                "Always check metadata and validate true file types",
                "Use multiple detection techniques; single tools miss payloads",
                "Bit-plane and channel analysis is effective for images",
                "Spectral views help uncover audio concealment",
                "Preserve originals and document extraction steps"
            ]
        elif "pwn" in category_lower or "exploit" in category_lower:
            methodology = [
                "Perform binary triage (protections, sections, imports, packers)",
                "Identify vulnerability class (overflow/format/logic/UAF)",
                "Construct exploit primitives and leak required addresses",
                "Build ROP chain/shellcode; bypass mitigations (ASLR/DEP)",
                "Automate interaction and payload with scripting framework",
                "Stabilize and validate exploit behavior across runs"
            ]
            tools = [
                "pwntools", "gdb (GEF/PEDA)", "radare2", "IDA/Ghidra",
                "one_gadget", "ROPgadget", "angr", "objdump/readelf"
            ]
            findings = [
                "Stack buffer overflow enabling control of return address",
                "Format string vulnerability leaking libc addresses",
                "Unsafe use of strcpy/gets led to memory corruption",
                "Partial RELRO and non-PIE increased exploitability",
                "Predictable heap layout enabled primitive construction"
            ]
            lessons = [
                "Enable full RELRO, PIE, stack canaries, and NX to reduce risk",
                "Avoid unsafe C library calls; validate bounds",
                "Fuzzing and sanitizers expose memory errors earlier",
                "Treat leaked pointers and info disclosures as high risk",
                "Exploit stability depends on deterministic state and robust IO"
            ]
        elif "threat" in category_lower and "hunt" in category_lower:
            methodology = [
                "Form hypotheses based on TTPs and environment baseline",
                "Query telemetry (EDR/SIEM/NetFlow) for anomaly indicators",
                "Correlate events across hosts/users/services",
                "Identify persistence, lateral movement, and exfil paths",
                "Scope impact and recommend containment/remediation",
                "Document findings and detection gaps for engineering"
            ]
            tools = [
                "Sigma", "KQL/Splunk", "ELK", "osquery", "Sysmon",
                "Zeek", "YARA", "MITRE ATT&CK mappings"
            ]
            findings = [
                "Unusual parent-child process lineage indicative of injection",
                "Persistence via scheduled task/registry run keys",
                "Anomalous DNS and beaconing patterns detected",
                "Data exfiltration over encrypted channel identified",
                "Lateral movement via stolen credentials correlated"
            ]
            lessons = [
                "Establish behavioral baselines to improve anomaly detection",
                "Map detections to ATT&CK to track coverage",
                "Enrich telemetry with context (users, assets, criticality)",
                "Contain fast; follow with eradication and recovery",
                "Iterate hunts to close detection gaps and improve resilience"
            ]
        else:
            # Generic fallback
            methodology = [
                "Reconnaissance and information gathering phase",
                "Vulnerability identification and analysis",
                "Exploitation and initial access",
                "Privilege escalation techniques",
                "Post-exploitation and data extraction",
                "Documentation of attack path and findings"
            ]
            tools = [
                "Nmap", "Burp Suite", "Metasploit", "Wireshark",
                "netcat", "python", "bash scripting", "curl",
                "gobuster", "nikto", "SQLmap", "john"
            ]
            findings = [
                f"{difficulty} difficulty challenge requiring technical analysis",
                "Multiple security vulnerabilities discovered during assessment",
                "Insufficient access controls and weak authentication mechanisms",
                "Misconfigured services exposing sensitive information",
                "Successful exploitation path identified and validated"
            ]
            lessons = [
                "Thorough reconnaissance is essential for successful exploitation",
                "Always validate findings with multiple testing methods",
                "Document all steps for reproducibility and reporting",
                "Understanding the target environment is crucial",
                "Security best practices should be consistently applied",
                f"{difficulty} challenges require persistence and methodology"
            ]

        # If tools_hint provided, merge and prioritize provided tools at the front (dedup preserving order)
        if tools_hint:
            seen = set()
            merged = []
            # add hinted tools first
            for t in tools_hint:
                tn = t.strip()
                if tn and tn.lower() not in seen:
                    merged.append(tn)
                    seen.add(tn.lower())
            # then existing tools
            for t in tools:
                if t.lower() not in seen:
                    merged.append(t)
                    seen.add(t.lower())
            tools = merged
        
        # Don't override findings/lessons with generic placeholders
        # The category-specific ones above are better
        
        return {
            "methodology": methodology,
            "tools_used": tools,
            "key_findings": findings,
            "lessons_learned": lessons
        }

# Singleton instance
ai_generator = AIContentGenerator()
