/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageProvider } from './LanguageContext';
import { HeaderHero } from './components/HeaderHero';
import { AboutProjects } from './components/AboutProjects';
import { Team } from './components/Team';
import { PublicationsSections } from './components/PublicationsSections';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
        <main>
          <HeaderHero />
          <AboutProjects />
          <Team />
          <PublicationsSections />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
