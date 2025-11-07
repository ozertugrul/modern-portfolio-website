# File Upload Feature for Email Attachments

## What Was Added

### Backend Changes

1. **New Dependencies** (Cargo.toml):
   - `axum-extra` with multipart feature for handling file uploads
   - `base64` for encoding support

2. **New API Endpoints**:
   - `POST /api/admin/upload` - Upload files (admin only, max 10MB)
   - `GET /uploads/:filename` - Serve uploaded files

3. **File Upload Handler** (`admin_upload_file`):
   - Accepts multipart form data
   - Validates file size (max 10MB)
   - Generates unique filenames using UUID
   - Stores files in `uploads/` directory
   - Returns file URL for embedding in emails

4. **Enhanced Email Reply** (`admin_reply_contact`):
   - Updated `EmailReplyRequest` struct to include optional `attachments` field
   - Supports multiple file attachments
   - Properly detects MIME types (PDF, images, documents, etc.)
   - Builds multipart/mixed emails with attachments
   - Embeds files directly in email

5. **File Serving** (`serve_uploaded_file`):
   - Serves uploaded files with correct Content-Type headers
   - Supports various file types (PDF, images, documents)

### Frontend Changes

1. **RichTextEditor Component** (`components/RichTextEditor.tsx`):
   - Changed file attachment button from URL input to actual file upload
   - Opens native file picker dialog
   - Validates file size (max 10MB)
   - Uploads file to backend via `/api/admin/upload`
   - Inserts file link with styled button in email content
   - Shows proper feedback for upload errors

## How to Use

### Admin Panel - Replying to Contacts with Attachments:

1. Go to Admin Panel → İletişim Mesajları (Contact Messages)
2. Select a message and click "Yanıtla" (Reply)
3. Use the rich text editor to compose your reply:
   - **Bold** (B), *Italic* (I), <u>Underline</u> (U), ~~Strikethrough~~ (S)
   - Headings (H1, H2)
   - Lists (bullet and numbered)
   - Links (🔗)
   - **File Attachments (📎)** - Click to upload files up to 10MB
   - Text colors
   - Horizontal rules
4. Click **📎 Dosya** button to attach files
5. Select file from your computer
6. File uploads and appears as a styled link in your message
7. Click **📧 Gönder** to send email with attachments

### Supported File Types:
- PDF documents
- Images (JPEG, PNG)
- Text files
- Word documents (.doc, .docx)
- Any other file type (sent as generic attachment)

## Technical Details

### File Storage:
- Files are stored in the `/app/uploads/` directory inside the Docker container
- Filenames are prefixed with UUID to prevent conflicts
- Format: `{uuid}_{original_filename}`

### Security:
- Upload endpoint requires admin authentication
- File size limited to 10MB per file
- Files served with appropriate Content-Type headers
- Only authenticated admins can upload

### Email Format:
- Emails are sent as multipart/mixed
- Contains both HTML and plain text versions
- Attachments are embedded with proper MIME types
- Original filenames are preserved in email

## Future Improvements

1. Add file type restrictions (whitelist/blacklist)
2. Add thumbnail preview for images
3. Add progress bar for large uploads
4. Add ability to remove attached files before sending
5. Add file management interface in admin panel
6. Add automatic cleanup of old uploaded files
7. Add virus scanning for uploaded files
8. Add compression for large files
