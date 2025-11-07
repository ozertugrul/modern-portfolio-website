# Gmail'den Admin Paneline Email Yönlendirme Rehberi

## Durum
✅ SMTP ile email gönderme çalışıyor (info@ertugrulozer.com.tr adresinden)
⏳ Gmail'e gelen emailleri admin panelde görmek için kurulum gerekli

## Çözüm Seçenekleri

### Seçenek 1: Gmail Filters + Google Apps Script (ÖNERİLEN)

Gmail'e gelen emailleri otomatik olarak sitenizin contact API'sine yönlendirebilirsiniz.

#### Adımlar:

1. **Google Apps Script Oluştur:**
   - Gmail hesabınıza gidin
   - Google Apps Script'e gidin: https://script.google.com
   - Yeni proje oluşturun
   - Aşağıdaki kodu yapıştırın:

```javascript
function forwardEmailsToWebsite() {
  var label = GmailApp.getUserLabelByName("ToWebsite") || GmailApp.createLabel("ToWebsite");
  var threads = GmailApp.search("to:info@ertugrulozer.com.tr -label:ToWebsite");
  
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      
      // API'ye gönder
      var payload = {
        name: message.getFrom(),
        email: message.getFrom().match(/[\w.-]+@[\w.-]+/)[0],
        message: "Subject: " + message.getSubject() + "\n\n" + message.getPlainBody()
      };
      
      var options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      try {
        UrlFetchApp.fetch('https://culture-angels-low-combined.trycloudflare.com/api/contact', options);
      } catch (e) {
        Logger.log('Error: ' + e);
      }
    }
    
    threads[i].addLabel(label);
  }
}

// Her 5 dakikada bir çalıştır
function setupTrigger() {
  ScriptApp.newTrigger('forwardEmailsToWebsite')
    .timeBased()
    .everyMinutes(5)
    .create();
}
```

2. **Trigger Kur:**
   - Yukarıdaki `setupTrigger()` fonksiyonunu bir kez çalıştırın
   - Script'e Gmail erişim izni verin

3. **Test Et:**
   - info@ertugrulozer.com.tr adresine test maili gönderin
   - 5 dakika içinde admin panelde görünmeli

### Seçenek 2: Manuel Yönlendirme

Gmail'de manuel olarak filter oluşturup başka bir adrese yönlendirme yapabilirsiniz:

1. Gmail Settings > Filters and Blocked Addresses
2. "Create a new filter"
3. To: info@ertugrulozer.com.tr
4. Forward to: sitenizin contact formuna bağlı başka bir email

### Seçenek 3: IMAP (GELİŞTİRİLMEKTE)

IMAP desteği için async-std runtime gerekiyor. Şu anda tokio kullanıyoruz. 
Bu özellik ileride eklenebilir.

## Mevcut Durum

✅ Contact formundan gelen mesajlar admin panelde görünüyor
✅ Admin panelden email yanıtlama çalışıyor
✅ Gönderen: "Ertuğrul Özer <info@ertugrulozer.com.tr>" olarak gözüküyor
⏳ Gmail'e gelen emailler için yukarıdaki yöntemlerden birini uygulayın

## Test

Admin panel Contact sekmesinde mesajları görebilir ve "Yanıtla" butonu ile cevap verebilirsiniz.
