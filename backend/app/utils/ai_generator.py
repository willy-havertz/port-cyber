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
            self.model = genai.GenerativeModel('gemini-pro')
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
        
        return f"""You are a cybersecurity expert writing detailed content for a CTF writeup.

**Writeup Details:**
- Title: {title}
- Category: {category}
- Difficulty: {difficulty}
- Platform: {platform}
{f'- Summary: {summary}' if summary else ''}

{('Provided Tools (use and prioritize these where relevant):\n' + '\n'.join(f'- {t}' for t in tools_hint)) if tools_hint else ''}
{('Provided Methodology (derive findings and lessons from these steps):\n' + '\n'.join(f'- {m}' for m in methodology_hint)) if methodology_hint else ''}
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
        
        # If methodology_hint provided, derive generic findings/lessons from steps
        if methodology_hint:
            steps = [s.strip() for s in methodology_hint if isinstance(s, str) and s.strip()]
            if steps:
                findings = [
                    f"Outcome from step: {step}" for step in steps[:5]
                ]
                lessons = [
                    f"Lesson from step: {step}" for step in steps[:6]
                ]
        
        return {
            "methodology": methodology,
            "tools_used": tools,
            "key_findings": findings,
            "lessons_learned": lessons
        }

# Singleton instance
ai_generator = AIContentGenerator()
