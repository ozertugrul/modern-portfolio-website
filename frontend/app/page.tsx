'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
  personal_info: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    github?: string;
    linkedin?: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description: string;
    technologies: string[];
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  languages: string[];
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
}

export default function Home() {
  const { t, locale } = useLocale();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [about, setAbout] = useState<About | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [footerText, setFooterText] = useState<string>(t.footer.text);
  const [footerEnabled, setFooterEnabled] = useState<boolean>(true);
  const [footerLoaded, setFooterLoaded] = useState<boolean>(false);
  const [hero, setHero] = useState<any>(null);
  const [heroLoading, setHeroLoading] = useState<boolean>(true);
  const [features, setFeatures] = useState<any>(null);
  const [featuresLoading, setFeaturesLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio' | 'about' | 'resume' | 'contact'>('home');
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch('/api/portfolio')
      .then(res => res.json())
      .then(data => setPortfolio(data))
      .catch(err => console.error('Portfolio fetch error:', err));

    fetch('/api/about')
      .then(res => res.json())
      .then(data => setAbout(data))
      .catch(err => console.error('About fetch error:', err));

    fetch('/api/resume')
      .then(res => res.json())
      .then(data => setResume(data))
      .catch(err => console.error('Resume fetch error:', err));

    fetch('/api/hero')
      .then(res => res.json())
      .then(data => {
        if (locale === 'tr') {
          setHero({
            greeting: data.greeting_tr,
            name: data.name,
            title: data.title_tr,
          });
        } else {
          setHero({
            greeting: data.greeting_en,
            name: data.name,
            title: data.title_en,
          });
        }
        setHeroLoading(false);
      })
      .catch(err => {
        console.error('Hero fetch error:', err);
        setHeroLoading(false);
      });

    fetch('/api/features')
      .then(res => res.json())
      .then(data => {
        if (locale === 'tr') {
          setFeatures({
            performance: { title: data.performance_tr.title, description: data.performance_tr.description },
            scalable: { title: data.scalable_tr.title, description: data.scalable_tr.description },
            secure: { title: data.secure_tr.title, description: data.secure_tr.description },
          });
        } else {
          setFeatures({
            performance: { title: data.performance_en.title, description: data.performance_en.description },
            scalable: { title: data.scalable_en.title, description: data.scalable_en.description },
            secure: { title: data.secure_en.title, description: data.secure_en.description },
          });
        }
        setFeaturesLoading(false);
      })
      .catch(err => {
        console.error('Features fetch error:', err);
        setFeaturesLoading(false);
      });
  }, [locale]);

  useEffect(() => {
    fetch('/api/footer')
      .then(res => res.json())
      .then(data => {
        if (locale === 'tr') {
          setFooterText(data.text_tr);
        } else {
          setFooterText(data.text_en);
        }
        setFooterEnabled(data.enabled ?? true);
        setFooterLoaded(true);
      })
      .catch(err => {
        console.error('Footer fetch error:', err);
        setFooterLoaded(true); // Fallback to i18n text
      });
  }, [locale]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitted(true);
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Contact form error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-900 dark:to-black">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            {/* Navigation Links */}
            <div className="flex-1 flex justify-center">
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 max-w-2xl">
                {(['home', 'portfolio', 'about', 'resume', 'contact'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs sm:text-sm md:text-base capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'text-zinc-900 dark:text-zinc-100 font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    {t.nav[tab]}
                  </button>
                ))}
              </div>
            </div>
            {/* Language Switcher */}
            <div className="flex-shrink-0">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-8 sm:space-y-12">
            {heroLoading ? (
              <div className="text-center space-y-4 sm:space-y-6 px-4 py-12">
                <div className="animate-pulse">
                  <div className="h-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-3/4 mx-auto mb-4"></div>
                  <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : hero ? (
              <>
            <div className="text-center space-y-4 sm:space-y-6 px-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {hero.greeting} <span className="text-blue-600 dark:text-blue-400">{hero.name}</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
                {hero.title}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-4 sm:pt-6">
                <a
                  href="#portfolio"
                  onClick={() => setActiveTab('portfolio')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {t.home.viewPortfolio}
                </a>
                <a
                  href="#contact"
                  onClick={() => setActiveTab('contact')}
                  className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-sm sm:text-base"
                >
                  {t.home.contactMe}
                </a>
              </div>
            </div>
            </>
            ) : null}

            {featuresLoading ? (
              <div className="grid md:grid-cols-3 gap-6 mt-16">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 animate-pulse">
                    <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-700 rounded mb-4"></div>
                    <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded mb-2"></div>
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : features ? (
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="text-3xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{features.performance.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{features.performance.description}</p>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="text-3xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{features.scalable.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{features.scalable.description}</p>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="text-3xl mb-4">🔒</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">{features.secure.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">{features.secure.description}</p>
              </div>
            </div>
            ) : null}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 sm:space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 sm:mb-8">{t.portfolio.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {portfolio.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {item.image_url && (
                    <div className="w-full h-40 sm:h-48 bg-zinc-200 dark:bg-zinc-700 relative overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                      {item.title}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4 text-sm">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {item.github_url && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t.portfolio.viewGithub}
                        </a>
                      )}
                      {item.live_url && (
                        <a
                          href={item.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {t.portfolio.viewDemo}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && about && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 sm:mb-8">{t.about.title}</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 md:p-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                {about.name}
              </h3>
              <p className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 mb-4 sm:mb-6">{about.title}</p>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mb-6 sm:mb-8 leading-relaxed">
                {about.bio}
              </p>

              <div className="mb-6 sm:mb-8">
                <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-zinc-100">{t.about.skills}</h4>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {about.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium text-sm sm:text-base"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 sm:pt-6">
                <h4 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-zinc-100">{t.about.contact}</h4>
                <div className="space-y-2 text-sm sm:text-base">
                  <p className="text-zinc-600 dark:text-zinc-400 break-all">
                    📧 <a href={`mailto:${about.email}`} className="hover:text-blue-600 dark:hover:text-blue-400">{about.email}</a>
                  </p>
                  {about.github && (
                    <p className="text-zinc-600 dark:text-zinc-400 break-all">
                      🔗 <a href={about.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">{about.github}</a>
                    </p>
                  )}
                  {about.linkedin && (
                    <p className="text-zinc-600 dark:text-zinc-400 break-all">
                      🔗 <a href={about.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">{about.linkedin}</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'resume' && resume && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 sm:mb-8">{t.resume.title}</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 md:p-8">
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                  {resume.personal_info.name}
                </h3>
                <p className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">{resume.personal_info.title}</p>
                <div className="space-y-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                  <p className="break-all">📧 {resume.personal_info.email}</p>
                  {resume.personal_info.phone && <p>📱 {resume.personal_info.phone}</p>}
                  {resume.personal_info.location && <p>📍 {resume.personal_info.location}</p>}
                  {resume.personal_info.github && (
                    <p className="break-all">🔗 <a href={resume.personal_info.github} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">{resume.personal_info.github}</a></p>
                  )}
                  {resume.personal_info.linkedin && (
                    <p className="break-all">🔗 <a href={resume.personal_info.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400">{resume.personal_info.linkedin}</a></p>
                  )}
                </div>
              </div>

              {resume.experience.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <h4 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-zinc-900 dark:text-zinc-100">{t.resume.experience}</h4>
                  <div className="space-y-4 sm:space-y-6">
                    {resume.experience.map((exp) => (
                      <div key={exp.id} className="border-l-2 sm:border-l-4 border-blue-600 pl-3 sm:pl-4">
                        <h5 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100">{exp.position}</h5>
                        <p className="text-sm sm:text-base text-blue-600 dark:text-blue-400">{exp.company}</p>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {exp.start_date} - {exp.end_date || t.resume.ongoing}
                        </p>
                        <p className="text-sm sm:text-base text-zinc-700 dark:text-zinc-300 mb-2">{exp.description}</p>
                        {exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                            {exp.technologies.map((tech) => (
                              <span key={tech} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.education.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">E?itim</h4>
                  <div className="space-y-4">
                    {resume.education.map((edu) => (
                      <div key={edu.id} className="border-l-4 border-green-600 pl-4">
                        <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{edu.degree}</h5>
                        <p className="text-blue-600 dark:text-blue-400">{edu.institution}</p>
                        {edu.field && <p className="text-sm text-zinc-600 dark:text-zinc-400">{edu.field}</p>}
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {edu.start_date} - {edu.end_date || t.resume.ongoing}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {resume.languages.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{t.resume.languages}</h4>
                  <div className="flex flex-wrap gap-3">
                    {resume.languages.map((lang) => (
                      <span key={lang} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {resume.certifications.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{t.resume.certifications}</h4>
                  <div className="space-y-3">
                    {resume.certifications.map((cert) => (
                      <div key={cert.id}>
                        <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">{cert.name}</h5>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{cert.issuer} - {cert.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-6 sm:mb-8">{t.contact.title}</h2>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-4 sm:p-6 md:p-8">
              {submitted && (
                <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">
                  {t.contact.success}
                </div>
              )}
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                    {t.contact.name}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full px-3 sm:px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                    {t.contact.email}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full px-3 sm:px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 text-zinc-900 dark:text-zinc-100">
                    {t.contact.message}
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder={t.contact.messagePlaceholder}
                    className="w-full px-3 sm:px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                >
                  {t.contact.send}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer - Sabit alt kısım */}
      {footerLoaded && footerEnabled && (
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800 py-8 bg-white dark:bg-zinc-900 animate-slide-up">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-600 dark:text-zinc-400">
            <p className="text-sm">{footerText} © 2025</p>
          </div>
        </footer>
      )}
    </div>
  );
}
