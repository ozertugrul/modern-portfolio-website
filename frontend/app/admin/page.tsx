'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image_url?: string;
  github_url?: string;
  live_url?: string;
  huggingface_url?: string;
  order?: number;
}

interface About {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  email: string;
  github?: string;
  linkedin?: string;
}

interface Resume {
  id: string;
  personal_info: PersonalInfo;
  section_order?: string[]; // Section sıralaması
  summary?: string;
  summary_enabled: boolean;
  skills: string[];
  skills_enabled: boolean;
  soft_skills: string[];
  soft_skills_enabled: boolean;
  education: Education[];
  education_enabled: boolean;
  experience: Experience[];
  experience_enabled: boolean;
  projects: ResumeProject[];
  projects_enabled: boolean;
  languages: string[];
  languages_enabled: boolean;
  certifications: Certification[];
  certifications_enabled: boolean;
  awards: Award[];
  awards_enabled: boolean;
  publications: Publication[];
  publications_enabled: boolean;
  volunteer: Volunteer[];
  volunteer_enabled: boolean;
  interests: string[];
  interests_enabled: boolean;
  references: Reference[];
  references_enabled: boolean;
}

interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  start_date: string;
  end_date?: string;
  gpa?: string;
  description?: string;
}

interface Experience {
  id: string;
  company: string;
  position: string;
  location?: string;
  start_date: string;
  end_date?: string;
  current: boolean;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface ResumeProject {
  id: string;
  name: string;
  description: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  technologies: string[];
  url?: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiry_date?: string;
  credential_id?: string;
  url?: string;
}

interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description?: string;
}

interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  authors: string[];
  url?: string;
  description?: string;
}

interface Volunteer {
  id: string;
  organization: string;
  role: string;
  start_date: string;
  end_date?: string;
  description: string;
}

interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  read: boolean;
}

export default function AdminPanel() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'portfolio' | 'about' | 'resume' | 'contacts' | 'password' | 'translations' | 'footer' | 'features' | 'logs' | 'backups'>('portfolio');
  
  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioItem | null>(null);
  
  // About state
  const [about, setAbout] = useState<About | null>(null);
  
  // Resume state
  const [resume, setResume] = useState<Resume | null>(null);
  
  // Contacts state
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);
  
  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Backups state
  const [backups, setBackups] = useState<any[]>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [editingBackup, setEditingBackup] = useState<string | null>(null);
  const [newBackupName, setNewBackupName] = useState('');
  
  // Footer state
  const [footer, setFooter] = useState<{ text_tr: string; text_en: string; enabled: boolean }>({ text_tr: '', text_en: '', enabled: true });
  
  // Features state
  const [featuresData, setFeaturesData] = useState<any>(null);
  
  // Hero state
  const [heroData, setHeroData] = useState<any>(null);
  
  // Password state
  const [passwordInfo, setPasswordInfo] = useState<any>(null);
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  
  // Translations state
  const [translations, setTranslations] = useState<any>(null);
  const [editingTranslations, setEditingTranslations] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/portfolio');
      if (res.ok) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    if (activeTab === 'portfolio') {
      const res = await fetch('/api/admin/portfolio');
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } else if (activeTab === 'about') {
      const res = await fetch('/api/about');
      if (res.ok) {
        const data = await res.json();
        setAbout(data);
      }
    } else if (activeTab === 'resume') {
      const res = await fetch('/api/admin/resume');
      if (res.ok) {
        const data = await res.json();
        // Ensure all new fields have defaults
        setResume({
          ...data,
          soft_skills: data.soft_skills || [],
          soft_skills_enabled: data.soft_skills_enabled !== undefined ? data.soft_skills_enabled : true,
          interests: data.interests || [],
          interests_enabled: data.interests_enabled !== undefined ? data.interests_enabled : true,
          references: data.references || [],
          references_enabled: data.references_enabled !== undefined ? data.references_enabled : false,
        });
      } else {
        // Create default resume if not exists
        const defaultResume = {
          id: 'default',
          personal_info: {
            name: 'Your Name',
            title: 'Your Title',
            email: 'your@email.com',
            phone: '',
            location: '',
            github: '',
            linkedin: ''
          },
          section_order: ['summary', 'skills', 'soft_skills', 'experience', 'education', 
            'projects', 'languages', 'interests', 'certifications', 'awards', 'publications', 'volunteer', 'references'],
          summary: '',
          summary_enabled: false,
          skills: [],
          skills_enabled: true,
          soft_skills: [],
          soft_skills_enabled: true,
          education: [],
          education_enabled: true,
          experience: [],
          experience_enabled: true,
          projects: [],
          projects_enabled: true,
          languages: [],
          languages_enabled: true,
          certifications: [],
          certifications_enabled: true,
          awards: [],
          awards_enabled: true,
          publications: [],
          publications_enabled: true,
          volunteer: [],
          volunteer_enabled: true,
          interests: [],
          interests_enabled: true,
          references: [],
          references_enabled: true
        };
        setResume(defaultResume);
      }
    } else if (activeTab === 'contacts') {
      const res = await fetch('/api/admin/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } else if (activeTab === 'logs') {
      setLogsLoading(true);
      try {
        const res = await fetch('/api/admin/logs');
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error('Logs fetch error:', error);
        setLogs([]);
      } finally {
        setLogsLoading(false);
      }
    } else if (activeTab === 'backups') {
      setBackupsLoading(true);
      try {
        const res = await fetch('/api/admin/backups');
        if (res.ok) {
          const data = await res.json();
          setBackups(data);
        } else {
          setBackups([]);
        }
      } catch (error) {
        console.error('Backup list error:', error);
        setBackups([]);
      } finally {
        setBackupsLoading(false);
      }
    } else if (activeTab === 'password') {
      const res = await fetch('/api/admin/password');
      if (res.ok) {
        const data = await res.json();
        setPasswordInfo(data);
      }
    } else if (activeTab === 'translations') {
      const res = await fetch('/api/admin/translations');
      if (res.ok) {
        const data = await res.json();
        setTranslations(data);
        // Eğer boşsa default translations'ı yükle
        if (!data.tr || Object.keys(data.tr).length === 0) {
          const defaultTranslations = await import('@/lib/i18n').then(m => m.translations);
          setEditingTranslations(defaultTranslations);
        } else {
          setEditingTranslations(data);
        }
      } else {
        // Backend'den yüklenemezse default translations'ı yükle
        import('@/lib/i18n').then(m => {
          setTranslations({ tr: m.translations.tr, en: m.translations.en });
          setEditingTranslations(m.translations);
        });
      }
    } else if (activeTab === 'footer') {
      const res = await fetch('/api/admin/footer');
      if (res.ok) {
        const data = await res.json();
        setFooter(data);
      }
    } else if (activeTab === 'features') {
      const resFeatures = await fetch('/api/admin/features');
      if (resFeatures.ok) {
        const data = await resFeatures.json();
        setFeaturesData(data);
      }
      
      const resHero = await fetch('/api/admin/hero');
      if (resHero.ok) {
        const data = await resHero.json();
        setHeroData(data);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        loadData();
      } else {
        alert(t.admin.passwordError);
      }
    } catch (error) {
      alert(t.admin.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
    router.push('/');
  };

  const handleSavePortfolio = async (item: PortfolioItem) => {
    try {
      const method = item.id && portfolio.some(p => p.id === item.id) ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/portfolio', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        setEditingPortfolio(null);
        loadData();
      }
    } catch (error) {
      alert(t.admin.portfolio.saveError);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!confirm(t.admin.portfolio.deleteConfirm)) return;
    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (error) {
      alert(t.admin.portfolio.deleteError);
    }
  };

  const handleSaveAbout = async () => {
    if (!about) return;
    try {
      // Clean up skills - remove empty lines before saving
      const cleanedAbout = {
        ...about,
        skills: about.skills.filter(s => s.trim() !== '')
      };
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedAbout),
      });
      if (res.ok) {
        setAbout(cleanedAbout); // Update state with cleaned data
        alert(t.admin.about.saveSuccess);
      }
    } catch (error) {
      alert(t.admin.about.saveError);
    }
  };

  const handleSaveResume = async () => {
    if (!resume) return;
    try {
      // Clean up data before saving - only remove truly empty entries
      const cleanedResume = {
        ...resume,
        languages: resume.languages.filter(l => l && l.trim() !== ''),
        soft_skills: (resume.soft_skills || []).filter(s => s && s.trim() !== ''),
        interests: (resume.interests || []).filter(i => i && i.trim() !== ''),
      };
      
      console.log('Saving resume:', cleanedResume);
      
      const res = await fetch('/api/admin/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedResume),
      });
      if (res.ok) {
        alert(t.admin.resume.saveSuccess);
        // Reload to reflect changes
        loadData();
      } else {
        const error = await res.text();
        alert('Kayıt hatası: ' + error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert(t.admin.resume.saveError);
    }
  };

  const handleSaveFooter = async () => {
    try {
      const res = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(footer),
      });
      if (res.ok) {
        alert(t.admin.footer.saveSuccess);
        loadData();
      } else {
        alert(t.admin.footer.saveError);
      }
    } catch (error) {
      alert(t.admin.footer.saveError);
    }
  };

  const handleSaveFeatures = async () => {
    try {
      // Save features
      const resFeatures = await fetch('/api/admin/features', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featuresData),
      });
      
      // Save hero
      const resHero = await fetch('/api/admin/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData),
      });
      
      if (resFeatures.ok && resHero.ok) {
        alert(t.admin.features.saveSuccess);
        loadData();
      } else {
        alert(t.admin.features.saveError);
      }
    } catch (error) {
      alert(t.admin.features.saveError);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="bg-white dark:bg-zinc-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>
          <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-100">{t.admin.login}</h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                {t.admin.password}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {t.admin.loginButton}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Admin Panel</h1>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t.admin.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto">
          {(['portfolio', 'about', 'resume', 'contacts', 'logs', 'backups', 'password', 'translations', 'footer', 'features'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {tab === 'password' ? 'Şifre' : 
               tab === 'translations' ? 'Çeviriler' :
               tab === 'footer' ? 'Footer' :
               tab === 'features' ? 'Özellikler' :
               tab === 'logs' ? '📊 Loglar' :
               tab === 'backups' ? '💾 Yedekler' :
               tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.portfolio.title}</h2>
              <button
                onClick={() => setEditingPortfolio({
                  id: '',
                  title: '',
                  description: '',
                  technologies: [],
                  image_url: '',
                  github_url: '',
                  live_url: '',
                  huggingface_url: '',
                  order: portfolio.length,
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.admin.portfolio.addProject}
              </button>
            </div>

            {editingPortfolio && (
              <PortfolioEditor
                item={editingPortfolio}
                onSave={handleSavePortfolio}
                onCancel={() => setEditingPortfolio(null)}
              />
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {portfolio.map((item, index) => (
                <div key={item.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 relative">
                  {/* Order Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={async () => {
                        if (index === 0) return;
                        const newPortfolio = [...portfolio];
                        [newPortfolio[index], newPortfolio[index - 1]] = [newPortfolio[index - 1], newPortfolio[index]];
                        
                        // Update order values
                        const updatedPortfolio = newPortfolio.map((item, idx) => ({
                          ...item,
                          order: idx
                        }));
                        
                        setPortfolio(updatedPortfolio);
                        
                        // Save to backend
                        try {
                          for (const item of updatedPortfolio) {
                            await fetch('/api/admin/portfolio', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(item)
                            });
                          }
                        } catch (error) {
                          console.error('Failed to update order:', error);
                        }
                      }}
                      disabled={index === 0}
                      className="w-7 h-7 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
                      title="Move Up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={async () => {
                        if (index === portfolio.length - 1) return;
                        const newPortfolio = [...portfolio];
                        [newPortfolio[index], newPortfolio[index + 1]] = [newPortfolio[index + 1], newPortfolio[index]];
                        
                        // Update order values
                        const updatedPortfolio = newPortfolio.map((item, idx) => ({
                          ...item,
                          order: idx
                        }));
                        
                        setPortfolio(updatedPortfolio);
                        
                        // Save to backend
                        try {
                          for (const item of updatedPortfolio) {
                            await fetch('/api/admin/portfolio', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(item)
                            });
                          }
                        } catch (error) {
                          console.error('Failed to update order:', error);
                        }
                      }}
                      disabled={index === portfolio.length - 1}
                      className="w-7 h-7 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold"
                      title="Move Down"
                    >
                      ↓
                    </button>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 text-zinc-900 dark:text-zinc-100 line-clamp-1 pr-20">{item.title}</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4 max-h-20 overflow-y-auto">
                    {item.technologies.map((tech) => (
                      <span key={tech} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded whitespace-nowrap">
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setEditingPortfolio(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      {t.admin.portfolio.edit}
                    </button>
                    <button
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      {t.admin.portfolio.delete}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && about && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.about.title}</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">{t.admin.about.name}</label>
                <input
                  type="text"
                  value={about.name}
                  onChange={(e) => setAbout({ ...about, name: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">{t.admin.about.titleField}</label>
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => setAbout({ ...about, title: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">{t.admin.about.bio}</label>
                <textarea
                  value={about.bio}
                  onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">{t.admin.about.email}</label>
                <input
                  type="email"
                  value={about.email}
                  onChange={(e) => setAbout({ ...about, email: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">{t.admin.about.skills}</label>
                <textarea
                  value={about.skills.join('\n')}
                  onChange={(e) => {
                    const skills = e.target.value.split('\n').map(s => s.trim());
                    setAbout({ ...about, skills });
                  }}
                  rows={4}
                  placeholder="Rust
Backend Development
Docker
Redis"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
                />
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Her satıra bir yetenek yazın (Enter ile yeni satır)</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">GitHub URL</label>
                <input
                  type="url"
                  value={about.github || ''}
                  onChange={(e) => setAbout({ ...about, github: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">LinkedIn URL</label>
                <input
                  type="url"
                  value={about.linkedin || ''}
                  onChange={(e) => setAbout({ ...about, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                onClick={handleSaveAbout}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.admin.about.save}
              </button>
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && resume && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.resume.title}</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-6">
              <ResumeEditor resume={resume} onChange={setResume} />
              <button
                onClick={handleSaveResume}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.admin.resume.save}
              </button>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.contacts.title}</h2>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                {contacts.filter(c => !c.read).length} okunmamış mesaj
              </div>
            </div>
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    contact.read 
                      ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm'
                  }`}
                  onClick={async () => {
                    setSelectedContact(contact);
                    if (!contact.read) {
                      try {
                        await fetch(`/api/admin/contacts/read?id=${contact.id}`, { method: 'PUT' });
                        loadData();
                      } catch (error) {
                        console.error('Mark as read error:', error);
                      }
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-3 flex-1">
                      {!contact.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${contact.read ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-900 dark:text-blue-100'}`}>
                            {contact.name}
                          </h3>
                          {!contact.read && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                              YENİ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">📧 {contact.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date(contact.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${contact.read ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-100'} mt-2 line-clamp-2`}>
                    {contact.message}
                  </p>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-zinc-600 dark:text-zinc-400">{t.admin.contacts.noMessages}</p>
                </div>
              )}
            </div>

            {/* Message Detail Modal */}
            {selectedContact && (
              <div 
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedContact(null)}
              >
                <div 
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                          {selectedContact.name}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">📧 {selectedContact.email}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {new Date(selectedContact.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedContact(null)}
                        className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-2xl leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        {selectedContact.message}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                    <button
                      onClick={async () => {
                        if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
                          try {
                            await fetch(`/api/admin/contacts/delete?id=${selectedContact.id}`, { method: 'DELETE' });
                            setSelectedContact(null);
                            loadData();
                          } catch (error) {
                            console.error('Delete error:', error);
                            alert('Silme hatası!');
                          }
                        }
                      }}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      🗑️ Sil
                    </button>
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Şifre Yönetimi</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
              {passwordInfo && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {passwordInfo.message || 'Şifre tanımlı. Değiştirmek için aşağıdaki formu kullanın.'}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
              <button
                onClick={async () => {
                  if (passwordForm.new_password !== passwordForm.confirm_password) {
                    alert('Yeni şifreler eşleşmiyor!');
                    return;
                  }
                  if (passwordForm.new_password.length < 6) {
                    alert('Şifre en az 6 karakter olmalıdır!');
                    return;
                  }
                  try {
                    const res = await fetch('/api/admin/password', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        old_password: passwordForm.old_password,
                        new_password: passwordForm.new_password,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      alert('Şifre başarıyla değiştirildi!');
                      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
                      loadData();
                    } else {
                      alert(data.message || 'Şifre değiştirme hatası!');
                    }
                  } catch (error) {
                    alert('Şifre değiştirme hatası!');
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Şifreyi Değiştir
              </button>
            </div>
          </div>
        )}

        {/* Translations Tab */}
        {activeTab === 'translations' && editingTranslations && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Çeviriler Yönetimi</h2>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/admin/translations', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(editingTranslations),
                    });
                    if (res.ok) {
                      alert('Çeviriler başarıyla kaydedildi!');
                      loadData();
                    }
                  } catch (error) {
                    alert('Kaydetme hatası!');
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Kaydet
              </button>
            </div>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Türkçe (TR)</h3>
                  <TranslationEditor
                    data={editingTranslations.tr || {}}
                    onChange={(data) => setEditingTranslations({ ...editingTranslations, tr: data })}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">İngilizce (EN)</h3>
                  <TranslationEditor
                    data={editingTranslations.en || {}}
                    onChange={(data) => setEditingTranslations({ ...editingTranslations, en: data })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.footer.title}</h2>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-4">
                  <input 
                    type="checkbox" 
                    checked={footer.enabled ?? true}
                    onChange={(e) => setFooter({...footer, enabled: e.target.checked})}
                    className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700"
                  />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Footer'ı Göster</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  {t.admin.footer.textTr}
                </label>
                <textarea
                  value={footer.text_tr}
                  onChange={(e) => setFooter({ ...footer, text_tr: e.target.value })}
                  rows={2}
                  placeholder="© 2025 Ertu. Rust ile geliştirildi."
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                  {t.admin.footer.textEn}
                </label>
                <textarea
                  value={footer.text_en}
                  onChange={(e) => setFooter({ ...footer, text_en: e.target.value })}
                  rows={2}
                  placeholder="© 2025 Ertu. Built with Rust."
                  className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <button
                onClick={handleSaveFooter}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {t.admin.footer.save}
              </button>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {!featuresData || !heroData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-zinc-600 dark:text-zinc-400">Yükleniyor...</p>
                </div>
              </div>
            ) : (
              <>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Ana Sayfa Yönetimi</h2>
            
            {/* Hero Section */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Hero Bölümü</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Karşılama (Türkçe)</label>
                  <input value={heroData.greeting_tr || ''} onChange={(e) => setHeroData({...heroData, greeting_tr: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Merhaba, Ben" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Greeting (English)</label>
                  <input value={heroData.greeting_en || ''} onChange={(e) => setHeroData({...heroData, greeting_en: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Hello, I'm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">İsim / Name</label>
                <input value={heroData.name || ''} onChange={(e) => setHeroData({...heroData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Ertu" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Başlık (Türkçe)</label>
                  <textarea value={heroData.title_tr || ''} onChange={(e) => setHeroData({...heroData, title_tr: e.target.value})} rows={2} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Rust Backend Developer..." />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">Title (English)</label>
                  <textarea value={heroData.title_en || ''} onChange={(e) => setHeroData({...heroData, title_en: e.target.value})} rows={2} className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100" placeholder="Rust Backend Developer..." />
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Özellikler Bölümü</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">Türkçe</h4>
                  <div>
                    <label className="block text-sm mb-1">⚡ Performans - Başlık</label>
                    <input value={featuresData.performance_tr?.title || ''} onChange={(e) => setFeaturesData({...featuresData, performance_tr: {...featuresData.performance_tr, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">⚡ Performans - Açıklama</label>
                    <textarea value={featuresData.performance_tr?.description || ''} onChange={(e) => setFeaturesData({...featuresData, performance_tr: {...featuresData.performance_tr, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🚀 Ölçeklenebilir - Başlık</label>
                    <input value={featuresData.scalable_tr?.title || ''} onChange={(e) => setFeaturesData({...featuresData, scalable_tr: {...featuresData.scalable_tr, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🚀 Ölçeklenebilir - Açıklama</label>
                    <textarea value={featuresData.scalable_tr?.description || ''} onChange={(e) => setFeaturesData({...featuresData, scalable_tr: {...featuresData.scalable_tr, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🔒 Güvenli - Başlık</label>
                    <input value={featuresData.secure_tr?.title || ''} onChange={(e) => setFeaturesData({...featuresData, secure_tr: {...featuresData.secure_tr, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🔒 Güvenli - Açıklama</label>
                    <textarea value={featuresData.secure_tr?.description || ''} onChange={(e) => setFeaturesData({...featuresData, secure_tr: {...featuresData.secure_tr, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-zinc-900 dark:text-zinc-100">English</h4>
                  <div>
                    <label className="block text-sm mb-1">⚡ Performance - Title</label>
                    <input value={featuresData.performance_en?.title || ''} onChange={(e) => setFeaturesData({...featuresData, performance_en: {...featuresData.performance_en, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">⚡ Performance - Description</label>
                    <textarea value={featuresData.performance_en?.description || ''} onChange={(e) => setFeaturesData({...featuresData, performance_en: {...featuresData.performance_en, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🚀 Scalable - Title</label>
                    <input value={featuresData.scalable_en?.title || ''} onChange={(e) => setFeaturesData({...featuresData, scalable_en: {...featuresData.scalable_en, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🚀 Scalable - Description</label>
                    <textarea value={featuresData.scalable_en?.description || ''} onChange={(e) => setFeaturesData({...featuresData, scalable_en: {...featuresData.scalable_en, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🔒 Secure - Title</label>
                    <input value={featuresData.secure_en?.title || ''} onChange={(e) => setFeaturesData({...featuresData, secure_en: {...featuresData.secure_en, title: e.target.value}})} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">🔒 Secure - Description</label>
                    <textarea value={featuresData.secure_en?.description || ''} onChange={(e) => setFeaturesData({...featuresData, secure_en: {...featuresData.secure_en, description: e.target.value}})} rows={2} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveFeatures} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Tümünü Kaydet
            </button>
            </>
            )}
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">📊 Ziyaretçi Logları</h2>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                🔄 Yenile
              </button>
            </div>
            
            {logsLoading ? (
              <p>Yükleniyor...</p>
            ) : logs.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">Henüz log kaydı yok.</p>
            ) : (
              <div className="bg-white dark:bg-zinc-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-zinc-100 dark:bg-zinc-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">IP</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Method</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Path</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">User Agent</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Zaman</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                    {logs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                        <td className="px-4 py-3 text-sm font-mono">{log.ip}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs ${
                            log.method === 'GET' ? 'bg-green-100 text-green-700' :
                            log.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono truncate max-w-xs">{log.path}</td>
                        <td className="px-4 py-3 text-sm truncate max-w-xs">{log.user_agent || '-'}</td>
                        <td className="px-4 py-3 text-sm">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">💾 Redis Yedekleri</h2>
              <div className="flex gap-3">
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700"
                >
                  🔄 Yenile
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Yeni yedek oluşturulsun mu?')) {
                      try {
                        const res = await fetch('/api/admin/backups', { method: 'POST' });
                        if (res.ok) {
                          alert('Yedek oluşturuldu!');
                          loadData();
                        } else {
                          alert('Hata: ' + (await res.text()));
                        }
                      } catch (error) {
                        alert('Yedekleme hatası!');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  ➕ Yeni Yedek Oluştur
                </button>
              </div>
            </div>
            
            {backupsLoading ? (
              <p>Yükleniyor...</p>
            ) : backups.length === 0 ? (
              <p className="text-zinc-600 dark:text-zinc-400">Henüz yedek bulunmuyor.</p>
            ) : (
              <div className="grid gap-4">
                {backups.map((backup, idx) => (
                  <div key={idx} className="bg-white dark:bg-zinc-800 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {editingBackup === backup.filename ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newBackupName}
                          onChange={(e) => setNewBackupName(e.target.value)}
                          placeholder="Yeni isim"
                          className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              try {
                                const res = await fetch('/api/admin/backups/rename', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ 
                                    old_filename: backup.filename,
                                    new_name: newBackupName 
                                  })
                                });
                                if (res.ok) {
                                  alert('Yedek yeniden adlandırıldı!');
                                  setEditingBackup(null);
                                  setNewBackupName('');
                                  loadData();
                                } else {
                                  alert('Hata: ' + (await res.text()));
                                }
                              } catch (error) {
                                alert('Yeniden adlandırma hatası!');
                              }
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            ✓ Kaydet
                          </button>
                          <button
                            onClick={() => {
                              setEditingBackup(null);
                              setNewBackupName('');
                            }}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            ✕ İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{backup.filename}</p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Boyut: {(backup.size / 1024).toFixed(2)} KB • 
                            Tarih: {new Date(backup.created_at).toLocaleString('tr-TR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingBackup(backup.filename);
                              setNewBackupName(backup.filename.replace('.json', ''));
                            }}
                            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                          >
                            ✏️ Yeniden Adlandır
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`${backup.filename} yedeğini geri yükle?  TÜM MEVCUT VERİLER SİLİNECEK!`)) {
                                try {
                                  const res = await fetch('/api/admin/backups/restore', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ filename: backup.filename })
                                  });
                                  if (res.ok) {
                                    alert('Yedek geri yüklendi! Sayfa yenileniyor...');
                                    window.location.reload();
                                  } else {
                                    alert('Hata: ' + (await res.text()));
                                  }
                                } catch (error) {
                                  alert('Geri yükleme hatası!');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            ↻ Geri Yükle
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`${backup.filename} silinsin mi?`)) {
                                try {
                                  const res = await fetch(`/api/admin/backups/${backup.filename}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    alert('Yedek silindi!');
                                    loadData();
                                  } else {
                                    alert('Hata: ' + (await res.text()));
                                  }
                                } catch (error) {
                                  alert('Silme hatası!');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            🗑️ Sil
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PortfolioEditor({ item, onSave, onCancel }: { item: PortfolioItem; onSave: (item: PortfolioItem) => void; onCancel: () => void }) {
  const { t } = useLocale();
  const [form, setForm] = useState(item);

  return (
    <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 space-y-4">
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t.admin.portfolio.projectEditor.title}</h3>
      <input
        type="text"
        placeholder={t.admin.portfolio.projectEditor.titlePlaceholder}
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <textarea
        placeholder={t.admin.portfolio.projectEditor.descriptionPlaceholder}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        rows={4}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <div>
        <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
          {t.admin.portfolio.projectEditor.technologiesPlaceholder}
        </label>
        <textarea
          placeholder="Rust
React
PostgreSQL"
          value={form.technologies.join('\n')}
          onChange={(e) => {
            const techs = e.target.value.split('\n').map(s => s.trim());
            setForm({ ...form, technologies: techs });
          }}
          rows={3}
          className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-mono"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Her satıra bir teknoloji yazın (Enter ile yeni satır)</p>
      </div>
      <input
        type="url"
        placeholder={t.admin.portfolio.projectEditor.imageUrlPlaceholder}
        value={form.image_url || ''}
        onChange={(e) => setForm({ ...form, image_url: e.target.value || undefined })}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <input
        type="url"
        placeholder={t.admin.portfolio.projectEditor.githubUrlPlaceholder}
        value={form.github_url || ''}
        onChange={(e) => setForm({ ...form, github_url: e.target.value || undefined })}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <input
        type="url"
        placeholder={t.admin.portfolio.projectEditor.liveUrlPlaceholder}
        value={form.live_url || ''}
        onChange={(e) => setForm({ ...form, live_url: e.target.value || undefined })}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <input
        type="url"
        placeholder="Hugging Face URL (optional)"
        value={form.huggingface_url || ''}
        onChange={(e) => setForm({ ...form, huggingface_url: e.target.value || undefined })}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
      />
      <div className="flex gap-2">
        <button
          onClick={() => {
            const cleanedForm = {
              ...form,
              technologies: form.technologies.filter(t => t.trim() !== '')
            };
            onSave(cleanedForm);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {t.admin.portfolio.projectEditor.save}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-zinc-600 text-white rounded-lg hover:bg-zinc-700"
        >
          {t.admin.portfolio.projectEditor.cancel}
        </button>
      </div>
    </div>
  );
}

function ResumeEditor({ resume, onChange }: { resume: Resume; onChange: (resume: Resume) => void }) {
  const { t } = useLocale();
  const [activeSection, setActiveSection] = useState('personal');
  
  // Default section order
  const defaultOrder = ['summary', 'skills', 'soft_skills', 'experience', 'education', 
    'projects', 'languages', 'interests', 'certifications', 'awards', 'publications', 'volunteer', 'references'];
  
  const sectionOrder = resume.section_order || defaultOrder;
  
  const allSections = [
    { id: 'summary', label: '📝 Özet', enabled: resume.summary_enabled },
    { id: 'skills', label: '🔧 Teknik Yetenekler', enabled: resume.skills_enabled },
    { id: 'soft_skills', label: '💡 Soft Skills', enabled: resume.soft_skills_enabled !== false },
    { id: 'experience', label: '💼 İş Deneyimi', enabled: resume.experience_enabled },
    { id: 'education', label: '🎓 Eğitim', enabled: resume.education_enabled },
    { id: 'projects', label: '📂 Projeler', enabled: resume.projects_enabled },
    { id: 'languages', label: '🌐 Diller', enabled: resume.languages_enabled },
    { id: 'interests', label: '🎯 İlgi Alanları', enabled: resume.interests_enabled !== false },
    { id: 'certifications', label: '📜 Sertifikalar', enabled: resume.certifications_enabled },
    { id: 'awards', label: '🏆 Ödüller', enabled: resume.awards_enabled },
    { id: 'publications', label: '📚 Yayınlar', enabled: resume.publications_enabled },
    { id: 'volunteer', label: '🤝 Gönüllülük', enabled: resume.volunteer_enabled },
    { id: 'references', label: '📞 Referanslar', enabled: resume.references_enabled !== undefined ? resume.references_enabled : false },
  ];
  
  // Sort sections by order
  const sections = sectionOrder
    .map(id => allSections.find(s => s.id === id))
    .filter(Boolean) as typeof allSections;
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    onChange({ ...resume, section_order: newOrder });
  };

  return (
    <div className="space-y-6">
      {/* Section Tabs with Reorder Buttons */}
      <div className="space-y-2">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Bölümlerin sırasını değiştirmek için ↑ ↓ butonlarını kullanın</p>
        <div className="flex flex-wrap gap-2 border-b border-zinc-300 dark:border-zinc-700 pb-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center gap-1">
              {/* Up/Down buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  className="px-1 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Yukarı taşı"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  className="px-1 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Aşağı taşı"
                >
                  ↓
                </button>
              </div>
              
              {/* Section button */}
              <button
                onClick={() => setActiveSection(section.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {section.label}
                {section.id !== 'personal' && (
                  <span className={`ml-2 text-xs ${section.enabled ? '✓' : '✗'}`}>
                    {section.enabled ? '✓' : '✗'}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Personal Info */}
      {activeSection === 'personal' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">👤 Kişisel Bilgiler</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ad Soyad"
              value={resume.personal_info.name}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, name: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="Ünvan (örn: Senior Developer)"
              value={resume.personal_info.title}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, title: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="email"
              placeholder="Email"
              value={resume.personal_info.email}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, email: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="Telefon"
              value={resume.personal_info.phone || ''}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, phone: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="Konum (örn: Istanbul, Turkey)"
              value={resume.personal_info.location || ''}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, location: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="url"
              placeholder="Website"
              value={resume.personal_info.website || ''}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, website: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="url"
              placeholder="GitHub URL"
              value={resume.personal_info.github || ''}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, github: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={resume.personal_info.linkedin || ''}
              onChange={(e) => onChange({ ...resume, personal_info: { ...resume.personal_info, linkedin: e.target.value } })}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
            />
          </div>
        </div>
      )}

      {/* Summary */}
      {activeSection === 'summary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">📝 Özet / Summary</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.summary_enabled}
                onChange={(e) => onChange({ ...resume, summary_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          <textarea
            placeholder="Profesyonel özet yazın (2-3 cümle)..."
            value={resume.summary || ''}
            onChange={(e) => onChange({ ...resume, summary: e.target.value })}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
          />
        </div>
      )}

      {/* Skills */}
      {activeSection === 'skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🔧 Teknik Yetenekler</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.skills_enabled}
                onChange={(e) => onChange({ ...resume, skills_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          <textarea
            placeholder="React
Node.js
TypeScript
Docker"
            value={resume.skills.join('\n')}
            onChange={(e) => onChange({ ...resume, skills: e.target.value.split('\n').filter(s => s.trim()) })}
            rows={6}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 font-mono"
          />
          <p className="text-xs text-zinc-500">Her satıra bir yetenek</p>
        </div>
      )}

      {/* Soft Skills */}
      {activeSection === 'soft_skills' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">💡 Soft Skills</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.soft_skills_enabled !== false}
                onChange={(e) => onChange({ ...resume, soft_skills_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          <textarea
            placeholder="Leadership
Communication
Problem Solving
Teamwork"
            value={(resume.soft_skills || []).join('\n')}
            onChange={(e) => onChange({ ...resume, soft_skills: e.target.value.split('\n') })}
            rows={6}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 font-mono"
          />
          <p className="text-xs text-zinc-500">Her satıra bir soft skill</p>
        </div>
      )}

      {/* Languages */}
      {activeSection === 'languages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🌐 Diller</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.languages_enabled}
                onChange={(e) => onChange({ ...resume, languages_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          <textarea
            placeholder="Turkish (Native)
English (Fluent)
German (Intermediate)"
            value={resume.languages.join('\n')}
            onChange={(e) => onChange({ ...resume, languages: e.target.value.split('\n') })}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 font-mono"
          />
          <p className="text-xs text-zinc-500">Her satıra bir dil</p>
        </div>
      )}

      {/* Interests */}
      {activeSection === 'interests' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🎯 İlgi Alanları</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.interests_enabled !== false}
                onChange={(e) => onChange({ ...resume, interests_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          <textarea
            placeholder="Open Source Contribution
Tech Blogging
Photography
Hiking"
            value={(resume.interests || []).join('\n')}
            onChange={(e) => onChange({ ...resume, interests: e.target.value.split('\n') })}
            rows={4}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 font-mono"
          />
          <p className="text-xs text-zinc-500">Her satıra bir ilgi alanı</p>
        </div>
      )}

      {/* References - Basic for now */}
      {activeSection === 'references' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">📞 Referanslar</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.references_enabled === true}
                onChange={(e) => onChange({ ...resume, references_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => onChange({ ...resume, references: [...(resume.references || []), {
              id: Date.now().toString(), name: '', title: '', company: '',
              email: '', phone: '', relationship: ''
            }]})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Referans Ekle
          </button>

          {(resume.references || []).map((ref, idx) => (
            <div key={ref.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Ad Soyad" value={ref.name} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], name: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Ünvan" value={ref.title} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], title: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Şirket" value={ref.company} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], company: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="İlişki (örn: Eski Müdür)" value={ref.relationship || ''} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], relationship: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="email" placeholder="Email" value={ref.email || ''} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], email: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="tel" placeholder="Telefon" value={ref.phone || ''} onChange={(e) => {
                  const u = [...(resume.references || [])]; u[idx] = {...u[idx], phone: e.target.value}; onChange({...resume, references: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              </div>
              <button onClick={() => onChange({...resume, references: (resume.references || []).filter((_, i) => i !== idx)})}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">🗑️ Sil</button>
            </div>
          ))}
          {(resume.references || []).length === 0 && <p className="text-center text-zinc-500 py-4">Henüz referans eklenmedi</p>}
        </div>
      )}

      {/* Experience */}
      {activeSection === 'experience' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">💼 İş Deneyimi</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.experience_enabled}
                onChange={(e) => onChange({ ...resume, experience_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => onChange({ ...resume, experience: [...resume.experience, {
              id: Date.now().toString(), company: '', position: '', location: '',
              start_date: new Date().toISOString().split('T')[0], end_date: '', current: false,
              description: '', achievements: [], technologies: []
            }]})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Deneyim Ekle
          </button>

          {resume.experience.map((exp, idx) => (
            <div key={exp.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Şirket" value={exp.company} onChange={(e) => {
                  const u = [...resume.experience]; u[idx] = {...u[idx], company: e.target.value}; onChange({...resume, experience: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Pozisyon" value={exp.position} onChange={(e) => {
                  const u = [...resume.experience]; u[idx] = {...u[idx], position: e.target.value}; onChange({...resume, experience: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" value={exp.start_date} onChange={(e) => {
                  const u = [...resume.experience]; u[idx] = {...u[idx], start_date: e.target.value}; onChange({...resume, experience: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" value={exp.end_date || ''} onChange={(e) => {
                  const u = [...resume.experience]; u[idx] = {...u[idx], end_date: e.target.value}; onChange({...resume, experience: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              </div>
              <textarea placeholder="Açıklama" value={exp.description} rows={3} onChange={(e) => {
                const u = [...resume.experience]; u[idx] = {...u[idx], description: e.target.value}; onChange({...resume, experience: u});
              }} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              <textarea placeholder="Teknolojiler (her satırda bir tane)" value={exp.technologies.join('\n')} rows={2} onChange={(e) => {
                const u = [...resume.experience]; u[idx] = {...u[idx], technologies: e.target.value.split('\n').filter(t => t.trim())}; onChange({...resume, experience: u});
              }} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 font-mono" />
              <button onClick={() => onChange({...resume, experience: resume.experience.filter((_, i) => i !== idx)})}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">🗑️ Sil</button>
            </div>
          ))}
          {resume.experience.length === 0 && <p className="text-center text-zinc-500 py-4">Henüz deneyim eklenmedi</p>}
        </div>
      )}

      {/* Education */}
      {activeSection === 'education' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🎓 Eğitim</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.education_enabled}
                onChange={(e) => onChange({ ...resume, education_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => onChange({ ...resume, education: [...resume.education, {
              id: Date.now().toString(), institution: '', degree: '', field: '',
              start_date: new Date().toISOString().split('T')[0], end_date: '', gpa: '', description: ''
            }]})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Eğitim Ekle
          </button>

          {resume.education.map((edu, idx) => (
            <div key={edu.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Kurum" value={edu.institution} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], institution: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Derece (Lisans, Yüksek Lisans...)" value={edu.degree} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], degree: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Alan/Bölüm" value={edu.field || ''} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], field: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="GPA (opsiyonel)" value={edu.gpa || ''} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], gpa: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" value={edu.start_date} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], start_date: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" value={edu.end_date || ''} onChange={(e) => {
                  const u = [...resume.education]; u[idx] = {...u[idx], end_date: e.target.value}; onChange({...resume, education: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              </div>
              <button onClick={() => onChange({...resume, education: resume.education.filter((_, i) => i !== idx)})}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">🗑️ Sil</button>
            </div>
          ))}
          {resume.education.length === 0 && <p className="text-center text-zinc-500 py-4">Henüz eğitim eklenmedi</p>}
        </div>
      )}

      {/* Projects */}
      {activeSection === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">📂 Projeler</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.projects_enabled}
                onChange={(e) => onChange({ ...resume, projects_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => onChange({ ...resume, projects: [...resume.projects, {
              id: Date.now().toString(), name: '', description: '', role: '',
              start_date: '', end_date: '', technologies: [], url: ''
            }]})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Proje Ekle
          </button>

          {resume.projects.map((proj, idx) => (
            <div key={proj.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Proje Adı" value={proj.name} onChange={(e) => {
                  const u = [...resume.projects]; u[idx] = {...u[idx], name: e.target.value}; onChange({...resume, projects: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="URL" value={proj.url || ''} onChange={(e) => {
                  const u = [...resume.projects]; u[idx] = {...u[idx], url: e.target.value}; onChange({...resume, projects: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              </div>
              <textarea placeholder="Açıklama" value={proj.description} rows={2} onChange={(e) => {
                const u = [...resume.projects]; u[idx] = {...u[idx], description: e.target.value}; onChange({...resume, projects: u});
              }} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              <textarea placeholder="Teknolojiler (her satırda bir tane)" value={proj.technologies.join('\n')} rows={2} onChange={(e) => {
                const u = [...resume.projects]; u[idx] = {...u[idx], technologies: e.target.value.split('\n').filter(t => t.trim())}; onChange({...resume, projects: u});
              }} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900 font-mono" />
              <button onClick={() => onChange({...resume, projects: resume.projects.filter((_, i) => i !== idx)})}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">🗑️ Sil</button>
            </div>
          ))}
          {resume.projects.length === 0 && <p className="text-center text-zinc-500 py-4">Henüz proje eklenmedi</p>}
        </div>
      )}

      {/* Certifications */}
      {activeSection === 'certifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">📜 Sertifikalar</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.certifications_enabled}
                onChange={(e) => onChange({ ...resume, certifications_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              const newCert = {
                id: Date.now().toString(),
                name: '',
                issuer: '',
                date: new Date().toISOString().split('T')[0],
                url: ''
              };
              onChange({ ...resume, certifications: [...resume.certifications, newCert] });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Sertifika Ekle
          </button>

          <div className="space-y-4">
            {resume.certifications.map((cert, idx) => (
              <div key={cert.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Sertifika Adı"
                    value={cert.name}
                    onChange={(e) => {
                      const updated = [...resume.certifications];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      onChange({ ...resume, certifications: updated });
                    }}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="text"
                    placeholder="Veren Kurum"
                    value={cert.issuer}
                    onChange={(e) => {
                      const updated = [...resume.certifications];
                      updated[idx] = { ...updated[idx], issuer: e.target.value };
                      onChange({ ...resume, certifications: updated });
                    }}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="date"
                    value={cert.date}
                    onChange={(e) => {
                      const updated = [...resume.certifications];
                      updated[idx] = { ...updated[idx], date: e.target.value };
                      onChange({ ...resume, certifications: updated });
                    }}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="url"
                    placeholder="URL (opsiyonel)"
                    value={cert.url || ''}
                    onChange={(e) => {
                      const updated = [...resume.certifications];
                      updated[idx] = { ...updated[idx], url: e.target.value };
                      onChange({ ...resume, certifications: updated });
                    }}
                    className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
                  />
                </div>
                <button
                  onClick={() => {
                    const updated = resume.certifications.filter((_, i) => i !== idx);
                    onChange({ ...resume, certifications: updated });
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>

          {resume.certifications.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Henüz sertifika eklenmedi</p>
          )}
        </div>
      )}

      {/* Awards */}
      {activeSection === 'awards' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🏆 Ödüller</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.awards_enabled}
                onChange={(e) => onChange({ ...resume, awards_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              const newAward = {
                id: Date.now().toString(),
                title: '',
                issuer: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
              };
              onChange({ ...resume, awards: [...resume.awards, newAward] });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Ödül Ekle
          </button>

          <div className="space-y-4">
            {resume.awards.map((award, idx) => (
              <div key={award.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Ödül Adı"
                    value={award.title}
                    onChange={(e) => {
                      const updated = [...resume.awards];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      onChange({ ...resume, awards: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="text"
                    placeholder="Veren Kurum"
                    value={award.issuer}
                    onChange={(e) => {
                      const updated = [...resume.awards];
                      updated[idx] = { ...updated[idx], issuer: e.target.value };
                      onChange({ ...resume, awards: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="date"
                    value={award.date}
                    onChange={(e) => {
                      const updated = [...resume.awards];
                      updated[idx] = { ...updated[idx], date: e.target.value };
                      onChange({ ...resume, awards: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                </div>
                <textarea
                  placeholder="Açıklama (opsiyonel)"
                  value={award.description || ''}
                  onChange={(e) => {
                    const updated = [...resume.awards];
                    updated[idx] = { ...updated[idx], description: e.target.value };
                    onChange({ ...resume, awards: updated });
                  }}
                  rows={2}
                  className="w-full mt-3 px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                />
                <button
                  onClick={() => {
                    const updated = resume.awards.filter((_, i) => i !== idx);
                    onChange({ ...resume, awards: updated });
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>

          {resume.awards.length === 0 && (
            <p className="text-sm text-zinc-500 text-center py-4">Henüz ödül eklenmedi</p>
          )}
        </div>
      )}

      {/* Publications */}
      {activeSection === 'publications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">📚 Yayınlar</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.publications_enabled}
                onChange={(e) => onChange({ ...resume, publications_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              const newPub = {
                id: Date.now().toString(),
                title: '',
                publisher: '',
                date: new Date().toISOString().split('T')[0],
                authors: [],
                url: '',
                description: ''
              };
              onChange({ ...resume, publications: [...resume.publications, newPub] });
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Yayın Ekle
          </button>

          <div className="space-y-4">
            {resume.publications.map((pub, idx) => (
              <div key={pub.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Yayın Başlığı"
                    value={pub.title}
                    onChange={(e) => {
                      const updated = [...resume.publications];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      onChange({ ...resume, publications: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="text"
                    placeholder="Yayıncı/Dergi"
                    value={pub.publisher}
                    onChange={(e) => {
                      const updated = [...resume.publications];
                      updated[idx] = { ...updated[idx], publisher: e.target.value };
                      onChange({ ...resume, publications: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="date"
                    value={pub.date}
                    onChange={(e) => {
                      const updated = [...resume.publications];
                      updated[idx] = { ...updated[idx], date: e.target.value };
                      onChange({ ...resume, publications: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={pub.url || ''}
                    onChange={(e) => {
                      const updated = [...resume.publications];
                      updated[idx] = { ...updated[idx], url: e.target.value };
                      onChange({ ...resume, publications: updated });
                    }}
                    className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900"
                  />
                </div>
                <button
                  onClick={() => onChange({ ...resume, publications: resume.publications.filter((_, i) => i !== idx) })}
                  className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  🗑️ Sil
                </button>
              </div>
            ))}
          </div>

          {resume.publications.length === 0 && <p className="text-center text-zinc-500 py-4">Henüz yayın eklenmedi</p>}
        </div>
      )}

      {/* Volunteer */}
      {activeSection === 'volunteer' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">🤝 Gönüllülük</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={resume.volunteer_enabled}
                onChange={(e) => onChange({ ...resume, volunteer_enabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="text-sm">Göster</span>
            </label>
          </div>
          
          <button
            onClick={() => onChange({ ...resume, volunteer: [...resume.volunteer, {
              id: Date.now().toString(), organization: '', role: '',
              start_date: new Date().toISOString().split('T')[0], end_date: '', description: ''
            }]})}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Yeni Gönüllülük Ekle
          </button>

          {resume.volunteer.map((vol, idx) => (
            <div key={vol.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input placeholder="Kurum" value={vol.organization} onChange={(e) => {
                  const u = [...resume.volunteer]; u[idx] = {...u[idx], organization: e.target.value}; onChange({...resume, volunteer: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input placeholder="Rol" value={vol.role} onChange={(e) => {
                  const u = [...resume.volunteer]; u[idx] = {...u[idx], role: e.target.value}; onChange({...resume, volunteer: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" value={vol.start_date} onChange={(e) => {
                  const u = [...resume.volunteer]; u[idx] = {...u[idx], start_date: e.target.value}; onChange({...resume, volunteer: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
                <input type="date" placeholder="Bitiş" value={vol.end_date || ''} onChange={(e) => {
                  const u = [...resume.volunteer]; u[idx] = {...u[idx], end_date: e.target.value}; onChange({...resume, volunteer: u});
                }} className="px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              </div>
              <textarea placeholder="Açıklama" value={vol.description} rows={2} onChange={(e) => {
                const u = [...resume.volunteer]; u[idx] = {...u[idx], description: e.target.value}; onChange({...resume, volunteer: u});
              }} className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-zinc-900" />
              <button onClick={() => onChange({...resume, volunteer: resume.volunteer.filter((_, i) => i !== idx)})}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">🗑️ Sil</button>
            </div>
          ))}
          {resume.volunteer.length === 0 && <p className="text-center text-zinc-500 py-4">Henüz gönüllülük eklenmedi</p>}
        </div>
      )}
    </div>
  );
}

function TranslationEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['nav', 'home']));
  
  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpanded(newExpanded);
  };
  
  const updateValue = (path: string[], value: string) => {
    const newData = JSON.parse(JSON.stringify(data)); // Deep clone
    let current: any = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    onChange(newData);
  };
  
  const renderObject = (obj: any, path: string[] = []): React.JSX.Element[] => {
    const elements: React.JSX.Element[] = [];
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = [...path, key];
      const pathStr = currentPath.join('.');
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const isExpanded = expanded.has(pathStr);
        elements.push(
          <div key={pathStr} className="mb-2">
            <button
              onClick={() => toggleExpand(pathStr)}
              className="w-full text-left px-3 py-2 bg-zinc-100 dark:bg-zinc-700 rounded flex items-center justify-between hover:bg-zinc-200 dark:hover:bg-zinc-600"
            >
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{key}</span>
              <span className="text-zinc-600 dark:text-zinc-400">{isExpanded ? '?' : '?'}</span>
            </button>
            {isExpanded && (
              <div className="ml-4 mt-2 space-y-2">
                {renderObject(value, currentPath)}
              </div>
            )}
          </div>
        );
      } else {
        elements.push(
          <div key={pathStr} className="mb-3">
            <label className="block text-sm font-medium mb-1 text-zinc-700 dark:text-zinc-300">
              {pathStr}
            </label>
            <textarea
              value={String(value || '')}
              onChange={(e) => updateValue(currentPath, e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm"
            />
          </div>
        );
      }
    }
    return elements;
  };
  
  return (
    <div className="max-h-[600px] overflow-y-auto">
      {Object.keys(data).length === 0 ? (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Çeviri verisi yok. İlk çevirileri ekleyin.</p>
      ) : (
        renderObject(data)
      )}
    </div>
  );
}
