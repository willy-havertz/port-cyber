import re
from typing import List

# Common spam keywords
SPAM_KEYWORDS = [
    'viagra', 'cialis', 'casino', 'poker', 'lottery', 'prize',
    'click here', 'buy now', 'limited time', 'act now',
    'free money', 'earn cash', 'work from home'
]

# Suspicious patterns
SUSPICIOUS_PATTERNS = [
    r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+',  # URLs
    r'\b\d{10,}\b',  # Phone numbers
    r'[A-Z]{5,}',  # ALL CAPS words
]

def is_spam(content: str) -> bool:
    """
    Basic spam detection using keyword matching and pattern analysis
    Returns True if content is likely spam
    """
    content_lower = content.lower()
    
    # Check for spam keywords
    spam_score = 0
    for keyword in SPAM_KEYWORDS:
        if keyword in content_lower:
            spam_score += 1
    
    # Check for suspicious patterns
    for pattern in SUSPICIOUS_PATTERNS:
        if re.search(pattern, content):
            spam_score += 0.5
    
    # Check for excessive capitalization
    if len(content) > 10:
        caps_ratio = sum(1 for c in content if c.isupper()) / len(content)
        if caps_ratio > 0.6:
            spam_score += 1
    
    # Check for repeated characters
    if re.search(r'(.)\1{4,}', content):
        spam_score += 1
    
    # Threshold for spam detection
    return spam_score >= 2

def has_profanity(content: str) -> bool:
    """Check for profanity (basic implementation)"""
    # Add your profanity list here
    profanity_list = ['badword1', 'badword2']  # Replace with actual words
    
    content_lower = content.lower()
    for word in profanity_list:
        if word in content_lower:
            return True
    
    return False
