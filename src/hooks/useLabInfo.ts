import { useEffect, useState } from 'react';
import { read, utils } from 'xlsx';
import data from '../data.json';
import { translations } from '../translations';

export const useLabInfo = (language: 'en' | 'fr') => {
  const t = translations[language];
  const [info, setInfo] = useState({
    short: 'CS',
    labEn: translations.en.hero.title,
    labFr: translations.fr.hero.title,
    descEn: translations.en.hero.subtitle,
    descFr: translations.fr.hero.subtitle,
    affiliation: translations[language].footer.affiliation,
    address: translations[language].footer.address,
    contact: translations[language].footer.contact,
    logo: '',
  });

  useEffect(() => {
    // Try to fetch JSON first
    const infoJsonUrl = 'https://scout.univ-toulouse.fr/pub/docs/group-lab/web/lab/info.json';
    fetch(`/api/proxy-json?url=${encodeURIComponent(infoJsonUrl)}`)
      .then(res => res.json())
      .then(json => {
         if (Object.keys(json).length > 0) {
            setInfo(prev => ({
              short: json.short || prev.short,
              labEn: json.labEn || json.titleEn || json.title || prev.labEn,
              labFr: json.labFr || json.titleFr || json.title || prev.labFr,
              descEn: json.descEn || json.descriptionEn || json.description || prev.descEn,
              descFr: json.descFr || json.descriptionFr || json.description || prev.descFr,
              affiliation: json.affiliation || prev.affiliation,
              address: json.address || prev.address,
              contact: json.contact || json.email || prev.contact,
              logo: json.logo || prev.logo
            }));
            return;
         }
         throw new Error('Empty JSON response');
      })
      .catch(err => {
         console.error('Failed to fetch JSON, falling back to Excel if available', err);
         if (!data.infoXlsxUrl) return;

         fetch(`/api/proxy-xlsx?url=${encodeURIComponent(data.infoXlsxUrl)}`)
          .then(res => res.arrayBuffer())
          .then(buffer => {
            const workbook = read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rows = utils.sheet_to_json(worksheet, { defval: '' });

            if (rows.length > 0) {
              const row = rows[0] as any;
              const findValue = (keys: string[]) => {
                const rowKeys = Object.keys(row);
                for (const key of keys) {
                   const match = rowKeys.find(k => k.toLowerCase().trim() === key.toLowerCase().trim());
                   if (match && String(row[match]).trim() !== '') return String(row[match]).trim();
                }
                return null;
              };

              setInfo(prev => ({
                ...prev,
                short: findValue(['short', 'abbreviation']) || prev.short,
                labEn: findValue(['lab en', 'lab_en', 'lab-en', 'title en', 'lab', 'team', 'title']) || prev.labEn,
                labFr: findValue(['lab fr', 'lab_fr', 'lab-fr', 'title fr', 'lab', 'team', 'title']) || prev.labFr,
                descEn: findValue(['description en', 'desc en', 'description_en', 'description', 'desc', 'subtitle']) || prev.descEn,
                descFr: findValue(['description fr', 'desc fr', 'description_fr', 'description', 'desc', 'subtitle']) || prev.descFr,
                logo: findValue(['logo', 'image', 'photo', 'icon']) || prev.logo,
              }));
            }
          })
          .catch(e => console.error(e));
      });
  }, []);

  return {
    ...info,
    currentLab: language === 'fr' ? info.labFr : info.labEn,
    currentDesc: language === 'fr' ? info.descFr : info.descEn,
  };
};
