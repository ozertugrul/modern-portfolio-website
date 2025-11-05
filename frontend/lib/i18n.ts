export type Locale = 'tr' | 'en';

export const defaultLocale: Locale = 'tr';
export const locales: Locale[] = ['tr', 'en'];

export const translations = {
  tr: {
    // Navigation
    nav: {
      home: 'Ana Sayfa',
      portfolio: 'Portfolyo',
      about: 'Hakkımda',
      resume: 'Özgeçmiş',
      contact: 'İletişim',
      admin: 'Admin',
    },
    // Home page
    home: {
      title: 'Merhaba, Ben',
      subtitle: 'Rust Backend Developer - Yüksek Performanslı Sistemler Geliştiriyorum',
      viewPortfolio: 'Portfolyomu İncele',
      contactMe: 'İletişime Geç',
      features: {
        performance: {
          title: 'Yüksek Performans',
          description: 'Rust ile geliştirilmiş, hızlı ve verimli backend sistemleri',
        },
        scalable: {
          title: 'Yatay ölçeklenebilir',
          description: 'Load balancer ve mikroservis mimarisi ile ölçeklenebilir çözümler',
        },
        secure: {
          title: 'Güvenli',
          description: 'Modern güvenlik standartları ile korumalı sistemler',
        },
      },
    },
    // Portfolio
    portfolio: {
      title: 'Portfolyo',
      viewGithub: 'GitHub →',
      viewDemo: 'Canlı Demo →',
    },
    // About
    about: {
      title: 'Hakkımda',
      skills: 'Yetenekler',
      contact: 'İletişim',
    },
    // Resume
    resume: {
      title: 'Özgeçmiş',
      experience: 'Deneyim',
      education: 'Eğitim',
      languages: 'Diller',
      certifications: 'Sertifikalar',
      ongoing: 'Devam ediyor',
    },
    // Contact
    contact: {
      title: 'İletişim',
      name: 'Adınız',
      email: 'E-posta',
      message: 'Mesajınız',
      send: 'Gönder',
      success: '✓ Mesajınız başarıyla gönderildi!',
      namePlaceholder: 'Adınız',
      emailPlaceholder: 'E-posta',
      messagePlaceholder: 'Mesajınız',
    },
    // Footer
    footer: {
      text: '© 2025 Ertu. Rust ile geliştirildi.',
    },
    // Admin
    admin: {
      login: 'Admin Girişi',
      password: 'Şifre',
      loginButton: 'Giriş Yap',
      logout: 'Çıkış Yap',
      passwordError: 'Şifre hatalı!',
      loginError: 'Giriş hatası!',
      tabs: {
        portfolio: 'Portfolyo',
        about: 'Hakkımda',
        resume: 'Özgeçmiş',
        contacts: 'İletişim',
        password: 'Şifre',
        translations: 'Çeviriler',
        footer: 'Footer',
        features: 'Özellikler',
      },
      portfolio: {
        title: 'Portfolyo Yönetimi',
        addProject: 'Yeni Proje Ekle',
        edit: 'Düzenle',
        delete: 'Sil',
        deleteConfirm: 'Bu projeyi silmek istediğinizden emin misiniz?',
        saveError: 'Kaydetme hatası!',
        deleteError: 'Silme hatası!',
        projectEditor: {
          title: 'Proje Düzenle',
          titlePlaceholder: 'Başlık',
          descriptionPlaceholder: 'Açıklama',
          technologiesPlaceholder: 'Teknolojiler (virgülle ayırın)',
          imageUrlPlaceholder: 'Görsel URL',
          githubUrlPlaceholder: 'GitHub URL',
          liveUrlPlaceholder: 'Canlı Demo URL',
          save: 'Kaydet',
          cancel: 'İptal',
        },
      },
      about: {
        title: 'Hakkımda Düzenle',
        name: 'İsim',
        titleField: 'Unvan',
        bio: 'Biyografi',
        email: 'E-posta',
        skills: 'Yetenekler (virgülle ayırın)',
        save: 'Kaydet',
        saveError: 'Kaydetme hatası!',
        saveSuccess: 'Başarıyla kaydedildi!',
      },
      resume: {
        title: 'Özgeçmiş Düzenle',
        personalInfo: 'Kişisel Bilgiler',
        name: 'İsim',
        jobTitle: 'Unvan',
        email: 'E-posta',
        phone: 'Telefon',
        languages: 'Diller (virgülle ayırın)',
        save: 'Kaydet',
        saveError: 'Kaydetme hatası!',
        saveSuccess: 'Başarıyla kaydedildi!',
      },
      contacts: {
        title: 'İletişim Mesajları',
        noMessages: 'Henüz mesaj yok',
      },
      footer: {
        title: 'Footer Yönetimi',
        textTr: 'Footer Metni (Türkçe)',
        textEn: 'Footer Metni (İngilizce)',
        save: 'Kaydet',
        saveSuccess: 'Footer başarıyla güncellendi!',
        saveError: 'Footer güncelleme hatası!',
      },
      features: {
        title: 'Özellikler Yönetimi',
        performanceTitle: 'Yüksek Performans - Başlık',
        performanceDesc: 'Yüksek Performans - Açıklama',
        scalableTitle: 'Yatay Ölçeklenebilir - Başlık',
        scalableDesc: 'Yatay Ölçeklenebilir - Açıklama',
        secureTitle: 'Güvenli - Başlık',
        secureDesc: 'Güvenli - Açıklama',
        turkish: 'Türkçe',
        english: 'İngilizce',
        save: 'Kaydet',
        saveSuccess: 'Özellikler başarıyla güncellendi!',
        saveError: 'Özellikler güncelleme hatası!',
      },
    },
  },
  en: {
    // Navigation
    nav: {
      home: 'Home',
      portfolio: 'Portfolio',
      about: 'About',
      resume: 'Resume',
      contact: 'Contact',
      admin: 'Admin',
    },
    // Home page
    home: {
      title: 'Hello, I\'m',
      subtitle: 'Rust Backend Developer - Building High-Performance Systems',
      viewPortfolio: 'View My Portfolio',
      contactMe: 'Contact Me',
      features: {
        performance: {
          title: 'High Performance',
          description: 'Fast and efficient backend systems built with Rust',
        },
        scalable: {
          title: 'Horizontally Scalable',
          description: 'Scalable solutions with load balancer and microservices architecture',
        },
        secure: {
          title: 'Secure',
          description: 'Protected systems with modern security standards',
        },
      },
    },
    // Portfolio
    portfolio: {
      title: 'Portfolio',
      viewGithub: 'GitHub →',
      viewDemo: 'Live Demo →',
    },
    // About
    about: {
      title: 'About',
      skills: 'Skills',
      contact: 'Contact',
    },
    // Resume
    resume: {
      title: 'Resume',
      experience: 'Experience',
      education: 'Education',
      languages: 'Languages',
      certifications: 'Certifications',
      ongoing: 'Ongoing',
    },
    // Contact
    contact: {
      title: 'Contact',
      name: 'Your Name',
      email: 'Email',
      message: 'Your Message',
      send: 'Send',
      success: '✓ Your message has been sent successfully!',
      namePlaceholder: 'Your Name',
      emailPlaceholder: 'Email',
      messagePlaceholder: 'Your Message',
    },
    // Footer
    footer: {
      text: '© 2025 Ertu. Built with Rust.',
    },
    // Admin
    admin: {
      login: 'Admin Login',
      password: 'Password',
      loginButton: 'Login',
      logout: 'Logout',
      passwordError: 'Incorrect password!',
      loginError: 'Login error!',
      tabs: {
        portfolio: 'Portfolio',
        about: 'About',
        resume: 'Resume',
        contacts: 'Contacts',
        password: 'Password',
        translations: 'Translations',
        footer: 'Footer',
        features: 'Features',
      },
      portfolio: {
        title: 'Portfolio Management',
        addProject: 'Add New Project',
        edit: 'Edit',
        delete: 'Delete',
        deleteConfirm: 'Are you sure you want to delete this project?',
        saveError: 'Save error!',
        deleteError: 'Delete error!',
        projectEditor: {
          title: 'Edit Project',
          titlePlaceholder: 'Title',
          descriptionPlaceholder: 'Description',
          technologiesPlaceholder: 'Technologies (comma separated)',
          imageUrlPlaceholder: 'Image URL',
          githubUrlPlaceholder: 'GitHub URL',
          liveUrlPlaceholder: 'Live Demo URL',
          save: 'Save',
          cancel: 'Cancel',
        },
      },
      about: {
        title: 'Edit About',
        name: 'Name',
        titleField: 'Title',
        bio: 'Biography',
        email: 'Email',
        skills: 'Skills (comma separated)',
        save: 'Save',
        saveError: 'Save error!',
        saveSuccess: 'Saved successfully!',
      },
      resume: {
        title: 'Edit Resume',
        personalInfo: 'Personal Information',
        name: 'Name',
        jobTitle: 'Title',
        email: 'Email',
        phone: 'Phone',
        languages: 'Languages (comma separated)',
        save: 'Save',
        saveError: 'Save error!',
        saveSuccess: 'Saved successfully!',
      },
      contacts: {
        title: 'Contact Messages',
        noMessages: 'No messages yet',
      },
      footer: {
        title: 'Footer Management',
        textTr: 'Footer Text (Turkish)',
        textEn: 'Footer Text (English)',
        save: 'Save',
        saveSuccess: 'Footer updated successfully!',
        saveError: 'Footer update error!',
      },
      features: {
        title: 'Features Management',
        performanceTitle: 'High Performance - Title',
        performanceDesc: 'High Performance - Description',
        scalableTitle: 'Scalable - Title',
        scalableDesc: 'Scalable - Description',
        secureTitle: 'Secure - Title',
        secureDesc: 'Secure - Description',
        turkish: 'Turkish',
        english: 'English',
        save: 'Save',
        saveSuccess: 'Features updated successfully!',
        saveError: 'Features update error!',
      },
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale];
}
