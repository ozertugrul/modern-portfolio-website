# Email Setup Guide

This guide explains how the email system is configured for your portfolio website.

## Current Configuration

### SMTP Server
- **Type**: Postfix (Local SMTP server running in Docker)
- **Hostname**: mail.ozertugrul.com.tr
- **Port**: 587 (internal), 25 (exposed to host)
- **Authentication**: None required (local server)
- **Sender Email**: info@ozertugrul.com.tr
- **Allowed Domains**: ozertugrul.com.tr

### How It Works

1. **Mail Server Container**: A Postfix mail server runs as a Docker container
2. **Backend Integration**: The Rust backend connects to the mailserver via the Docker network
3. **Admin Panel**: You can reply to contact messages directly from the admin panel
4. **No Password Needed**: Since the mail server is local, no SMTP authentication is required

## Using the Email Reply Feature

1. Go to admin panel: `http://your-domain.com/admin`
2. Navigate to the "Contacts" tab
3. Click on any message to view it
4. Click the "📧 Yanıtla" (Reply) button
5. Fill in the subject and message
6. Click "📧 Gönder" (Send)

The email will be sent from `info@ozertugrul.com.tr` to the person who sent the contact message.

## DNS Configuration for Production

For emails to be delivered properly in production, you need to configure DNS records:

### 1. MX Record
```
Type: MX
Name: ozertugrul.com.tr
Value: mail.ozertugrul.com.tr
Priority: 10
```

### 2. A Record for Mail Server
```
Type: A
Name: mail.ozertugrul.com.tr
Value: YOUR_SERVER_IP (192.168.1.235 for local)
```

### 3. SPF Record (Sender Policy Framework)
```
Type: TXT
Name: ozertugrul.com.tr
Value: v=spf1 mx a:mail.ozertugrul.com.tr ~all
```

### 4. DKIM Record (Optional but Recommended)
DKIM signing is currently disabled. To enable it, you would need to:
1. Generate DKIM keys in the mailserver container
2. Add the public key to your DNS as a TXT record

### 5. DMARC Record (Optional but Recommended)
```
Type: TXT
Name: _dmarc.ozertugrul.com.tr
Value: v=DMARC1; p=none; rua=mailto:info@ozertugrul.com.tr
```

## Troubleshooting

### Email Not Sending
1. Check if mailserver container is running: `docker-compose ps`
2. Check mailserver logs: `docker-compose logs mailserver`
3. Verify SMTP settings in `.env` file
4. Test connectivity from backend to mailserver:
   ```bash
   docker-compose exec backend1 sh -c "nc -zv mailserver 587"
   ```

### Emails Going to Spam
- Configure DNS records (SPF, DKIM, DMARC) as described above
- Make sure your server IP is not blacklisted
- Consider using a service like AWS SES or SendGrid for production

### Testing Email Locally
You can use `telnet` or `nc` to test the SMTP server:
```bash
telnet localhost 25
EHLO mail.ozertugrul.com.tr
MAIL FROM:<info@ozertugrul.com.tr>
RCPT TO:<recipient@example.com>
DATA
Subject: Test
This is a test message.
.
QUIT
```

## Environment Variables

```env
SMTP_HOST=mailserver
SMTP_PORT=587
SMTP_USER=info@ozertugrul.com.tr
SMTP_PASSWORD=
```

## Production Considerations

For a production environment, consider:

1. **Use a Dedicated Email Service**: Services like AWS SES, SendGrid, or Mailgun are more reliable and won't get flagged as spam
2. **Enable TLS/SSL**: Configure proper SSL certificates for the mail server
3. **Set up DKIM**: Enable and configure DKIM signing
4. **Monitor Deliverability**: Use tools to monitor email deliverability rates
5. **Backup MX Records**: Add secondary MX servers for redundancy

## Current Status

✅ Mail server is running and configured
✅ Backend can send emails via the local SMTP server
✅ Admin panel has reply functionality
✅ Using info@ozertugrul.com.tr as sender address
⚠️ DNS records need to be configured for production use
⚠️ DKIM is not enabled (optional but recommended)
