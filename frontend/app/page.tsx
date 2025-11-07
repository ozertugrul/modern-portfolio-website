'use client';

import { useEffect, useState, ReactElement } from 'react';
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
  section_order?: string[];
  personal_info: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    github?: string;
    linkedin?: string;
  };
  summary?: string;
  summary_enabled?: boolean;
  skills?: string[];
  skills_enabled?: boolean;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field?: string;
    start_date: string;
    end_date?: string;
    description?: string;
  }>;
  education_enabled?: boolean;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    description: string;
    technologies: string[];
  }>;
  experience_enabled?: boolean;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  projects_enabled?: boolean;
  languages: string[];
  languages_enabled?: boolean;
  soft_skills?: string[];
  soft_skills_enabled?: boolean;
  interests?: string[];
  interests_enabled?: boolean;
  references?: Array<{
    id: string;
    name: string;
    title: string;
    company: string;
    email?: string;
    phone?: string;
    relationship?: string;
  }>;
  references_enabled?: boolean;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  certifications_enabled?: boolean;
  awards?: Array<{
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
  }>;
  awards_enabled?: boolean;
  publications?: Array<{
    id: string;
    title: string;
    publisher: string;
    date: string;
    url?: string;
  }>;
  publications_enabled?: boolean;
  volunteer?: Array<{
    id: string;
    organization: string;
    role: string;
    start_date: string;
    end_date?: string;
    description: string;
  }>;
  volunteer_enabled?: boolean;
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
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);

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
            <div className="flex-shrink-0 flex items-center gap-2">
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
                  className="group px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium text-sm sm:text-base hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 relative overflow-hidden"
                >
                  <span className="relative z-10">{t.home.viewPortfolio}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                <a
                  href="#contact"
                  onClick={() => setActiveTab('contact')}
                  className="group px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-300 font-medium text-sm sm:text-base hover:shadow-lg hover:scale-105 hover:border-blue-500 dark:hover:border-blue-400"
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
              <div className="group p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer">
                <div className="text-3xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">⚡</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{features.performance.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300">{features.performance.description}</p>
              </div>
              <div className="group p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer">
                <div className="text-3xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">🚀</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{features.scalable.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300">{features.scalable.description}</p>
              </div>
              <div className="group p-6 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer">
                <div className="text-3xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">🔒</div>
                <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{features.secure.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors duration-300">{features.secure.description}</p>
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
                  onClick={() => setSelectedProject(item)}
                  className="group bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:scale-[1.02] cursor-pointer flex flex-col"
                >
                  {item.image_url && (
                    <div className="w-full h-40 sm:h-48 bg-zinc-200 dark:bg-zinc-700 relative overflow-hidden">
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute inset-0 bg-[#18212E]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                    </div>
                  )}
                  <div className="p-4 sm:p-6 relative flex flex-col h-full">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-slate-100 group-hover:text-slate-50 transition-colors duration-300 line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 mb-4 text-sm group-hover:text-gray-300 transition-colors duration-300 line-clamp-3">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[60px]">
                      {item.technologies.map((tech, idx) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-slate-700 text-slate-200 text-xs rounded group-hover:bg-[#18212E] group-hover:text-slate-50 transition-all duration-300 transform group-hover:scale-105 h-fit"
                          style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3 opacity-80 group-hover:opacity-100 transition-opacity duration-300 mt-auto pt-2 border-t border-slate-700">
                      {item.github_url && (
                        <a
                          href={item.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:underline hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {t.portfolio.viewGithub}
                        </a>
                      )}
                      {item.live_url && (
                        <a
                          href={item.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white hover:underline hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {t.portfolio.viewDemo}
                        </a>
                      )}
                      {item.huggingface_url && (
                        <a
                          href={item.huggingface_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-yellow-600 hover:underline hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          🤗 HuggingFace
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
                onMouseLeave={() => setSelectedProject(null)}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSelectedProject(null);
                }}
              >
                <div
                  className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Project Image */}
                  {selectedProject.image_url && (
                    <div className="w-full h-64 sm:h-96 bg-zinc-200 dark:bg-zinc-700 relative">
                      <Image
                        src={selectedProject.image_url}
                        alt={selectedProject.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                      {selectedProject.title}
                    </h2>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="prose dark:prose-invert max-w-none mb-8">
                      <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-700">
                      {selectedProject.github_url && (
                        <a
                          href={selectedProject.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                          </svg>
                          {t.portfolio.viewGithub}
                        </a>
                      )}
                      {selectedProject.live_url && (
                        <a
                          href={selectedProject.live_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                          </svg>
                          {t.portfolio.viewDemo}
                        </a>
                      )}
                      {selectedProject.huggingface_url && (
                        <a
                          href={selectedProject.huggingface_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 95 88" fill="currentColor">
                            <path d="M47.21 73.94c-12.89 0-23.34-10.45-23.34-23.34s10.45-23.34 23.34-23.34 23.34 10.45 23.34 23.34-10.45 23.34-23.34 23.34zm0-41.94c-10.26 0-18.6 8.34-18.6 18.6s8.34 18.6 18.6 18.6 18.6-8.34 18.6-18.6-8.34-18.6-18.6-18.6z"/>
                            <path d="M47.21 88C21.17 88 0 66.83 0 40.79S21.17-6.42 47.21-6.42s47.21 21.17 47.21 47.21S73.25 88 47.21 88zm0-89.68C24.05-1.68 4.74 17.63 4.74 40.79s19.31 42.47 42.47 42.47 42.47-19.31 42.47-42.47S70.37-1.68 47.21-1.68z"/>
                          </svg>
                          🤗 Hugging Face
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                <div className="flex flex-wrap gap-3">
                  <a 
                    href={`mailto:${about.email}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span className="font-medium">Email</span>
                  </a>
                  
                  {about.github && (
                    <a 
                      href={about.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-900 dark:hover:bg-zinc-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span className="font-medium">GitHub</span>
                    </a>
                  )}
                  
                  {about.linkedin && (
                    <a 
                      href={about.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-medium">LinkedIn</span>
                    </a>
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
              {/* Personal Info - Always first */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
                  {resume.personal_info.name}
                </h3>
                <p className="text-lg sm:text-xl text-blue-600 dark:text-blue-400 mb-3 sm:mb-4">{resume.personal_info.title}</p>
                
                {/* Contact Buttons */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <a 
                    href={`mailto:${resume.personal_info.email}`}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                    <span>Email</span>
                  </a>
                  
                  {resume.personal_info.github && (
                    <a 
                      href={resume.personal_info.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-900 dark:hover:bg-zinc-600 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      <span>GitHub</span>
                    </a>
                  )}
                  
                  {resume.personal_info.linkedin && (
                    <a 
                      href={resume.personal_info.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
                
                {/* Additional Info */}
                <div className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {resume.personal_info.phone && <p>📱 {resume.personal_info.phone}</p>}
                  {resume.personal_info.location && <p>📍 {resume.personal_info.location}</p>}
                </div>
              </div>

              {/* Render sections in order */}
              {(() => {
                const defaultOrder = ['summary', 'skills', 'soft_skills', 'experience', 'education', 
                  'projects', 'languages', 'interests', 'certifications', 'awards', 'publications', 'volunteer', 'references'];
                const sectionOrder = (resume.section_order || defaultOrder).filter(id => id !== 'personal');
                
                const sections: Record<string, ReactElement | null> = {
                  summary: resume.summary && resume.summary_enabled !== false ? (
                    <div className="mb-8" key="summary">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Özet</h4>
                      <p className="text-zinc-700 dark:text-zinc-300">{resume.summary}</p>
                    </div>
                  ) : null,
                  
                  skills: resume.skills && resume.skills.length > 0 && resume.skills_enabled !== false ? (
                    <div className="mb-8" key="skills">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Teknik Yetenekler</h4>
                      <div className="flex flex-wrap gap-3">
                        {resume.skills.map((skill) => (
                          <span key={skill} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  soft_skills: resume.soft_skills && resume.soft_skills.length > 0 && resume.soft_skills_enabled !== false ? (
                    <div className="mb-8" key="soft_skills">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Soft Skills</h4>
                      <div className="flex flex-wrap gap-3">
                        {resume.soft_skills.map((skill) => (
                          <span key={skill} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  experience: resume.experience && resume.experience.length > 0 && resume.experience_enabled !== false ? (
                    <div className="mb-6 sm:mb-8" key="experience">
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
                  ) : null,
                  
                  education: resume.education && resume.education.length > 0 && resume.education_enabled !== false ? (
                    <div className="mb-8" key="education">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Eğitim</h4>
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
                  ) : null,
                  
                  projects: resume.projects && resume.projects.length > 0 && resume.projects_enabled !== false ? (
                    <div className="mb-8" key="projects">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Projeler</h4>
                      <div className="space-y-4">
                        {resume.projects.map((proj) => (
                          <div key={proj.id} className="border-l-4 border-purple-600 pl-4">
                            <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{proj.name}</h5>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mb-2">{proj.description}</p>
                            {proj.technologies && proj.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-2">
                                {proj.technologies.map((tech) => (
                                  <span key={tech} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                            {proj.url && (
                              <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                                Projeyi Görüntüle
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  languages: resume.languages && resume.languages.length > 0 && resume.languages_enabled !== false ? (
                    <div className="mb-8" key="languages">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">{t.resume.languages}</h4>
                      <div className="flex flex-wrap gap-3">
                        {resume.languages.map((lang) => (
                          <span key={lang} className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  interests: resume.interests && resume.interests.length > 0 && resume.interests_enabled !== false ? (
                    <div className="mb-8" key="interests">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">İlgi Alanları</h4>
                      <div className="flex flex-wrap gap-3">
                        {resume.interests.map((interest) => (
                          <span key={interest} className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg font-medium">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  certifications: resume.certifications && resume.certifications.length > 0 && resume.certifications_enabled !== false ? (
                    <div className="mb-8" key="certifications">
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
                  ) : null,
                  
                  awards: resume.awards && resume.awards.length > 0 && resume.awards_enabled !== false ? (
                    <div className="mb-8" key="awards">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Ödüller</h4>
                      <div className="space-y-3">
                        {resume.awards.map((award) => (
                          <div key={award.id} className="border-l-4 border-yellow-500 pl-4">
                            <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">{award.title}</h5>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{award.issuer} - {award.date}</p>
                            {award.description && <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{award.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  publications: resume.publications && resume.publications.length > 0 && resume.publications_enabled !== false ? (
                    <div className="mb-8" key="publications">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Yayınlar</h4>
                      <div className="space-y-3">
                        {resume.publications.map((pub) => (
                          <div key={pub.id}>
                            <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">{pub.title}</h5>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{pub.publisher} - {pub.date}</p>
                            {pub.url && (
                              <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                Görüntüle
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  volunteer: resume.volunteer && resume.volunteer.length > 0 && resume.volunteer_enabled !== false ? (
                    <div className="mb-8" key="volunteer">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Gönüllülük</h4>
                      <div className="space-y-4">
                        {resume.volunteer.map((vol) => (
                          <div key={vol.id} className="border-l-4 border-green-600 pl-4">
                            <h5 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{vol.role}</h5>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{vol.organization}</p>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                              {vol.start_date} - {vol.end_date || 'Devam ediyor'}
                            </p>
                            <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-1">{vol.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
                  
                  references: resume.references && resume.references.length > 0 && resume.references_enabled !== false ? (
                    <div className="mb-8" key="references">
                      <h4 className="text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Referanslar</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {resume.references.map((ref) => (
                          <div key={ref.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                            <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">{ref.name}</h5>
                            <p className="text-sm text-blue-600 dark:text-blue-400">{ref.title}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{ref.company}</p>
                            {ref.relationship && (
                              <p className="text-xs text-zinc-500 mt-1">{ref.relationship}</p>
                            )}
                            {ref.email && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">{ref.email}</p>
                            )}
                            {ref.phone && (
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">{ref.phone}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null,
                };
                
                return sectionOrder.map(id => sections[id]).filter(Boolean);
              })()}
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
