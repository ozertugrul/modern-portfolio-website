# SMTP Email Reply System - Hızlı Kullanım Kılavuzu

## ✅ Kurulum Tamamlandı!

SMTP mail sunucunuz artık çalışıyor ve kullanıma hazır!

## 🚀 Hemen Kullanmaya Başlayın

1. **Admin Panele Giriş:**
   - http://192.168.1.235:8000/ adresine gidin
   - Kullanıcı adı: admin
   - Şifre: admin123

2. **Email Yanıtlama:**
   - Admin panelde **Contacts** sekmesine tıklayın
   - Bir mesajı seçin
   - **📧 Yanıtla** butonuna basın
   - Konu ve mesajınızı yazıp **📧 Gönder**

3. **Email Gönderiliyor!**
   - Email otomatik olarak `info@ertugrulozer.com.tr` adresinden gönderilir
   - Kullanıcı kendi email adresine yanıtı alır

## ⚙️ Mevcut Ayarlar

```bash
SMTP_HOST=mailserver         # Local Postfix sunucu
SMTP_PORT=587                # Standart SMTP portu
SMTP_USER=info@ertugrulozer.com.tr
SMTP_PASSWORD=               # Şifre yok (local sunucu)
```

## 📧 Email'ler Neden Spam Olabilir?

Şu anda email'ler **sunucu IP'nizden direkt gönderiliyor** ama DNS ayarları yapılmadığı için spam olarak işaretlenebilir.

### DNS Ayarlarını Yapmak İçin:

1. `DNS_SETUP.md` dosyasını okuyun
2. Domain sağlayıcınıza (Natro, Turhost, vb.) giriş yapın
3. Gerekli DNS kayıtlarını ekleyin (SPF, PTR, MX)
4. 24 saat içinde email'leriniz spam'den çıkar

## 🔍 Test ve Kontrol

```bash
# Mail sunucusu çalışıyor mu?
docker-compose logs mailserver

# Backend loglarını kontrol et
docker-compose logs backend1 backend2

# Tüm servisler sağlıklı mı?
docker-compose ps
```

## 🛠️ Sorun Giderme

### Email gönderilmiyor:
```bash
# Servisleri yeniden başlat
docker-compose restart backend1 backend2 mailserver
```

### Gmail kullanmak istiyorum:
`.env` dosyasını düzenleyin:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=info@ertugrulozer.com.tr
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail App Password
```

Sonra yeniden başlatın:
```bash
docker-compose down
docker-compose up -d
```

## 📚 Detaylı Bilgi

- **EMAIL_SETUP.md** - SMTP ve email ayarları
- **DNS_SETUP.md** - DNS ayarları ve spam önleme
- **README.md** - Genel proje dokümantasyonu

## 💡 Öneriler

1. ✅ **Hemen test edin** - Admin panelden kendinize bir test email gönderin
2. ⏳ **DNS ayarlarını yapın** - Email'leriniz spam'e düşmesin
3. 🔒 **Admin şifresini değiştirin** - Güvenlik için önemli

---

**Destek:** EMAIL_SETUP.md ve DNS_SETUP.md dosyalarına bakın veya [https://github.com/ozertugrul/modern-portfolio-website](https://github.com/ozertugrul/modern-portfolio-website)
