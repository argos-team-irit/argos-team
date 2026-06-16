export const translations = {
  en: {
    nav: { about: "About", projects: "Projects", team: "Team", publications: "Publications" },
    hero: {
      title: "Cybersecurity & Systems Architecture Lab",
      subtitle: "Advancing the frontiers of secure software, robust system architecture, and resilient networks.",
    },
    about: {
      title: "About Our Vision",
      content: "In an increasingly interconnected world, the security and reliability of software architectures are paramount. Our research team focuses on developing formal methods, securing system architectures, and engineering robust software to withstand modern cyber threats. We bridge the gap between theoretical foundations and practical cybersecurity solutions."
    },
    projects: {
      title: "Current Projects",
      items: [
        { title: "SecurIoT", desc: "Formal verification of IoT communication protocols.", partners: "Partnered with EU Horizon 2020." },
        { title: "CloudShield", desc: "Resilient architectural patterns for cloud-native applications.", partners: "In collaboration with TechCorp Inc." },
        { title: "AutoDefend", desc: "Automated threat modeling in CI/CD pipelines.", partners: "In partnership with the National Defense Agency." }
      ],
      xlsxSource: "Projects Sourced from Online Excel Sheet",
      jsonSource: "Projects Sourced from Local Backup Database",
      xlsxLoading: "Fetching active project catalog from live XLSX...",
      xlsxSuccess: "Projects synchronized successfully with the Excel workbook!",
      xlsxError: "Could not access remote projects XLSX file due to CORS restrictions or offline status. Using local backup database. You can also upload a template manually below!",
      xlsxDownloadTemplate: "Download Projects Excel Template",
      xlsxUploadBtn: "Upload Projects Excel File",
      xlsxResetBtn: "Restore Default Projects DB",
      xlsxTargetUrl: "Projects Excel Source Address"
    },
    team: {
      title: "Our Team",
      permanent: "Permanent Researchers",
      temporary: "Temporary Researchers",
      visiting: "Visiting Researchers",
      associate: "Associate Researchers",
      postdoc: "Postdoctoral Researchers",
      phd: "PhD Students",
      interns: "Interns",
      xlsxSource: "Sourced from Online Excel Sheet",
      jsonSource: "Sourced from Local Backup Database",
      xlsxLoading: "Fetching active team roster from live XLSX...",
      xlsxSuccess: "Team members synchronized successfully with the Excel workbook!",
      xlsxError: "Could not access remote XLSX file due to CORS restrictions or offline status. Using local backup database. You can also upload the template manually below!",
      xlsxDownloadTemplate: "Download Excel Template",
      xlsxUploadBtn: "Upload Custom Excel File",
      xlsxResetBtn: "Restore Default DB",
      xlsxTargetUrl: "Excel Source Address"
    },
    publications: {
      newsTitle: "Latest News",
      all: "Full Publications",
      fetchError: "Unable to retrieve publications from HAL API. Please try again later.",
      loading: "Loading..."
    },
    footer: {
      address: "123 University Avenue, Technology Campus, Building A.",
      affiliation: "University of Computer Science and Technology",
      contact: "contact@cyberlab.edu"
    }
  },
  fr: {
    nav: { about: "À propos", projects: "Projets", team: "Équipe", publications: "Publications" },
    hero: {
      title: "Laboratoire de Cybersécurité et Architectures Systèmes",
      subtitle: "Repousser les frontières de la sécurité logicielle, des architectures systèmes et des réseaux cyber-physiques.",
    },
    about: {
      title: "Notre Vision",
      content: "Dans un monde de plus en plus interconnecté, la sécurité et la fiabilité des architectures logicielles sont primordiales. Notre équipe de recherche se concentre sur le développement de méthodes formelles, l'analyse d'architectures sytème et la conception de logiciels capables de résister aux cybermenaces modernes. Nous cherchons constamment à faire le lien entre fondations rigoureuses et solutions applicables pour l'industrie."
    },
    projects: {
      title: "Projets en cours",
      items: [
        { title: "SecurIoT", desc: "Vérification formelle des systèmes pour les protocoles de communication IoT.", partners: "En partenariat avec EU Horizon 2020." },
        { title: "CloudShield", desc: "Modèles d'architectures résilientes et cloud-native as a service (CNaaS).", partners: "En collaboration avec les acteurs de la région." },
        { title: "AutoDefend", desc: "Modélisation de menaces et cyberdéfense dans les pipelines d'intégration continue.", partners: "En partenariat avec l'Agence Nationale de Défense." }
      ],
      xlsxSource: "Projets issus du tableau Excel en ligne",
      jsonSource: "Projets issus de la base de données locale de secours",
      xlsxLoading: "Récupération du catalogue de projets depuis le XLSX...",
      xlsxSuccess: "Projets synchronisés avec succès depuis le classeur Excel !",
      xlsxError: "Impossible de charger le fichier XLSX de projets à cause des restrictions CORS ou du réseau. Utilisation du backup local. Vous pouvez aussi charger le fichier manuellement ci-dessous !",
      xlsxDownloadTemplate: "Télécharger le modèle Excel Projets",
      xlsxUploadBtn: "Charger un fichier Excel Projets",
      xlsxResetBtn: "Restaurer la Base Projets par Défaut",
      xlsxTargetUrl: "Adresse Source Excel Projets"
    },
    team: {
      title: "L'Équipe",
      permanent: "Chercheurs Permanents",
      temporary: "Chercheurs Temporaires",
      visiting: "Chercheurs Visiteurs",
      associate: "Chercheurs Associés",
      postdoc: "Post-Doctorants",
      phd: "Doctorants",
      interns: "Stagiaires",
      xlsxSource: "Ressource : Tableau Excel en Ligne",
      jsonSource: "Ressource : Base de Données Locale de Secours",
      xlsxLoading: "Récupération des effectifs actuels de l'équipe depuis le XLSX...",
      xlsxSuccess: "Membres synchronisés avec succès depuis le classeur Excel !",
      xlsxError: "Impossible de charger le fichier XLSX distant dû aux restrictions CORS ou d'un problème réseau. Utilisation de la base backup locale. Vous pouvez aussi charger le fichier manuellement ci-dessous !",
      xlsxDownloadTemplate: "Télécharger le modèle Excel",
      xlsxUploadBtn: "Charger un fichier Excel personnalisé",
      xlsxResetBtn: "Restaurer la Base par Défaut",
      xlsxTargetUrl: "Adresse Source Excel"
    },
    publications: {
      newsTitle: "Actualités",
      all: "Publications Complètes",
      fetchError: "Impossible de récupérer les publications depuis l'API HAL. Veuillez réessayer plus tard.",
      loading: "Chargement..."
    },
    footer: {
      address: "Campus Technologique, 123 Allée des Sciences",
      affiliation: "Université d'Informatique Spatiale et Technologique (UIST)",
      contact: "contact@cyberlab.edu"
    }
  }
};
