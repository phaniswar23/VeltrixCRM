import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Instagram, Github, Linkedin } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="w-full bg-[#FBFBF9] border-t border-[#E5E2DC] py-16">
      <div className="container-boxed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#2D3A2D] rounded-lg flex items-center justify-center text-white font-bold text-base">
                V
              </div>
              <span className="font-bold text-xl tracking-tight text-[#1A1A1A]">
                Veltrix<span className="text-[#4A5D4E]">CRM</span>
              </span>
            </Link>
            <p className="text-sm text-[#706F6C] max-w-md leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
              Intelligence
            </h4>
            <ul className="space-y-3 text-xs font-medium text-[#706F6C]">
              <li>
                <Link to="/#features" className="hover:text-[#2D3A2D] transition-colors">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
                  className="hover:text-[#2D3A2D] transition-colors"
                >
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <span className="opacity-70">Enterprise</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] mb-4">
              Foundation
            </h4>
            <ul className="space-y-3 text-xs font-medium text-[#706F6C]">
              <li>
                <Link to="/#contact" className="hover:text-[#2D3A2D] transition-colors">
                  {t('contact_us')}
                </Link>
              </li>
              <li>
                <span className="opacity-70">Security</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5E2DC] flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-[#706F6C]">
          <p>{t('footer_rights')}</p>

          <div className="flex flex-wrap items-center gap-4">
            {/* Instagram Link */}
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-[#FBFBF9] border border-[#E5E2DC] hover:border-pink-300 hover:bg-pink-500/[0.03] rounded-full text-[#706F6C] hover:text-pink-600 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Instagram className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Instagram</span>
            </a>

            {/* GitHub Link */}
            <a
              href="https://github.com/phaniswar23"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-[#FBFBF9] border border-[#E5E2DC] hover:border-zinc-400 hover:bg-zinc-500/[0.03] rounded-full text-[#706F6C] hover:text-zinc-800 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Github className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest">GitHub</span>
            </a>

            {/* LinkedIn Link */}
            <a
              href="https://www.linkedin.com/in/phaniswar99/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 bg-[#FBFBF9] border border-[#E5E2DC] hover:border-blue-300 hover:bg-blue-500/[0.03] rounded-full text-[#706F6C] hover:text-blue-600 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Linkedin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest">LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
