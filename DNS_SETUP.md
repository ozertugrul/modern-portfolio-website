# DNS Setup Guide for Email (ertugrulozer.com.tr)

Bu rehber, email'lerinizin spam olarak işaretlenmemesi için gerekli DNS ayarlarını içerir.

## Gerekli DNS Kayıtları

### 1. SPF Kaydı (Önemli!)
SPF kaydı, hangi sunucuların sizin adınıza email gönderebileceğini belirtir.

**Kayıt Tipi:** TXT  
**Host:** @ veya ertugrulozer.com.tr  
**Değer:** `v=spf1 ip4:YOUR_SERVER_IP ~all`

`YOUR_SERVER_IP` yerine sunucunuzun gerçek IP adresini yazın.

Örnek:
```
v=spf1 ip4:192.168.1.235 ~all
```

### 2. MX Kaydı (Mail Exchange)
Domain'inize gelen email'leri neresi yöneteceğini belirtir.

**Kayıt Tipi:** MX  
**Host:** @ veya ertugrulozer.com.tr  
**Değer:** mail.ertugrulozer.com.tr  
**Priority:** 10

### 3. A Kaydı (Mail sunucusu için)
Mail subdomain'ini sunucu IP'nize yönlendirir.

**Kayıt Tipi:** A  
**Host:** mail  
**Değer:** YOUR_SERVER_IP (örn: 192.168.1.235)

### 4. PTR Kaydı (Reverse DNS) - Hosting sağlayıcıdan talep edin
Sunucunuzun IP'sinin reverse DNS kaydı.

**IP:** YOUR_SERVER_IP  
**Points to:** mail.ertugrulozer.com.tr

Bu ayarı genellikle hosting sağlayıcınızın kontrol panelinden veya destek talebi ile yapabilirsiniz.

### 5. DKIM Kaydı (Opsiyonel ama önerilen)
Email imzalama için kullanılır. Gelecekte eklenebilir.

## DNS Ayarlarını Nerede Yapacağım?

Domain'inizi nereden aldıysanız (örn: Natro, Turhost, GoDaddy), o firmanın kontrol paneline girin:

1. **DNS Yönetimi** veya **DNS Zone Editor** bölümüne gidin
2. Yukarıdaki kayıtları tek tek ekleyin
3. Değişikliklerin yayılması 1-48 saat sürebilir

## Test Etme

DNS kayıtlarınızı test etmek için:

```bash
# SPF kaydını kontrol et
dig txt ertugrulozer.com.tr

# MX kaydını kontrol et
dig mx ertugrulozer.com.tr

# Mail sunucusu A kaydını kontrol et
dig a mail.ertugrulozer.com.tr

# PTR kaydını kontrol et
dig -x YOUR_SERVER_IP
```

Online araçlar:
- https://mxtoolbox.com/spf.aspx (SPF test)
- https://mxtoolbox.com/SuperTool.aspx (Tüm DNS testleri)

## Email Testi

DNS ayarları yapıldıktan sonra:

1. Admin panele giriş yapın
2. Contacts sekmesinden bir test email gönderin
3. Email'in spam olarak işaretlenip işaretlenmediğini kontrol edin

## Sorun Giderme

### Email gönderilmiyor
```bash
# Mail sunucu loglarını kontrol et
docker-compose logs mailserver

# Backend loglarını kontrol et
docker-compose logs backend1 backend2
```

### Email spam olarak işaretleniyor
- SPF kaydının doğru olduğundan emin olun
- PTR kaydının yapılandırıldığından emin olun
- IP'nizin blacklist'te olmadığını kontrol edin: https://mxtoolbox.com/blacklists.aspx

### Port 25 engellenmiş
Bazı hosting sağlayıcıları port 25'i engeller. Docker-compose'da port 25 yerine port 587 kullanılıyor, bu sorun olmamalı.

## İletişim

Sorun yaşarsanız hosting sağlayıcınıza şu bilgileri vererek destek alabilirsiniz:
- "SMTP sunucusu kurdum, PTR kaydı eklemek istiyorum"
- "IP: YOUR_SERVER_IP için PTR kaydı mail.ertugrulozer.com.tr olmalı"
