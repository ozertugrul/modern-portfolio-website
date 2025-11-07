# 🚀 Quick Start Guide - Email Attachments Feature

## ✅ System Status
All services are running and healthy!

## 🔗 Access URLs
- **Main Site**: http://192.168.1.235:8000
- **CloudFlare Tunnel**: https://culture-angels-low-combined.trycloudflare.com
- **Admin Panel**: http://192.168.1.235:8000/admin

## 🔑 Login
- **Password**: `admin123`

## 📧 How to Reply to Contact Messages with Attachments

### Step-by-Step:

1. **Open Admin Panel**
   - Go to http://192.168.1.235:8000/admin
   - Enter password: `admin123`
   - Click "Giriş Yap"

2. **Navigate to Messages**
   - Click "📧 İletişim Mesajları" in the left menu

3. **Select a Message**
   - Click on any message from the list
   - Message details will appear

4. **Start Reply**
   - Click "📧 Yanıtla" button at the bottom
   - Reply form will appear

5. **Compose Email**
   - Subject is auto-filled (you can edit it)
   - Use the rich text editor toolbar:
     - **B** = Bold text
     - *I* = Italic text
     - U = Underline
     - S = Strikethrough
     - H1, H2 = Headings
     - • List, 1. List = Lists
     - 🔗 Link = Add hyperlink
     - **📎 Dosya = Attach files** ⬅️ NEW!
     - Color picker = Change text color
     - ↶ ↷ = Undo/Redo

6. **Attach Files** 📎
   - Click "📎 Dosya" button
   - File picker opens
   - Select file (max 10MB)
   - Wait for upload
   - File appears as styled button in email
   - Repeat to attach multiple files

7. **Send Email**
   - Review your message
   - Click "📧 Gönder"
   - Success message appears
   - Email sent with all attachments!

## 📄 Supported File Types
- ✅ PDF documents
- ✅ Images (JPEG, PNG, GIF)
- ✅ Text files (.txt)
- ✅ Word documents (.doc, .docx)
- ✅ Excel files
- ✅ ZIP archives
- ✅ Any other file type (max 10MB)

## 💡 Tips

### Formatting Tips:
- Use **bold** for emphasis
- Use headings for structure
- Add bullet lists for clarity
- Use colors sparingly for highlights

### Attachment Tips:
- Keep files under 10MB
- PDF format works best for documents
- Compress images if they're large
- You can attach multiple files

### Email Tips:
- Be professional and clear
- Check spelling before sending
- Include relevant attachments
- Reply-To is automatically set to info@ertugrulozer.com.tr

## 🎯 Example Reply

**Subject**: Re: John Doe - İletişim

**Message**:
```
Merhaba John,

Mesajınız için teşekkür ederiz!

İstediğiniz bilgiler ekteki PDF dosyasında bulunmaktadır.

Detaylı bilgi için:
• Web sitemizi ziyaret edebilirsiniz
• Telefon: +90 XXX XXX XX XX
• Email: info@ertugrulozer.com.tr

İyi günler dileriz!

[📎 bilgiler.pdf] ⬅️ Attached file
```

## 🔧 Troubleshooting

**File upload fails?**
- Check file size (must be < 10MB)
- Check internet connection
- Refresh the page and try again

**Email not sending?**
- Check SMTP configuration in .env
- Verify recipient email address
- Check backend logs: `docker-compose logs backend1`

**Attachments not received?**
- Check recipient's spam folder
- Verify file was uploaded (check message before sending)
- Try with a smaller file

## 📊 System Commands

**Check services status**:
```bash
cd /home/ertu/test/modern-portfolio-website
docker-compose ps
```

**View logs**:
```bash
docker-compose logs -f backend1
```

**Restart services**:
```bash
docker-compose restart
```

**Rebuild after changes**:
```bash
docker-compose down
docker-compose up -d --build
```

## ✨ What's New

✅ **Rich Text Editor** with full formatting
✅ **File Upload** with drag & drop support
✅ **Email Attachments** up to 10MB
✅ **Professional Email Templates** with CSS
✅ **Persistent Storage** for uploaded files
✅ **Multiple File Support** in one email
✅ **Auto MIME Type Detection** for all file types

## 🎉 Ready to Use!

Everything is configured and working. Just login to the admin panel and start replying to messages with attachments!

**Questions?** Check the detailed documentation in:
- `IMPLEMENTATION_SUMMARY.md` - Full technical details
- `FILE_UPLOAD_FEATURE.md` - Feature documentation
