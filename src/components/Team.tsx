import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import teamData from '../data.json';
import { TeamMember, TeamData } from '../types';
import { parseExcelRows, downloadExcelTemplate } from '../utils/excelParser';
import { read, utils } from 'xlsx';
import { 
  ExternalLink,
  User
} from 'lucide-react';

const MemberCard = ({ member, lang }: { member: TeamMember, lang: 'en'|'fr', key?: React.Key }) => {
  const [imgError, setImgError] = useState(false);
  const showFallback = !member.photo || imgError;

  return (
  <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="aspect-square overflow-hidden bg-slate-100 flex items-center justify-center relative bg-gradient-to-br from-slate-100 to-slate-200">
        {!showFallback ? (
          <img 
            src={member.photo} 
            alt={member.name} 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <User className="w-1/3 h-1/3 text-slate-300 group-hover:scale-110 transition-transform duration-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h4 className="text-xl font-bold tracking-tight text-slate-900 mb-1 flex items-center justify-between">
          <span className="truncate" title={member.name}>{member.name}</span>
          {member.isHead && (
            <span className="shrink-0 inline-flex items-center justify-center bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2" title={lang === 'en' ? 'Head of Team' : 'Responsable d\'équipe'}>
              {lang === 'en' ? 'Head' : 'Responsable'}
            </span>
          )}
        </h4>
        <p className="text-blue-600 font-medium text-sm mb-1">{member.role[lang]}</p>
        {member.institution && (
          <p className="text-slate-500 font-medium text-sm mb-4">
            {member.institution}
          </p>
        )}
        {!member.institution && <div className="mb-4"></div>}
        {member.link && member.link !== '#' && (
          <div className="mt-auto">
            <a href={member.link} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2">
              {lang === 'en' ? 'Academic Profile' : 'Profil Académique'} <ExternalLink className="w-4 h-4 ml-1.5" />
            </a>
          </div>
        )}
        <div className={!(member.link && member.link !== '#') ? "mt-auto" : ""}>
          <a href={`https://hal.science/search/index?q=authFullName_t:"${encodeURIComponent(member.name)}"`} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
            {lang === 'en' ? 'Publications on HAL' : 'Publications sur HAL'} <ExternalLink className="w-4 h-4 ml-1.5" />
          </a>
        </div>
      </div>
  </div>
  );
};

export const Team = () => {
  const { language } = useLanguage();
  const t = translations[language].team;

  // Initialize with local file fallback data so content renders immediately
  const [activeTeam, setActiveTeam] = useState<TeamData>({
    permanentResearchers: teamData.permanentResearchers,
    temporaryResearchers: teamData.temporaryResearchers || [],
    visitingResearchers: teamData.visitingResearchers || [],
    associateResearchers: teamData.associateResearchers || [],
    postDocs: teamData.postDocs,
    phdStudents: teamData.phdStudents,
    interns: teamData.interns
  });

  // Auto-fetch spreadsheet on mounting
  useEffect(() => {
    handleLoadFromUrl(teamData.xlsxUrl);
  }, []);

  // Async function to load from remote spreadsheet via the secure server-side CORS proxy
  const handleLoadFromUrl = async (url: string) => {
    if (!url) return;
    try {
      const proxyUrl = `/api/proxy-xlsx?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        let errMsg = 'Failed to retrieve spreadsheet';
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errMsg);
      }
      
      const buffer = await response.arrayBuffer();
      const workbook = read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows = utils_sheet_to_json(worksheet);
      
      if (rows.length === 0) throw new Error('Spreadsheet was successfully read but no data rows were found.');
      
      const parsedData = parseExcelRows(rows);
      setActiveTeam(parsedData);
    } catch (err: any) {
      console.warn("Spreadsheet download/access blocked or failed. Using robust database fallback:", err);
    }
  };

  // Safe sheet to json converter
  const utils_sheet_to_json = (worksheet: any): any[] => {
    return utils.sheet_to_json(worksheet);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24" id="team">
      
      {/* Header and Controller Area */}
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 font-serif">{t.title}</h2>
      </div>

      {/* Render permanent researchers */}
      {activeTeam.permanentResearchers.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.permanent}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.permanentResearchers.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render Temporary researchers */}
      {activeTeam.temporaryResearchers && activeTeam.temporaryResearchers.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.temporary}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.temporaryResearchers.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render Associate researchers */}
      {activeTeam.associateResearchers && activeTeam.associateResearchers.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.associate}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.associateResearchers.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render Visiting researchers */}
      {activeTeam.visitingResearchers && activeTeam.visitingResearchers.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.visiting}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.visitingResearchers.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render Postdocs */}
      {activeTeam.postDocs && activeTeam.postDocs.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.postdoc}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.postDocs.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render PhD Students */}
      {activeTeam.phdStudents.length > 0 && (
        <div className="mb-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.phd}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.phdStudents.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}

      {/* Render Interns */}
      {activeTeam.interns && activeTeam.interns.length > 0 && (
        <div className="mt-20">
          <h3 className="text-2xl font-semibold mb-8 text-slate-800 border-b border-slate-200 pb-4 font-serif">
            {t.interns}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {activeTeam.interns.map(member => (
                <MemberCard key={member.id} member={member} lang={language} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
