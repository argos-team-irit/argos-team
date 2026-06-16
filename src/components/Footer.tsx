import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import { useLabInfo } from '../hooks/useLabInfo';

export const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language].footer;
  const info = useLabInfo(language);
  return (
    <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-center md:text-left gap-8">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 text-white">
              {info.logo ? (
                <img src={info.logo} alt={info.short} className="h-10 object-contain rounded bg-white p-1" />
              ) : (
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-xs font-bold font-serif">{info.short.substring(0, 3)}</div>
              )}
               <span className="font-semibold text-base tracking-tight">{info.short}</span>
            </div>
            <p className="font-medium text-slate-300 mb-1">{info.affiliation || t.affiliation}</p>
            <p className="text-slate-500 whitespace-pre-line">{info.address || t.address}</p>
          </div>
          <div>
             <p className="text-slate-500 mb-2">{language === 'en' ? 'Contact Us' : 'Nous Contacter'}</p>
             <p className="font-medium text-blue-400 hover:text-blue-300 cursor-pointer">{info.contact || t.contact}</p>
          </div>
        </div>
    </footer>
  );
};
