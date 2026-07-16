import type { Locale } from '@/i18n/types'
import { buildGuideSpeechText, prepareGuideSpeechText } from '@/lib/guideSpeechText'

/**
 * Hand-written TTS scripts per guide chunk.
 * Prefer whole words (HTML, CSS, frontend) — avoid dotted acronyms that get spelled slowly.
 */
const GUIDE_SPEECH_SCRIPTS: Record<Locale, Record<string, string>> = {
  fr: {
    'about-main':
      'À propos. Développeur full stack et étudiant en licence professionnelle informatique à SUP MTI. Je cherche un poste pour mettre en pratique mes compétences en développement web : HTML, CSS, PHP, JavaScript, React, Laravel, et logiciel : Java et Kotlin. Curieux et rigoureux, je souhaite contribuer à des projets concrets au sein d’une équipe dynamique. À la recherche d’un poste, disponible pour des missions.',

    'about-availability':
      'Disponibilité. Je suis à la recherche d’un poste et disponible pour des missions. Développement web avec HTML, CSS, PHP, JavaScript, React et Laravel, ainsi que Java et Kotlin.',

    'skills-overview':
      'Compétences. Stack clé : React, TypeScript, Laravel, Kotlin, Soupa base et Docker. Frontend : HTML 5, CSS 3, JavaScript, TypeScript, React, Vite, Tailwind CSS et Bootstrap. Backend : PHP, Python, Laravel, FastAPI, Node JS, Express JS et API REST. Mobile et desktop : Kotlin, Jetpack Compose, React Native, Rust et Tauri. Data et DevOps : MySQL, MongoDB, Oracle, Soupa base, Docker, Git et GitHub. Design : Figma, Canva, UI UX, responsive et PWA.',

    'experience-list':
      'Expérience. Développeur full stack freelance, Maroc, à distance, de 2024 à aujourd’hui. Plus de 33 dépôts publics sur GitHub. Dashboards, apps mobile en Kotlin et Compose, menus digitaux et sites vitrine. Développeur frontend chez Pure Power, snack fitness à Oujda, en 2026. Menu digital mobile first avec QR code par table. Stage de mars 2025, un mois, stagiaire informatique au service informatique de la Faculté des Sciences d’Oujda, Université Mohammed Premier.',

    'education-list':
      'Formation. Licence professionnelle en informatique, 2025–2026, école SUP MTI à Oujda, en cours. Technicien spécialisé en développement digital, 2023–2025, Centre Mixte de Formation Professionnelle d’Oujda. Baccalauréat sciences physiques, option français, 2022–2023, lycée Ennahda à Ahfir.',

    'contact-main':
      'Contact. Email : hji point sfn arobase gmail point com. WhatsApp : plus 212 641 454 572. Adresse : Oujda, Maroc.',

    'cv-download':
      'CV. Mon curriculum vitae est disponible au téléchargement. Utilisez le bouton Télécharger mon CV dans le hero, ou le bouton ci-dessous.',

    'game-info':
      'Jeu mémoire. Le portfolio inclut un mini-jeu mémoire avec classement top 5. Lancez une partie et tentez de battre votre record.',

    'project-myfood':
      'MyFood. Application mobile Kotlin et Jetpack Compose, avec backend Soupa base : authentification, PostgreSQL et stockage. Parcours complet client et espace de gestion pour restaurateurs. Technologies : Kotlin, Jetpack Compose, Soupa base et Android.',

    'project-pure-power-menu':
      'Pure Power Menu. Carte digitale interactive pour Pure Power, avec fiches produits Mass Gainer et Shred, macros nutritionnels, QR code par table et design mobile first. Technologies : TypeScript, React, Tailwind CSS et Vite.',

    'project-world-explorer':
      'World Explorer. Application web interactive pour découvrir le monde : données en temps réel, favoris, anecdotes générées par IA et design moderne. Gratuit et interactif. Technologies : JavaScript, React, Tailwind CSS et API.',

    'project-sultan-kunafa':
      'Sultan Kunafa. Landing page haut de gamme autour de la kunafa. Frontend optimisé pour la conversion et la commande via WhatsApp. Technologies : TypeScript, React, Tailwind CSS et Vite.',
  },

  en: {
    'about-main':
      'About. Full stack developer and professional bachelor student in computer science at SUP MTI. I am looking for a role to apply my skills in web development: HTML, CSS, PHP, JavaScript, React, Laravel, and software: Java and Kotlin. Curious and rigorous, I want to contribute to real projects within a dynamic team. Open to opportunities and available for work.',

    'about-availability':
      'Availability. I am looking for a role and available for work. Web development with HTML, CSS, PHP, JavaScript, React and Laravel, as well as Java and Kotlin.',

    'skills-overview':
      'Skills. Core stack: React, TypeScript, Laravel, Kotlin, Super base, and Docker. Frontend: HTML 5, CSS 3, JavaScript, TypeScript, React, Vite, Tailwind CSS, and Bootstrap. Backend: PHP, Python, Laravel, FastAPI, Node JS, Express JS, and REST API. Mobile and desktop: Kotlin, Jetpack Compose, React Native, Rust, and Tauri. Data and DevOps: MySQL, MongoDB, Oracle, Super base, Docker, Git and GitHub. Design: Figma, Canva, UI UX, responsive, and PWA.',

    'experience-list':
      'Experience. Freelance full stack developer, Morocco, remote, from 2024 to present. More than 33 public repos on GitHub. Dashboards, mobile apps in Kotlin and Compose, digital menus and showcase sites. Frontend developer at Pure Power, a fitness snack bar in Oujda, in 2026. Mobile first digital menu with per table QR codes. Internship in March 2025, one month, IT intern at the IT department of the Faculty of Sciences of Oujda, Mohammed First University.',

    'education-list':
      'Education. Professional bachelor in computer science, 2025–2026, SUP MTI school in Oujda, in progress. Specialized technician in digital development, 2023–2025, Professional Training Center in Oujda. High school diploma in physical sciences, French option, 2022–2023, Ennahda High School in Ahfir.',

    'contact-main':
      'Contact. Email: hji dot sfn at gmail dot com. WhatsApp: plus 212 641 454 572. Address: Oujda, Morocco.',

    'cv-download':
      'CV. My curriculum vitae is available for download. Use the Download my CV button in the hero, or the button below.',

    'game-info':
      'Memory game. The portfolio includes a memory matching game with a top 5 leaderboard. Play a round and try to beat your personal best.',

    'project-myfood':
      'MyFood. Kotlin and Jetpack Compose mobile app with a Super base backend: auth, PostgreSQL, and storage. Full customer journey and management space for restaurant owners. Technologies: Kotlin, Jetpack Compose, Super base, and Android.',

    'project-pure-power-menu':
      'Pure Power Menu. Interactive digital menu for Pure Power with Mass Gainer and Shred product pages, nutritional macros, per table QR codes, and mobile first design. Technologies: TypeScript, React, Tailwind CSS, and Vite.',

    'project-world-explorer':
      'World Explorer. Interactive web app to discover the world: real-time data, favorites, AI generated anecdotes, and modern design. Free and interactive. Technologies: JavaScript, React, Tailwind CSS, and API.',

    'project-sultan-kunafa':
      'Sultan Kunafa. High-end landing page highlighting the visual experience around kunafa. Frontend optimized for conversion and WhatsApp ordering. Technologies: TypeScript, React, Tailwind CSS, and Vite.',
  },
}

export function getGuideSpeechScript(chunkId: string, locale: Locale): string | null {
  const script = GUIDE_SPEECH_SCRIPTS[locale][chunkId]
  return script?.trim() ? script : null
}

/** Prefer curated script; otherwise build from display title + body. */
export function resolveGuideSpeechText(
  chunkId: string,
  title: string,
  body: string,
  locale: Locale,
): string {
  const script = getGuideSpeechScript(chunkId, locale)
  if (script) {
    return prepareGuideSpeechText(script, locale)
  }
  return buildGuideSpeechText(title, body, locale)
}
