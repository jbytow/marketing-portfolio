import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Github, Linkedin, Twitter, Instagram, Mail } from 'lucide-react';

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Mail, href: '#', label: 'Email' },
];

const footerLinks = [
  { path: '/about', labelKey: 'nav.about' },
  { path: '/experience', labelKey: 'nav.experience' },
  { path: '/projects', labelKey: 'nav.projects' },
  { path: '/case-studies', labelKey: 'nav.caseStudies' },
  { path: '/contact', labelKey: 'nav.contact' },
];

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-800">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-display font-bold gradient-text">
              Portfolio
            </Link>
            <p className="text-dark-400 text-sm max-w-xs">
              Creating impactful marketing campaigns and building brand stories that resonate.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-100">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-dark-400 hover:text-primary-400 transition-colors text-sm"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-100">{t('contact.info.social')}</h3>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-dark-400 hover:text-primary-400 bg-dark-800 hover:bg-dark-700 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="text-dark-500 text-sm">
            &copy; {currentYear} Portfolio. {t('footer.rights')}.
          </p>
          <p className="text-dark-500 text-sm flex items-center">
            {t('footer.madeWith')}{' '}
            <Heart className="w-4 h-4 mx-1 text-accent-pink" />
          </p>
        </div>
      </div>
    </footer>
  );
}
