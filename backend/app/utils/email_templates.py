"""
Professional HTML email templates for the portfolio
Cybersecurity-themed design with dark/green color scheme
"""

def get_base_template(content: str, preview_text: str = "") -> str:
    """Base email template wrapper with consistent styling"""
    return f'''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Wiltord Ichingwa</title>
    <!--[if mso]>
    <style type="text/css">
        table {{border-collapse: collapse; border-spacing: 0; margin: 0;}}
        div, td {{padding: 0;}}
        div {{margin: 0 !important;}}
    </style>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <!-- Preview text -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        {preview_text}
    </div>
    
    <!-- Email wrapper -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0a0a0a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <!-- Main container -->
                <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 100%); border-radius: 16px 16px 0 0; padding: 32px 40px; text-align: center; border-bottom: 2px solid #00ff88;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                <tr>
                                    <td align="center">
                                        <!-- WI Logo -->
                                        <div style="width: 60px; height: 40px; margin: 0 auto 16px;">
                                            <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" style="width: 60px; height: 40px;">
                                                <!-- W - Geometric with heavy strokes -->
                                                <g>
                                                    <path d="M2 4 L6 4 L10 24 L14 4 L18 4 L22 24 L26 4 L30 4 L24 28 L20 28 L16 10 L12 28 L8 28 Z" fill="#00ff88"/>
                                                    <path d="M4 6 L8 6 L11 22 L14 6 L18 6 L21 22 L24 6 L28 6 L23 26 L19 26 L16 12 L13 26 L9 26 Z" fill="#0f1419"/>
                                                </g>
                                                <!-- I - Solid bar -->
                                                <g>
                                                    <rect x="36" y="4" width="6" height="24" fill="#00ff88"/>
                                                    <rect x="37" y="6" width="4" height="20" fill="#0f1419"/>
                                                </g>
                                            </svg>
                                        </div>
                                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                                            Wiltord Ichingwa
                                        </h1>
                                        <p style="margin: 8px 0 0; color: #00ff88; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">
                                            Cybersecurity Professional
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="background-color: #12141a; padding: 40px;">
                            {content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f1117; border-radius: 0 0 16px 16px; padding: 32px 40px; text-align: center;">
                            <!-- Social Links -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto 20px;">
                                <tr>
                                    <td style="padding: 0 12px;">
                                        <a href="https://github.com/willy-havertz" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background-color: #1a1f2e; border-radius: 8px; text-decoration: none;">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#888" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                                            </svg>
                                            <span style="color: #b8b8b8; font-size: 13px; font-weight: 500;">GitHub</span>
                                        </a>
                                    </td>
                                    <td style="padding: 0 12px;">
                                        <a href="https://www.linkedin.com/in/wiltord-ichingwa" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px; background-color: #1a1f2e; border-radius: 8px; text-decoration: none;">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                            </svg>
                                            <span style="color: #b8b8b8; font-size: 13px; font-weight: 500;">LinkedIn</span>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 8px; color: #666; font-size: 13px;">
                                © 2026 Wiltord Ichingwa. All rights reserved.
                            </p>
                            <p style="margin: 0; color: #444; font-size: 12px;">
                                <a href="https://wiltordichingwa.dev" style="color: #00ff88; text-decoration: none;">wiltordichingwa.dev</a>
                            </p>
                        </td>
                    </tr>
                    
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
'''


def contact_confirmation_email(name: str) -> str:
    """Email sent to user after submitting contact form"""
    content = f'''
        <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
            Message Received! ✓
        </h2>
        
        <p style="margin: 0 0 16px; color: #b8b8b8; font-size: 16px; line-height: 1.6;">
            Hi <strong style="color: #ffffff;">{name}</strong>,
        </p>
        
        <p style="margin: 0 0 24px; color: #b8b8b8; font-size: 16px; line-height: 1.6;">
            Thank you for reaching out! I've received your message and will get back to you as soon as possible, typically within 24-48 hours.
        </p>
        
        <!-- Info Box -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
            <tr>
                <td style="background-color: #1a1f2e; border-left: 4px solid #00ff88; border-radius: 0 8px 8px 0; padding: 20px;">
                    <p style="margin: 0; color: #888; font-size: 14px; line-height: 1.5;">
                        💡 <strong style="color: #00ff88;">In the meantime:</strong><br>
                        Feel free to explore my <a href="https://wiltordichingwa.dev/writeups" style="color: #00ff88; text-decoration: none;">writeups</a> or check out my <a href="https://wiltordichingwa.dev/projects" style="color: #00ff88; text-decoration: none;">projects</a>.
                    </p>
                </td>
            </tr>
        </table>
        
        <p style="margin: 0; color: #b8b8b8; font-size: 16px; line-height: 1.6;">
            Best regards,<br>
            <strong style="color: #ffffff;">Wiltord Ichingwa</strong>
        </p>
    '''
    return get_base_template(content, f"Hi {name}, thank you for your message!")


def admin_notification_email(name: str, email: str, subject: str, message: str) -> str:
    """Email sent to admin when contact form is submitted"""
    content = f'''
        <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
            📬 New Contact Form Submission
        </h2>
        
        <!-- Sender Info Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
            <tr>
                <td style="background-color: #1a1f2e; border-radius: 12px; padding: 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td width="50" valign="top">
                                <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 50%; text-align: center; line-height: 44px; font-size: 18px; font-weight: 600; color: #0a0a0a;">
                                    {name[0].upper()}
                                </div>
                            </td>
                            <td style="padding-left: 16px;">
                                <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 600;">
                                    {name}
                                </p>
                                <p style="margin: 0; color: #00ff88; font-size: 14px;">
                                    <a href="mailto:{email}" style="color: #00ff88; text-decoration: none;">{email}</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <!-- Subject -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 16px;">
            <tr>
                <td style="background-color: #1a1f2e; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Subject
                    </p>
                    <p style="margin: 0; color: #ffffff; font-size: 16px; font-weight: 500;">
                        {subject}
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- Message -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
            <tr>
                <td style="background-color: #1a1f2e; border-radius: 8px; padding: 16px;">
                    <p style="margin: 0 0 4px; color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                        Message
                    </p>
                    <p style="margin: 0; color: #b8b8b8; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
{message}
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- Reply Button -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
                <td style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 8px;">
                    <a href="mailto:{email}?subject=Re: {subject}" style="display: inline-block; padding: 14px 28px; color: #0a0a0a; font-size: 15px; font-weight: 600; text-decoration: none;">
                        Reply to {name} →
                    </a>
                </td>
            </tr>
        </table>
    '''
    return get_base_template(content, f"New message from {name}: {subject}")


def reply_notification_email(commenter_name: str, reply_preview: str, writeup_id: str, writeup_title: str = "the writeup") -> str:
    """Email sent when someone replies to a comment"""
    # Truncate preview if too long
    preview = reply_preview[:250] + "..." if len(reply_preview) > 250 else reply_preview
    
    content = f'''
        <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
            💬 Someone Replied to Your Comment!
        </h2>
        
        <p style="margin: 0 0 24px; color: #b8b8b8; font-size: 16px; line-height: 1.6;">
            <strong style="color: #00ff88;">{commenter_name}</strong> replied to your comment.
        </p>
        
        <!-- Reply Preview -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 32px;">
            <tr>
                <td style="background-color: #1a1f2e; border-left: 4px solid #00ff88; border-radius: 0 12px 12px 0; padding: 24px;">
                    <p style="margin: 0 0 12px; color: #888; font-size: 13px;">
                        <strong style="color: #ffffff;">{commenter_name}</strong> wrote:
                    </p>
                    <p style="margin: 0; color: #b8b8b8; font-size: 15px; line-height: 1.7; font-style: italic;">
                        "{preview}"
                    </p>
                </td>
            </tr>
        </table>
        
        <!-- View Button -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
            <tr>
                <td style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 8px;">
                    <a href="https://wiltordichingwa.dev/writeups/{writeup_id}" style="display: inline-block; padding: 14px 32px; color: #0a0a0a; font-size: 15px; font-weight: 600; text-decoration: none;">
                        View Conversation →
                    </a>
                </td>
            </tr>
        </table>
        
        <!-- Unsubscribe note -->
        <p style="margin: 32px 0 0; color: #555; font-size: 12px; text-align: center;">
            You're receiving this because someone replied to your comment.<br>
            <a href="https://wiltordichingwa.dev/settings/notifications" style="color: #666; text-decoration: underline;">Manage notification preferences</a>
        </p>
    '''
    return get_base_template(content, f"{commenter_name} replied to your comment")


def newsletter_welcome_email(email: str) -> str:
    """Welcome email sent when someone subscribes to newsletter"""
    content = f'''
        <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
            Welcome to the Newsletter! 🎉
        </h2>
        
        <p style="margin: 0 0 16px; color: #b8b8b8; font-size: 16px; line-height: 1.6;">
            You're now subscribed to my cybersecurity newsletter. Here's what you can expect:
        </p>
        
        <!-- Features List -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td width="40" style="color: #00ff88; font-size: 18px;">🔐</td>
                            <td style="color: #b8b8b8; font-size: 15px;">Latest CTF writeups and walkthroughs</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td width="40" style="color: #00ff88; font-size: 18px;">💡</td>
                            <td style="color: #b8b8b8; font-size: 15px;">Security tips, tools, and techniques</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #1f2937;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td width="40" style="color: #00ff88; font-size: 18px;">📰</td>
                            <td style="color: #b8b8b8; font-size: 15px;">Industry news and career insights</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 12px 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                            <td width="40" style="color: #00ff88; font-size: 18px;">🚀</td>
                            <td style="color: #b8b8b8; font-size: 15px;">New project announcements</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        
        <!-- CTA Button -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px;">
            <tr>
                <td style="background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 8px;">
                    <a href="https://wiltordichingwa.dev/writeups" style="display: inline-block; padding: 14px 28px; color: #0a0a0a; font-size: 15px; font-weight: 600; text-decoration: none;">
                        Explore Latest Writeups →
                    </a>
                </td>
            </tr>
        </table>
        
        <p style="margin: 0; color: #666; font-size: 13px;">
            You can unsubscribe at any time by clicking 
            <a href="https://wiltordichingwa.dev/newsletter/unsubscribe?email={email}" style="color: #666; text-decoration: underline;">here</a>.
        </p>
    '''
    return get_base_template(content, "Welcome to my cybersecurity newsletter!")


def newsletter_email(subject: str, content_html: str, email: str) -> str:
    """Template for newsletter broadcasts"""
    content = f'''
        <h2 style="margin: 0 0 24px; color: #ffffff; font-size: 22px; font-weight: 600;">
            {subject}
        </h2>
        
        <div style="color: #b8b8b8; font-size: 16px; line-height: 1.7;">
            {content_html}
        </div>
        
        <hr style="border: none; border-top: 1px solid #1f2937; margin: 32px 0;">
        
        <p style="margin: 0; color: #666; font-size: 13px; text-align: center;">
            You're receiving this because you subscribed to the newsletter.<br>
            <a href="https://wiltordichingwa.dev/newsletter/unsubscribe?email={email}" style="color: #666; text-decoration: underline;">Unsubscribe</a>
        </p>
    '''
    return get_base_template(content, subject)
