# E-posta Yapılandırma Rehberi

Bu rehber, admin panelinden ziyaretçilere e-posta yanıtı gönderebilmek için gerekli SMTP ayarlarını yapmanızı sağlar.

## Önerilen Çözümler

CGNAT nedeniyle kendi e-posta sunucunuzu çalıştıramıyorsanız, aşağıdaki ücretsiz servisleri kullanarak kendi domain'inizle e-posta gönderebilirsiniz.

### 1. Yandex Connect (ÖNERİLEN - Tamamen Ücretsiz)

**Avantajlar:**
- Domain için tamamen ücretsiz
- Sınırsız kullanıcı
- Kolay kurulum
- Türkçe arayüz

**Kurulum Adımları:**

1. **Yandex Connect'e Kaydolun**
   - https://connect.yandex.com adresine gidin
   - "Ücretsiz başlayın" butonuna tıklayın

2. **Domain'inizi Ekleyin**
   - "Alan adı ekle" seçeneğine tıklayın
   - `ertugrulozer.com.tr` domain'inizi girin
   - DNS doğrulama için gereken kayıtları alın

3. **DNS Kayıtlarını Güncelleyin**
   Domain sağlayıcınızın (örn: GoDaddy, Cloudflare) DNS yönetim panelinden:
   ```
   TXT kaydı: yandex-verification: xxxxxxxxxxxxx
   MX kayıtları:
   - mx.yandex.net (öncelik: 10)
   ```

4. **E-posta Hesabı Oluşturun**
   - Yandex Connect panelinde "Çalışanlar" > "Yeni çalışan ekle"
   - Kullanıcı adı: `info`
   - E-posta: `info@ertugrulozer.com.tr`
   - Şifre belirleyin (güçlü bir şifre)

5. **SMTP Ayarlarını Yapın**
   `.env` dosyanızı düzenleyin:
   ```env
   SMTP_HOST=smtp.yandex.com
   SMTP_PORT=587
   SMTP_USER=info@ertugrulozer.com.tr
   SMTP_PASSWORD=sizin_belirlediginiz_sifre
   ```

6. **Konteynerları Yeniden Başlatın**
   ```bash
   cd /home/ertu/test/modern-portfolio-website
   docker-compose down
   docker-compose up -d
   ```

### 2. Zoho Mail (Ücretsiz - 5 Kullanıcıya Kadar)

**Avantajlar:**
- 5 kullanıcıya kadar ücretsiz
- Profesyonel arayüz
- Güvenilir servis

**Kurulum Adımları:**

1. **Zoho Mail'e Kaydolun**
   - https://www.zoho.com/mail/ adresine gidin
   - "Sign Up Free" tıklayın

2. **Domain Ekleyin ve Doğrulayın**
   - `ertugrulozer.com.tr` domain'inizi ekleyin
   - DNS doğrulama kayıtlarını domain'inize ekleyin

3. **MX Kayıtlarını Ekleyin**
   ```
   mx.zoho.com (öncelik: 10)
   mx2.zoho.com (öncelik: 20)
   mx3.zoho.com (öncelik: 50)
   ```

4. **E-posta Hesabı Oluşturun**
   - Zoho Mail panelinde yeni kullanıcı ekleyin
   - `info@ertugrulozer.com.tr` oluşturun

5. **App Password Oluşturun**
   - Zoho hesap ayarlarında "Security" > "App Passwords"
   - Yeni app password oluşturun (örn: "Portfolio Website")

6. **SMTP Ayarlarını Yapın**
   ```env
   SMTP_HOST=smtp.zoho.com
   SMTP_PORT=587
   SMTP_USER=info@ertugrulozer.com.tr
   SMTP_PASSWORD=olusturdugunuz_app_password
   ```

### 3. Gmail ile Özel Domain (Google Workspace)

**Not:** Google Workspace ücretlidir (kullanıcı başına ~6 USD/ay), ancak Google Domains üzerinden domain aldıysanız e-posta yönlendirmesi ücretsizdir.

**Ücretsiz Alternatif:**
Gmail hesabınızı kullanarak özel domain'inizden e-posta gönderebilirsiniz:

1. **Gmail'de Özel Domain Ekleyin**
   - Gmail ayarlarında "Hesaplar ve İçe Aktarma"
   - "Başka bir e-posta adresi ekle" seçeneğine tıklayın
   - `info@ertugrulozer.com.tr` adresini ekleyin

2. **Domain DNS'e SPF Kaydı Ekleyin**
   ```
   TXT kaydı: v=spf1 include:_spf.google.com ~all
   ```

3. **Gmail App Password Oluşturun**
   - https://myaccount.google.com/apppasswords
   - "Mail" için app password oluşturun

4. **SMTP Ayarlarını Yapın**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=sizin_gmail_adresiniz@gmail.com
   SMTP_PASSWORD=olusturdugunuz_app_password
   ```

   **Not:** `SMTP_USER` Gmail adresiniz olacak, ancak e-postalar `info@ertugrulozer.com.tr` adresinden gönderilecek.

## Admin Panelden E-posta Gönderme

SMTP ayarlarınızı yapılandırdıktan sonra:

1. Admin panele giriş yapın: `https://your-domain.com/admin`
2. "Contacts" sekmesine gidin
3. Bir mesaja tıklayın
4. "📧 Yanıtla" butonuna tıklayın
5. Konuyu ve mesajı yazın
6. "📧 Gönder" butonuna tıklayın

## Sorun Giderme

### "Email gönderme hatası! SMTP ayarlarını kontrol edin"

1. **SMTP bilgilerini kontrol edin:**
   ```bash
   cat /home/ertu/test/modern-portfolio-website/.env
   ```

2. **Şifrenin doğru olduğundan emin olun:**
   - Gmail için: App Password kullanın (16 karakterlik)
   - Yandex için: Hesap şifrenizi kullanın
   - Zoho için: App Password kullanın

3. **Konteyner loglarını kontrol edin:**
   ```bash
   cd /home/ertu/test/modern-portfolio-website
   docker-compose logs backend1 | tail -50
   ```

4. **Bağlantı testı yapın:**
   ```bash
   docker-compose exec backend1 sh -c "apk add --no-cache curl && curl -v smtp://smtp.yandex.com:587"
   ```

### Port 587 Engellenmiş Olabilir

Eğer port 587 engellenmiş ise, port 465 (SSL) deneyin:

```env
SMTP_PORT=465
```

**Not:** Port 465 için backend kodunda değişiklik gerekebilir.

### Gmail İçin İki Faktörlü Doğrulama

Gmail kullanıyorsanız ve iki faktörlü doğrulama aktifse:
1. Mutlaka App Password kullanın
2. Normal şifreniz çalışmayacaktır
3. https://myaccount.google.com/apppasswords adresinden oluşturun

## Güvenlik Önerileri

1. **Şifrelerinizi asla GitHub'a yüklemeyin**
   - `.env` dosyası `.gitignore`'da olmalı
   - Sadece `.env.example` dosyasını yükleyin

2. **Güçlü şifreler kullanın**
   - En az 16 karakter
   - Özel karakterler ve sayılar içeren

3. **SPF/DKIM kayıtlarını ekleyin**
   - E-postalarınızın spam'e düşmemesi için
   - Her servisin kendi özel kayıtları var

## Önerilen Çözüm: Yandex Connect

Deneyimlerime göre, CGNAT arkasındaysanız ve kendi domain'inizle ücretsiz e-posta kullanmak istiyorsanız **Yandex Connect en iyi seçenektir**:

✅ Tamamen ücretsiz
✅ Sınırsız kullanıcı
✅ Kolay kurulum
✅ SMTP kısıtlaması yok
✅ Türkçe destek
✅ Güvenilir altyapı

Kurulum süresi: ~15 dakika (DNS yayılma süresi dahil)
