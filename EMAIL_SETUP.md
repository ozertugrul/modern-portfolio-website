# Email Reply System Setup

Admin panelinizdeki Contacts bölümünden kullanıcılara email yanıtı gönderebilirsiniz.

## Kurulum

Proje artık kendi SMTP sunucusuyla birlikte geliyor. Docker Compose otomatik olarak bir mail sunucusu başlatır.

### Hızlı Başlangıç

1. Servisleri başlatın:
```bash
docker-compose up -d
```

2. `.env` dosyası zaten yapılandırılmış durumda:
```bash
SMTP_HOST=mailserver
SMTP_PORT=587
SMTP_USER=info@ertugrulozer.com.tr
SMTP_PASSWORD=
```

3. Admin paneline gidin ve Contacts sekmesinden mail göndermeye başlayın!

## DNS Ayarları (Önemli!)

Email'lerinizin spam olarak işaretlenmemesi için DNS kayıtlarınızı yapılandırmalısınız:

### SPF Kaydı
Domain'inizin DNS ayarlarına TXT kaydı ekleyin:
```
ertugrulozer.com.tr.  IN  TXT  "v=spf1 ip4:YOUR_SERVER_IP ~all"
```

### PTR (Reverse DNS) Kaydı
Sunucu IP'nizin reverse DNS kaydını mail.ertugrulozer.com.tr olarak ayarlayın.
(Hosting sağlayıcınızdan talep edin)

### MX Kaydı (Opsiyonel - Gelen mail için)
```
ertugrulozer.com.tr.  IN  MX  10  mail.ertugrulozer.com.tr.
```

## Dış SMTP Sunucu Kullanımı

Kendi sunucunuz yerine Gmail veya başka bir sağlayıcı kullanmak isterseniz:

### Gmail İçin
1. Gmail hesabınızda 2FA açın
2. [App Passwords](https://myaccount.google.com/apppasswords) oluşturun
3. `.env` dosyasını düzenleyin:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@ertugrulozer.com.tr
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
```

### Başka SMTP Sağlayıcı İçin
```bash
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=info@ertugrulozer.com.tr
SMTP_PASSWORD=your_password
```

Değişiklik sonrası servisleri yeniden başlatın:
```bash
docker-compose down && docker-compose up -d
```

## Kullanım

1. Admin paneline giriş yapın (admin123)
2. **Contacts** sekmesine gidin
3. Bir mesajı tıklayın
4. **📧 Yanıtla** butonuna basın
5. Konu ve mesajınızı yazın
6. **📧 Gönder** ile email'i gönderin

Email başarıyla gönderilirse kullanıcının email adresine `info@ertugrulozer.com.tr` adresinden yanıt ulaşacaktır.

## Test

Mail sunucusunun çalışıp çalışmadığını kontrol edin:
```bash
docker-compose logs mailserver
```

Backend loglarını kontrol edin:
```bash
docker-compose logs backend1 backend2
```
