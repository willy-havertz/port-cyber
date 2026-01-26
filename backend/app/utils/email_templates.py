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
                                        <!-- Logo/Icon -->
                                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%); border-radius: 12px; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                                            <span style="font-size: 28px; line-height: 60px;">🛡️</span>
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
                                    <td style="padding: 0 8px;">
                                        <a href="https://github.com/wiltordichingwa" style="display: inline-block; width: 36px; height: 36px; background-color: #1a1f2e; border-radius: 8px; text-decoration: none; line-height: 36px; text-align: center;">
                                            <span style="color: #888;">GH</span>
                                        </a>
                                    </td>
                                    <td style="padding: 0 8px;">
                                        <a href="https://linkedin.com/in/wiltordichingwa" style="display: inline-block; width: 36px; height: 36px; background-color: #1a1f2e; border-radius: 8px; text-decoration: none; line-height: 36px; text-align: center;">
                                            <span style="color: #888;">IN</span>
                                        </a>
                                    </td>
                                    <td style="padding: 0 8px;">
                                        <a href="https://wiltordichingwa.dev" style="display: inline-block; width: 36px; height: 36px; background-color: #1a1f2e; border-radius: 8px; text-decoration: none; line-height: 36px; text-align: center;">
                                            <span style="color: #888;">🌐</span>
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
