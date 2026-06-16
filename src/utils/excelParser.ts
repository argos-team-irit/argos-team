import { read, utils, write } from 'xlsx';
import { TeamMember, TeamData, ProjectItem } from '../types';

// Convert spreadsheet rows back into the structured TeamData format
export function parseExcelRows(rows: any[]): TeamData {
  const data: TeamData = {
    permanentResearchers: [],
    temporaryResearchers: [],
    visitingResearchers: [],
    associateResearchers: [],
    postDocs: [],
    phdStudents: [],
    interns: []
  };

  rows.forEach((row, index) => {
    // Normalizing columns (supporting both English and French headers)
    const findValue = (keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          rk => rk.toLowerCase().trim() === k.toLowerCase().trim()
        );
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    const id = String(findValue(['id', 'identifier', 'identifiant']) || `xlsx-${index + 1}`);
    const name = String(findValue(['name', 'nom']) || '').trim();
    if (!name) return; // Skip empty rows

    const roleEn = String(findValue(['role-en', 'role_en', 'role en', 'role (en)', 'fonction en']) || 'Researcher').trim();
    const roleFr = String(findValue(['role-fr', 'role_fr', 'role fr', 'role (fr)', 'fonction fr', 'role']) || 'Chercheur').trim();
    const photo = String(findValue(['photo', 'image', 'picture', 'avatar']) || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80').trim();
    const link = String(findValue(['link', 'url', 'profile', 'lien', 'profil']) || '#').trim();
    const institution = String(findValue(['institution', 'university', 'université', 'site', 'etablissement']) || '').trim();
    
    // Check if the user has an explicit status to mark them as head of team
    const statusVal = String(findValue(['status', 'statut']) || '').trim().toLowerCase();
    const isHead = statusVal === 'true' || statusVal === 'yes' || statusVal === '1' || statusVal === 'oui' || statusVal === 'head';

    // Check if the user has an explicit group/category column. If not, auto-detect group from role text.
    const categoryColumnVal = findValue(['section', 'group', 'category', 'catégorie', 'groupe']);
    let section = (categoryColumnVal ? String(categoryColumnVal).toLowerCase().trim() : '');

    if (!section) {
      const rFr = roleFr.toLowerCase();
      const rEn = roleEn.toLowerCase();

      if (rFr.includes('visiteur') || rEn.includes('visiting') || rFr.includes('invité') || rEn.includes('guest')) {
        section = 'visiting';
      } else if (rFr.includes('associé') || rEn.includes('associate researcher') || rFr.includes('chercheur associé')) {
        section = 'associate';
      } else if (rFr.includes('temporaire') || rEn.includes('temporary') || rFr.includes('ater')) {
        section = 'temporary';
      } else if (
        rFr.includes('maître') || rFr.includes('maitre') || rFr.includes('professeur') || 
        rFr.includes('mcf') || rFr.includes('prof') || rFr.includes('permanent') || rFr.includes('directeur') ||
        rEn.includes('professor') || rEn.includes('lecturer') || rEn.includes('faculty')
      ) {
        section = 'permanent';
      } else if (rFr.includes('post-doc') || rFr.includes('postdoc') || rEn.includes('postdoc') || rEn.includes('postdoctoral')) {
        section = 'postdoc';
      } else if (rFr.includes('stage') || rFr.includes('stagiaire') || rEn.includes('intern')) {
        section = 'intern';
      } else {
        section = 'phd'; // Default fallback
      }
    }

    const member: TeamMember = {
      id,
      name,
      role: {
        en: roleEn,
        fr: roleFr
      },
      photo,
      link,
      ...(institution ? { institution } : {}),
      isHead
    };

    // Distribute into appropriate sections based on matches
    if (section.includes('visiting') || section.includes('visiteur') || section.includes('invit')) {
      data.visitingResearchers.push(member);
    } else if (section.includes('associate') || section.includes('associé')) {
      data.associateResearchers.push(member);
    } else if (section.includes('temporary') || section.includes('temporaire') || section.includes('ater')) {
      data.temporaryResearchers.push(member);
    } else if (section.includes('permanent') || section.includes('prof') || section.includes('chercheur permanent') || section.includes('permanent researcher') || section.includes('mcf')) {
      data.permanentResearchers.push(member);
    } else if (section.includes('postdoc') || section.includes('post-doc') || section.includes('postdoctoral')) {
      data.postDocs.push(member);
    } else if (section.includes('phd') || section.includes('doc') || section.includes('doctorant') || section.includes('doctorante')) {
      data.phdStudents.push(member);
    } else if (section.includes('intern') || section.includes('stage') || section.includes('stagiaire')) {
      data.interns.push(member);
    } else {
      // Default fallback
      data.phdStudents.push(member);
    }
  });

  return data;
}

// Downloads a sample XLSX template
export function downloadExcelTemplate() {
  const sampleData = [
    {
      "Category": "Permanent Researcher",
      "Name": "Abdelhakim Baouya",
      "Role EN": "Associate Professor",
      "Role FR": "Maître de Conférences",
      "Institution": "Université de Toulouse 2",
      "Photo": "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80",
      "Link": "https://dblp.org/pid/170/3638.html"
    },
    {
      "Category": "Permanent Researcher",
      "Name": "Jane Smith",
      "Role EN": "Full Professor",
      "Role FR": "Professeur des Universités",
      "Institution": "Université de Toulouse 3 (UT3)",
      "Photo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
      "Link": "#"
    },
    {
      "Category": "PostDoc",
      "Name": "Dr. Sarah Lee",
      "Role EN": "Postdoctoral Researcher",
      "Role FR": "Post-Doctorante",
      "Institution": "Université de Toulouse 2 (UT2)",
      "Photo": "https://images.unsplash.com/photo-1594824406240-dafcb4e3e3b3?auto=format&fit=crop&w=300&q=80",
      "Link": "#"
    },
    {
      "Category": "PhD Student",
      "Name": "Marc Dubois",
      "Role EN": "PhD Student",
      "Role FR": "Doctorant",
      "Institution": "Université de Toulouse 3 (UT3)",
      "Photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      "Link": "#"
    },
    {
      "Category": "PhD Student",
      "Name": "Alice Tremblay",
      "Role EN": "PhD Student",
      "Role FR": "Doctorante",
      "Institution": "Université de Toulouse 2",
      "Photo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
      "Link": "#"
    },
    {
      "Category": "Intern",
      "Name": "Lucas Martin",
      "Role EN": "Research Intern",
      "Role FR": "Stagiaire de Recherche",
      "Institution": "Université de Toulouse 3 (UT3)",
      "Photo": "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=300&q=80",
      "Link": "#"
    }
  ];

  const ws = utils.json_to_sheet(sampleData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "CyberLab Team");
  
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cyberlab_team_template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Convert spreadsheet rows into structured ProjectItem array
export function parseProjectExcelRows(rows: any[]): ProjectItem[] {
  const projects: ProjectItem[] = [];

  rows.forEach((row, index) => {
    const findValue = (keys: string[]) => {
      for (const k of keys) {
        const foundKey = Object.keys(row).find(
          rk => rk.toLowerCase().trim() === k.toLowerCase().trim()
        );
        if (foundKey) return row[foundKey];
      }
      return undefined;
    };

    const id = String(findValue(['id', 'identifier', 'identifiant']) || `proj-xlsx-${index + 1}`);
    
    // Support titles (both languages or generic/single column)
    const title = String(findValue(['title', 'titre']) || '').trim();
    const titleEn = String(findValue(['title-en', 'title_en', 'title en', 'titre en']) || title).trim();
    const titleFr = String(findValue(['title-fr', 'title_fr', 'title fr', 'titre fr']) || title).trim();

    if (!titleEn && !titleFr) return; // Skip invalid project rows

    const desc = String(findValue(['desc', 'description', 'déscription']) || '').trim();
    const descEn = String(findValue(['desc-en', 'desc_en', 'description en', 'description_en']) || desc).trim();
    const descFr = String(findValue(['desc-fr', 'desc_fr', 'description fr', 'description_fr']) || desc).trim();

    const partners = String(findValue(['support', 'partners', 'partenaires', 'partenaire']) || '').trim();
    const partnersEn = String(findValue(['support-en', 'support_en', 'support en', 'partners-en', 'partners_en', 'partenaires en', 'partenaires_en']) || partners).trim();
    const partnersFr = String(findValue(['support-fr', 'support_fr', 'support fr', 'partners-fr', 'partners_fr', 'partenaires fr', 'partenaires_fr']) || partners).trim();

    const image = String(findValue(['image', 'logo', 'photo']) || '').trim();
    const link = String(findValue(['link', 'lien', 'url']) || '').trim();
    
    const activeRaw = findValue(['active', 'actif']);
    let activeStr = 'yes';
    if (activeRaw !== undefined && activeRaw !== null) {
      activeStr = String(activeRaw).trim().toLowerCase();
    }
    const active = activeStr === 'yes' || activeStr === 'true' || activeStr === '1' || activeStr === 'oui';

    projects.push({
      id,
      title: {
        en: titleEn || 'Unnamed Project',
        fr: titleFr || 'Projet sans nom'
      },
      desc: {
        en: descEn || 'No description provided.',
        fr: descFr || 'Aucune description fournie.'
      },
      partners: {
        en: partnersEn || 'Support',
        fr: partnersFr || 'Support'
      },
      image: image || undefined,
      link: link || undefined,
      active
    });
  });

  return projects;
}

// Downloads a sample Project XLSX template
export function downloadProjectExcelTemplate() {
  const sampleData = [
    {
      "ID": "1",
      "Title EN": "SecurIoT",
      "Title FR": "SecurIoT",
      "Desc EN": "Formal verification of IoT communication protocols.",
      "Desc FR": "Vérification formelle des systèmes pour les protocoles de communication IoT.",
      "Partners EN": "Partnered with EU Horizon 2020.",
      "Partners FR": "En partenariat avec EU Horizon 2020.",
      "Image": "https://images.unsplash.com/photo-1558486012-817176f84c6d?auto=format&fit=crop&w=300&q=80",
      "Active": "yes",
      "Link": "https://example.com/securiot"
    },
    {
      "ID": "2",
      "Title EN": "CloudShield",
      "Title FR": "CloudShield",
      "Desc EN": "Resilient architectural patterns for cloud-native applications.",
      "Desc FR": "Modèles d'architectures résilientes et cloud-native as a service (CNaaS).",
      "Partners EN": "In collaboration with TechCorp Inc.",
      "Partners FR": "En collaboration avec les acteurs de la région.",
      "Image": "",
      "Active": "yes",
      "Link": ""
    },
    {
      "ID": "3",
      "Title EN": "AutoDefend",
      "Title FR": "AutoDefend",
      "Desc EN": "Automated threat modeling in CI/CD pipelines.",
      "Desc FR": "Modélisation de menaces et cyberdéfense dans les pipelines d'intégration continue.",
      "Partners EN": "In partnership with the National Defense Agency.",
      "Partners FR": "En partenariat avec l'Agence Nationale de Défense.",
      "Image": "",
      "Active": "no",
      "Link": ""
    }
  ];

  const ws = utils.json_to_sheet(sampleData);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "CyberLab Projects");
  
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cyberlab_projects_template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
