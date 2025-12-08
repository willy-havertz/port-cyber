import PyPDF2
import pdfplumber
from typing import Dict, List
import re
from sklearn.feature_extraction.text import TfidfVectorizer
import nltk

# Download required NLTK data (run once)
try:
    nltk.download('stopwords', quiet=True)
    nltk.download('punkt', quiet=True)
except:
    pass

def extract_metadata_from_pdf(file_path: str) -> Dict[str, str]:
    """Extract metadata from PDF file"""
    metadata = {}
    
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Get PDF metadata
            info = pdf_reader.metadata
            if info:
                metadata['author'] = info.get('/Author', '')
                metadata['title'] = info.get('/Title', '')
                metadata['subject'] = info.get('/Subject', '')
            
            # Extract first page text as summary
            if len(pdf_reader.pages) > 0:
                first_page = pdf_reader.pages[0].extract_text()
                # Get first 200 characters as summary
                metadata['summary'] = first_page[:200].strip()
    
    except Exception as e:
        print(f"Error extracting metadata: {e}")
    
    return metadata

def suggest_tags(file_path: str, max_tags: int = 5) -> List[str]:
    """
    Analyze PDF content and suggest relevant tags using TF-IDF
    """
    tags = []
    
    try:
        # Extract all text from PDF
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages[:5]:  # Analyze first 5 pages only
                text += page.extract_text() or ""
        
        if not text:
            return []
        
        # Common CTF-related keywords to look for
        ctf_keywords = {
            'sql': 'sql-injection',
            'xss': 'xss',
            'privilege escalation': 'privesc',
            'buffer overflow': 'buffer-overflow',
            'reverse shell': 'reverse-shell',
            'port scanning': 'port-scanning',
            'web': 'web',
            'linux': 'linux',
            'windows': 'windows',
            'network': 'network',
            'forensics': 'forensics',
            'crypto': 'cryptography',
            'steganography': 'steganography',
            'enumeration': 'enumeration',
            'exploit': 'exploit',
            'metasploit': 'metasploit',
            'nmap': 'nmap',
            'burp': 'burp-suite',
            'wireshark': 'wireshark',
            'john': 'password-cracking',
            'hashcat': 'password-cracking',
            'hydra': 'brute-force',
            'gobuster': 'directory-bruteforce',
            'suid': 'suid',
            'cron': 'cron',
            'docker': 'docker',
            'kubernetes': 'kubernetes'
        }
        
        text_lower = text.lower()
        
        # Find matching keywords
        for keyword, tag in ctf_keywords.items():
            if keyword in text_lower:
                if tag not in tags:
                    tags.append(tag)
        
        # Limit to max_tags
        return tags[:max_tags]
    
    except Exception as e:
        print(f"Error suggesting tags: {e}")
        return []
