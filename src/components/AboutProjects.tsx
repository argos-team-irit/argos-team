import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import teamData from '../data.json';
import { ProjectItem, VisionData } from '../types';
import { parseProjectExcelRows, downloadProjectExcelTemplate } from '../utils/excelParser';
import { read, utils } from 'xlsx';
import { 
  Shield, 
  Server, 
  Lock, 
  ExternalLink
} from 'lucide-react';

export const AboutProjects = () => {
  const { language } = useLanguage();
  const t = translations[language];

  // Default backup projects mapped to ProjectItem shape
  const defaultBackupProjects: ProjectItem[] = t.projects.items.map((item, idx) => ({
    id: `static-${idx}`,
    title: { en: item.title, fr: item.title },
    desc: { en: item.desc, fr: item.desc },
    partners: { en: item.partners, fr: item.partners }
  }));

  const [activeProjects, setActiveProjects] = useState<ProjectItem[]>(defaultBackupProjects);
  const [showInactive, setShowInactive] = useState(false);
  const [visionData, setVisionData] = useState<VisionData | null>(null);

  // Sync state whenever language changes if using local mode fallback
  useEffect(() => {
    // Note: If using actively fetched excel data, these will just be overwritten next fetch.
    // If not, it keeps the local defaults sync'd with language changes.
    // Since we're trying to display the loaded data, we only reset if it's the default length
    if (activeProjects.length === defaultBackupProjects.length) {
      setActiveProjects(defaultBackupProjects);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Auto-fetch projects spreadsheet on mounting
  useEffect(() => {
    if (teamData.projectsXlsxUrl) {
      handleLoadFromUrl(teamData.projectsXlsxUrl);
    }
  }, []);

  useEffect(() => {
    const fetchVision = async () => {
      // Use data.json if available
      const visionUrl = (teamData as any).visionJsonUrl;
      if (!visionUrl) return;
      try {
        const proxyUrl = `/api/proxy-json?url=${encodeURIComponent(visionUrl)}`;
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const data = await response.json();
          setVisionData(data);
        }
      } catch (err) {
        console.warn("Failed to fetch vision data:", err);
      }
    };
    fetchVision();
  }, []);

  const handleLoadFromUrl = async (url: string) => {
    if (!url) return;
    try {
      const proxyUrl = `/api/proxy-xlsx?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to retrieve project spreadsheet');
      }
      
      const buffer = await response.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = utils.sheet_to_json(worksheet);
      
      if (rows.length === 0) throw new Error('Spreadsheet was successfully read but no project data rows were found.');
      
      const parsedData = parseProjectExcelRows(rows);
      setActiveProjects(parsedData);
    } catch (err: any) {
      console.warn("Project spreadsheet download/access blocked or failed. Using backup catalog:", err);
    }
  };

  const icons = [Shield, Server, Lock];

  return (
    <div className="w-full">
        {/* About Section */}
        <div className="max-w-4xl mx-auto px-6 py-24 text-center" id="about">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8 font-serif">
            {visionData ? visionData.title[language] : t.about.title}
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {visionData ? visionData.content[language] : t.about.content}
          </p>
        </div>
        
        {/* Projects Section */}
        <div className="bg-slate-50 py-24 border-y border-slate-200" id="projects">
          <div className="max-w-7xl mx-auto px-6">
            
            {/* Header Area */}
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 text-center font-serif">{t.projects.title}</h2>
            </div>

            {/* Displaying Projects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {activeProjects.filter(p => showInactive ? true : p.active !== false).map((proj, idx) => {
                const Icon = icons[idx % icons.length];
                return (
                  <div key={proj.id || idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all duration-300 flex flex-col">
                    {proj.image ? (
                      <div className="w-16 h-16 bg-slate-50 rounded-xl overflow-hidden mb-6 flex-shrink-0 flex items-center justify-center border border-slate-100 p-2">
                        <img src={proj.image} alt={language === 'fr' ? proj.title.fr : proj.title.en} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                          <Icon className="w-8 h-8 stroke-[1.5]" />
                      </div>
                    )}
                    {proj.link ? (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 mb-3">
                        <h3 className="text-xl font-semibold text-slate-900 font-serif group-hover:text-blue-600 transition-colors">
                          {language === 'fr' ? proj.title.fr : proj.title.en}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    ) : (
                      <h3 className="text-xl font-semibold text-slate-900 mb-3 font-serif">{language === 'fr' ? proj.title.fr : proj.title.en}</h3>
                    )}
                    <p className="text-slate-600 mb-8 leading-relaxed flex-grow">{language === 'fr' ? proj.desc.fr : proj.desc.en}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                      <div className="text-sm font-medium text-slate-500">
                        {language === 'fr' ? proj.partners.fr : proj.partners.en}
                      </div>
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors">
                          {language === 'fr' ? 'En savoir plus' : 'Learn more'}
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-12 mb-8 text-center flex justify-center w-full">
              {activeProjects.some(p => p.active === false) ? (
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className="text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto transition-all py-3 px-6 rounded-xl shadow-sm"
                >
                  {showInactive 
                    ? (language === 'fr' ? 'Masquer les projets précédents' : 'Hide previous projects')
                    : (language === 'fr' ? 'Voir les projets précédents' : 'Show previous projects')}
                </button>
              ) : (
                <button
                  className="text-slate-400 bg-slate-50 border border-slate-200 font-medium cursor-default flex items-center justify-center gap-2 mx-auto py-3 px-6 rounded-xl shadow-sm opacity-70"
                  disabled
                >
                  {language === 'fr' ? 'Aucun projet précédent' : 'No previous projects'}
                </button>
              )}
            </div>

          </div>
        </div>
    </div>
  );
};
