import { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { translations } from '../translations';
import teamData from '../data.json';
import { Publication, TeamData } from '../types';
import { ExternalLink, FileText, Loader2, Megaphone } from 'lucide-react';
import { read, utils } from 'xlsx';
import { parseExcelRows } from '../utils/excelParser';

export const PublicationsSections = () => {
  const { language } = useLanguage();
  const t = translations[language].publications;
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [news, setNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      if (!teamData.newsXlsxUrl) {
        setNewsLoading(false);
        return;
      }
      try {
        setNewsLoading(true);
        const res = await fetch(`/api/proxy-xlsx?url=${encodeURIComponent(teamData.newsXlsxUrl)}`);
        if (!res.ok) throw new Error('Failed to fetch news xlsx');
        const buffer = await res.arrayBuffer();
        const workbook = read(buffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = utils.sheet_to_json(worksheet, { defval: '' }) as any[];
        
        const parsedNews = rows.map((r, i) => {
          const rowKeys = Object.keys(r);
          const findVal = (keys: string[]) => {
            const match = rowKeys.find(k => keys.some(key => k.toLowerCase() === key.toLowerCase()));
            return match ? String(r[match]).trim() : '';
          };
          
          return {
            id: i,
            title: findVal(['title', 'news', 'event', 'titre', 'description', 'nom']),
            date: findVal(['date', 'time', 'jour', 'année', 'year']),
            info: findVal(['info', 'link', 'url', 'lien'])
          };
        }).filter(n => n.title !== '');
        
        setNews(parsedNews.slice(-5).reverse()); // Getting the last 5 events
      } catch (err) {
        console.error("News Fetch Error:", err);
      } finally {
        setNewsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const [allMemberNames, setAllMemberNames] = useState<string[]>([]);
  const halViewAllQuery = allMemberNames.length > 0 ? `authFullName_t:(${allMemberNames.map(n => `"${n}"`).join(' OR ')})` : '*';

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        setLoading(true);
        
        let membersData: TeamData = {
          permanentResearchers: teamData.permanentResearchers,
          temporaryResearchers: teamData.temporaryResearchers || [],
          visitingResearchers: teamData.visitingResearchers || [],
          associateResearchers: teamData.associateResearchers || [],
          postDocs: teamData.postDocs,
          phdStudents: teamData.phdStudents,
          interns: teamData.interns
        };

        if (teamData.xlsxUrl) {
          try {
            const proxyUrl = `/api/proxy-xlsx?url=${encodeURIComponent(teamData.xlsxUrl)}`;
            const response = await fetch(proxyUrl);
            if (response.ok) {
              const buffer = await response.arrayBuffer();
              const workbook = read(buffer, { type: 'array' });
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const rows = utils.sheet_to_json(worksheet, { defval: '' });
              if (rows.length > 0) {
                membersData = parseExcelRows(rows);
              }
            }
          } catch (e) {
            console.error("Failed to load members excel for publications", e);
          }
        }
        
        // Gather all members
        const allMembers = [
          ...membersData.permanentResearchers,
          ...membersData.temporaryResearchers,
          ...membersData.visitingResearchers,
          ...membersData.associateResearchers,
          ...membersData.postDocs,
          ...membersData.phdStudents,
          ...membersData.interns
        ];
        
        const memberNames = allMembers.map(m => m.name).filter(Boolean);
        setAllMemberNames(memberNames);
        const targetResearchersQuery = memberNames.length > 0 ? `(${memberNames.map(n => `"${n}"`).join(' OR ')})` : '*';
        
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 1;

        // Fetching from HAL API for each author individually
        const yearQuery = `producedDateY_i:[${startYear} TO ${currentYear}]`;
        const fetchPromises = memberNames.map(async (name) => {
          const query = `authFullName_t:"${name}" AND ${yearQuery}`;
          const url = `https://api.archives-ouvertes.fr/search/?q=${encodeURIComponent(query)}&fl=title_s,authFullName_s,producedDateY_i,uri_s,journalTitle_s,bookTitle_s&rows=100&wt=json&sort=producedDateY_i desc`;
          try {
            const res = await fetch(url);
            if (res.ok) {
               return await res.json();
            }
          } catch (e) {
            console.error(`Error fetching for ${name}:`, e);
          }
          return null;
        });
        
        const results = await Promise.all(fetchPromises);
        let allDocs: any[] = [];
        
        results.forEach(data => {
          if (data?.response?.docs) {
             allDocs = [...allDocs, ...data.response.docs];
          }
        });
        
        // Deduplicate
        const uniqueDocs = new Map<string, any>();
        allDocs.forEach(doc => {
           if (doc.uri_s && !uniqueDocs.has(doc.uri_s)) {
             uniqueDocs.set(doc.uri_s, doc);
           }
        });
        
        const docs = Array.from(uniqueDocs.values());
        
        const fetchedPubs: Publication[] = docs.map((doc: any) => {
          return {
            id: doc.uri_s || Math.random().toString(),
            title: (doc.title_s && doc.title_s[0]) || 'Untitled Publication',
            authors: doc.authFullName_s || [],
            venue: doc.journalTitle_s || doc.bookTitle_s || 'Miscellaneous/Conference',
            year: (doc.producedDateY_i || currentYear).toString(),
            url: doc.uri_s || '#'
          };
        });

        fetchedPubs.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        
        setPublications(fetchedPubs);
        setError(false);
      } catch (err) {
        console.error("HAL Fetch Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

        return (
          <div className="w-full">
              {/* News Section */}
              <div className="bg-slate-900 py-16 border-y border-slate-800 text-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                  <h3 className="flex items-center text-2xl font-serif tracking-tight text-white mb-10">
                    <Megaphone className="w-7 h-7 mr-3 text-yellow-400" />
                    {t.newsTitle || "News"}
                  </h3>
                  
                  {newsLoading && (
                    <div className="flex items-center text-slate-400">
                      <Loader2 className="w-5 h-5 mr-3 animate-spin"/> {t.loading}
                    </div>
                  )}
                  
                  {!newsLoading && news.length === 0 && (
                    <p className="text-slate-400 italic">No recent news found.</p>
                  )}
                  
                  {!newsLoading && news.length > 0 && (
                    <div className="space-y-4">
                      {news.map((item, id) => (
                        <div key={item.id ?? id} className="flex flex-col sm:flex-row sm:items-start gap-4 bg-slate-800 p-5 rounded-xl border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all shadow-sm">
                          {item.date && (
                            <div className="shrink-0 pt-1">
                              <span className="px-3 py-1 bg-slate-700 text-blue-300 text-sm rounded-full font-mono font-medium whitespace-nowrap">
                                {item.date}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-100 text-lg leading-snug">{item.title}</p>
                          </div>
                          {item.info && (
                            <div className="shrink-0 sm:pt-1">
                              <a href={item.info.startsWith('http') ? item.info : `https://${item.info}`} target="_blank" rel="noreferrer" className="inline-flex items-center p-2 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-blue-400 hover:border-slate-500 transition-colors">
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Publications */}
              <div className="max-w-7xl mx-auto px-6 py-24" id="publications">
                <div className="flex sm:items-center justify-between flex-col sm:flex-row mb-10 gap-4">
                  <h3 className="flex items-center text-3xl font-bold tracking-tight text-slate-900 font-serif">
                    <FileText className="w-8 h-8 mr-4 text-slate-300" />
                    {t.all}
                  </h3>
                  <a 
                    href={`https://hal.science/search/index?q=${encodeURIComponent(halViewAllQuery)}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
              {language === 'en' ? 'View all on HAL' : 'Voir tout sur HAL'}
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
          
          {loading && (
            <div className="flex items-center text-slate-500 py-4">
              <Loader2 className="w-5 h-5 mr-3 animate-spin"/> {t.loading}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 text-red-600 p-5 rounded-lg border border-red-100">
                {t.fetchError}
            </div>
          )}
          
          {!loading && !error && publications.length > 0 && (
            <div className="space-y-4">
              {publications.map(pub => (
                  <div key={pub.id} className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
                    <div className="hidden sm:block pt-1 shrink-0">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded-full font-mono font-medium">
                          {pub.year}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-lg mb-2 leading-snug">{pub.title}</h4>
                      <p className="text-slate-600 text-sm mb-3 truncate hover:whitespace-normal">{pub.authors.join(', ')}</p>
                      <div className="text-sm text-slate-500">
                        {language === 'en' ? 'Published in' : 'Publié dans'} : <span className="font-medium text-slate-700">{pub.venue}</span>
                      </div>
                    </div>
                    <div className="shrink-0 sm:pt-2">
                        <a href={pub.url} target="_blank" rel="noreferrer" className="p-2 inline-flex rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                          <ExternalLink className="w-5 h-5" />
                        </a>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};
