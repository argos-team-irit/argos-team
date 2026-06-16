import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import { Globe2 } from 'lucide-react';
import { useLabInfo } from '../hooks/useLabInfo';

export const HeaderHero = () => {
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const nav = t.nav;

  const info = useLabInfo(language);

  return (
    <div className="relative bg-slate-900 text-white overflow-hidden">
        {/* Decorative ambient backgrounds */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl"></div>

        <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {info.logo ? (
              <img src={info.logo} alt={info.short} className="h-16 object-contain rounded bg-white p-2" />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-xl font-bold font-serif tracking-tighter">
                {info.short.substring(0, 3)}
              </div>
            )}
            <span className="font-bold tracking-tight text-lg">{info.short}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#about" className="hover:text-white transition-colors">{nav.about}</a>
            <a href="#projects" className="hover:text-white transition-colors">{nav.projects}</a>
            <a href="#team" className="hover:text-white transition-colors">{nav.team}</a>
            <a href="#publications" className="hover:text-white transition-colors">{nav.publications}</a>
          </nav>

          <button 
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-sm font-medium border border-slate-700 hover:border-slate-600 cursor-pointer"
          >
            <Globe2 className="w-4 h-4" />
            {language === 'en' ? 'FR' : 'EN'}
          </button>
        </header>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8 font-serif leading-tight">
            {info.currentLab}
          </h1>
          <p className="text-lg md:text-xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto font-light">
            {info.currentDesc}
          </p>
        </div>
    </div>
  );
};
