import os
import resend

resend.api_key = os.environ.get("RESEND_API_KEY", "")

FROM_EMAIL = os.environ.get("RESEND_FROM_EMAIL", "Kommune <hello@kommune.app>")


def send_activation_request_email(to_email: str, reference: str, amount_zar: int = 300, zapper_qr_url: str = ""):
    if not resend.api_key:
        return None
    qr_section = ""
    if zapper_qr_url and "placehold" not in zapper_qr_url:
        qr_section = "<div style='text-align:center;margin:24px 0;'><img src='" + zapper_qr_url + "' alt='Zapper QR' style='width:200px;height:200px;border:4px solid #b8ff57;' /></div>"
    html = "<div style='font-family:monospace;background:#0f0f0f;color:#f5f5f5;padding:32px;max-width:520px;'><h2 style='color:#b8ff57;'>You are almost in.</h2><p>To activate your Kommune account, pay <strong style='color:#b8ff57;'>R" + str(amount_zar) + "</strong> via Zapper.</p>" + qr_section + "<div style='background:#1a1a1a;border-left:4px solid #b8ff57;padding:16px;margin:24px 0;'><p style='margin:0;font-size:12px;color:#6b6b6b;'>YOUR REFERENCE</p><p style='margin:8px 0 0;font-size:24px;letter-spacing:4px;color:#b8ff57;'>" + reference + "</p></div><p>Use this reference as your payment note in Zapper.</p><p>We will activate your account within <strong>24 hours</strong> of receiving payment.</p><p style='color:#6b6b6b;font-size:12px;'>Kommune - technology made for real people.</p></div>"
    return resend.Emails.send({"from": FROM_EMAIL, "to": to_email, "subject": "Your Kommune activation reference: " + reference, "html": html})


def send_activation_confirmed_email(to_email: str, name=None):
    if not resend.api_key:
        return None
    greeting = "Hi " + name + "," if name else "Hi there,"
    html = "<div style='font-family:monospace;background:#0f0f0f;color:#f5f5f5;padding:32px;max-width:520px;'><h2 style='color:#b8ff57;'>You are in. Welcome to Kommune.</h2><p>" + greeting + "</p><p>Your payment has been received and your account is now <strong style='color:#b8ff57;'>active</strong>.</p><p>Head to <a href='https://kommune.app' style='color:#b8ff57;'>kommune.app</a> to get started.</p><p style='color:#6b6b6b;font-size:12px;'>Kommune - technology made for real people.</p></div>"
    return resend.Emails.send({"from": FROM_EMAIL, "to": to_email, "subject": "Your Kommune account is active", "html": html})


def send_waitlist_confirmation(to_email: str, name=None):
    if not resend.api_key:
        return None
    greeting = "Hi " + name + "," if name else "Hi there,"
    html = "<div style='font-family:monospace;background:#0f0f0f;color:#f5f5f5;padding:32px;'><h2 style='color:#b8ff57;'>You are on the list.</h2><p>" + greeting + "</p><p>Thanks for joining the Kommune waitlist. We will be in touch soon.</p><p style='color:#6b6b6b;'>Kommune - technology made for real people.</p></div>"
    return resend.Emails.send({"from": FROM_EMAIL, "to": to_email, "subject": "You are on the Kommune waitlist", "html": html})