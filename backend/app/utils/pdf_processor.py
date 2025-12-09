import PyPDF2
import pdfplumber
from typing import Dict, List, Tuple
import re
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer

# Download required NLTK data (run once)
try:
    nltk.download("stopwords", quiet=True)
    nltk.download("punkt", quiet=True)
except Exception:
    pass


def _clean_text(text: str) -> str:
    # Basic cleanup: collapse whitespace and strip
    return re.sub(r"\s+", " ", text or "").strip()


def extract_text_and_summary(file_path: str, summary_chars: int = 600) -> Tuple[str, str]:
    """Extract full text (first 5 pages) and a concise summary."""
    full_text = ""
    summary = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages[:5]:  # first 5 pages for speed
                full_text += page.extract_text() or ""
        full_text = _clean_text(full_text)
        if full_text:
            summary = full_text[:summary_chars].strip()
    except Exception as e:
        print(f"Error extracting text: {e}")
    return full_text, summary


def extract_metadata_from_pdf(file_path: str) -> Dict[str, str]:
    """Extract metadata and summary from PDF file."""
    metadata: Dict[str, str] = {}
    try:
        with open(file_path, "rb") as file:
            pdf_reader = PyPDF2.PdfReader(file)
            info = pdf_reader.metadata
            if info:
                metadata["author"] = info.get("/Author", "")
                metadata["title"] = info.get("/Title", "")
                metadata["subject"] = info.get("/Subject", "")
    except Exception as e:
        print(f"Error extracting metadata: {e}")

    # Add summary from content if possible
    _, summary = extract_text_and_summary(file_path)
    if summary:
        metadata["summary"] = summary

    return metadata


def suggest_tags(file_path: str, max_tags: int = 5) -> List[str]:
    """Analyze PDF content and suggest relevant tags using keywords + TF-IDF."""
    tags: List[str] = []

    try:
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages[:5]:
                text += page.extract_text() or ""

        text = _clean_text(text)
        if not text:
            return []

        ctf_keywords = {
            "sql": "sql-injection",
            "xss": "xss",
            "privilege escalation": "privesc",
            "buffer overflow": "buffer-overflow",
            "reverse shell": "reverse-shell",
            "port scanning": "port-scanning",
            "web": "web",
            "linux": "linux",
            "windows": "windows",
            "network": "network",
            "forensics": "forensics",
            "crypto": "cryptography",
            "steganography": "steganography",
            "enumeration": "enumeration",
            "exploit": "exploit",
            "metasploit": "metasploit",
            "nmap": "nmap",
            "burp": "burp-suite",
            "wireshark": "wireshark",
            "john": "password-cracking",
            "hashcat": "password-cracking",
            "hydra": "brute-force",
            "gobuster": "directory-bruteforce",
            "suid": "suid",
            "cron": "cron",
            "docker": "docker",
            "kubernetes": "kubernetes",
        }

        text_lower = text.lower()
        for keyword, tag in ctf_keywords.items():
            if keyword in text_lower and tag not in tags:
                tags.append(tag)

        # Supplement with top TF-IDF terms if we still need more
        if len(tags) < max_tags:
            try:
                vectorizer = TfidfVectorizer(max_features=50, stop_words="english")
                tfidf_matrix = vectorizer.fit_transform([text])
                feature_array = vectorizer.get_feature_names_out()
                # Take first N features as fallback tags
                for term in feature_array:
                    if len(tags) >= max_tags:
                        break
                    if term not in tags:
                        tags.append(term)
            except Exception:
                pass

        return tags[:max_tags]

    except Exception as e:
        print(f"Error suggesting tags: {e}")
        return []
