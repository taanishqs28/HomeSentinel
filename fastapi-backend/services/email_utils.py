import smtplib
from email.message import EmailMessage
from config import EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS

def send_invite_email(to_email: str, recipient_name: str, invite_url: str):
    msg = EmailMessage()
    msg["Subject"] = "You're Invited to Join a Household on HomeSentinel"
    msg["From"] = EMAIL_USER
    msg["To"] = to_email

    msg.set_content(f"""
Hi {recipient_name},

You've been invited to join a household on HomeSentinel.

Click the link below to register and join:
{invite_url}

If you were not expecting this invite, you may ignore it.

– The HomeSentinel Team
    """)

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USER, EMAIL_PASS)
            server.send_message(msg)
    except Exception as e:
        raise Exception(f"Email sending failed: {str(e)}")
