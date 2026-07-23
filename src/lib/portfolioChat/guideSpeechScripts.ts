import type { Locale } from '@/i18n/types'
import { buildGuideSpeechText, prepareGuideSpeechText } from '@/lib/guideSpeechText'

/**
 * Curated TTS scripts per guide chunk (rewritten for natural narration).
 * Regenerate with: npm run guide:scripts
 */
const GUIDE_SPEECH_SCRIPTS: Record<Locale, Record<string, string>> = {
  fr: {
    'about-main':
      'À propos de moi. Je suis Soufiane HAJJI, développeur full-stack et actuellement étudiant en licence professionnelle informatique à Sup M T I Oujda. Curieux et rigoureux, je souhaite mettre en pratique mes compétences en web et mobile, notamment avec React, Laravel, Java et Kotlin. Je suis à la recherche d\'un poste ou de missions concrètes pour contribuer à des projets ambitieux au sein d\'une équipe dynamique.',

    'about-availability':
      'Concernant ma disponibilité, je suis actuellement à la recherche d’un poste et disponible pour de nouvelles missions. Je peux intervenir en développement web et mobile avec des technologies comme React, Laravel, Java ou Kotlin.',

    'skills-overview':
      'Mes compétences. Ma stack principale regroupe React, TypeScript, Laravel, Kotlin, Superbase et Docker. Côté front-end, j\'utilise JavaScript, React, Tailwind CSS et Vite. Côté back-end et données, je maîtrise PHP, Python, Laravel, Node JS, MySQL et Superbase. Je développe aussi sur mobile avec Kotlin et Jetpack Compose, tout en concevant des interfaces U I U X soignées sur Figma.',

    'experience-list':
      'Mon parcours. Depuis 2024, je travaille comme développeur full-stack freelance à distance, avec plus de 33 projets publics sur GitHub, allant des applications mobiles en Kotlin aux dashboards. Chez Pure Power à Oujda, j\'ai conçu un menu digital mobile-first avec Q R code par table. J\'ai également effectué un stage d\'un mois au service informatique de la Faculté des Sciences d\'Oujda.',

    'education-list':
      'Ma formation. Je prépare une licence professionnelle en informatique à l\'école Sup M T I Oujda pour l\'année 2025-2026. Auparavant, j\'ai obtenu mon diplôme de technicien spécialisé en développement digital au Centre Mixte de Formation Professionnelle d\'Oujda, après un baccalauréat en sciences physiques au lycée Ennahda d\'Ahfir.',

    'contact-main':
      'Pour me contacter. Vous pouvez m\'envoyer un email à hji point sfn arobase gmail point com, ou me joindre sur WhatsApp au plus 212 6 41 45 45 72. Je suis basé à Oujda, au Maroc.',

    'cv-download':
      'Mon C V est disponible au téléchargement. Vous pouvez le récupérer directement en utilisant le bouton Télécharger mon C V dans l\'en-tête, ou via le bouton situé juste ci-dessous.',

    'game-info':
      'Une pause ludique ? Ce portfolio intègre un mini-jeu de mémoire avec un classement du top 5. Lancez une partie et tentez de battre votre record !',

    'project-myfood':
      'Le projet MyFood est une application mobile développée en Kotlin et Jetpack Compose, connectée à un back-end Superbase. Elle offre un parcours client complet et un espace de gestion pour les restaurateurs, avec authentification et base de données PostgreSQL.',

    'project-pure-power-menu':
      'Pure Power Menu est une carte digitale interactive créée pour le snack fitness Pure Power à Oujda. Elle propose un affichage des valeurs nutritionnelles, un accès par Q R code par table et un design pensé d\'abord pour le mobile, développé avec React, TypeScript et Tailwind CSS.',

    'project-world-explorer':
      'World Explorer est une application web interactive pour découvrir le monde grâce à des données en temps réel, un système de favoris et des anecdotes générées par intelligence artificielle. Le projet a été conçu avec JavaScript, React et Tailwind CSS.',

    'project-sultan-kunafa':
      'Sultan Kunafa est une landing page haut de gamme conçue pour mettre en valeur la kunafa. Son interface est optimisée pour la conversion et la prise de commande directe via WhatsApp, réalisée avec React, TypeScript, Vite et Tailwind CSS.',
  },

  en: {
    'about-main':
      'About me. I am a full stack developer and professional bachelor student in computer science at SUP MTI. I am excited to apply my skills across web development using HTML, CSS, PHP, JavaScript, React, and Laravel, alongside software projects in Java and Kotlin. Curious and rigorous, I want to contribute to real-world projects within a dynamic team. I am open to new opportunities and ready for work.',

    'about-availability':
      'Availability. I am actively looking for a new role and ready to start work immediately. My primary focus includes web development with HTML, CSS, PHP, JavaScript, React, and Laravel, as well as software development in Java and Kotlin.',

    'skills-overview':
      'Skills overview. My core stack includes React, TypeScript, Laravel, Kotlin, Superbase, and Docker. On the frontend, I work with HTML 5, CSS 3, JavaScript, TypeScript, React, Vite, Tailwind CSS, and Bootstrap. For backend development, I use PHP, Python, Laravel, FastAPI, Node JS, Express JS, and REST APIs. Mobile and desktop tech includes Kotlin, Jetpack Compose, React Native, Rust, and Tauri. For data and DevOps, I rely on MySQL, MongoDB, Oracle, Superbase, Docker, Git, and GitHub, accompanied by UI UX design in Figma and responsive PWAs.',

    'experience-list':
      'Professional experience. As a remote freelance full stack developer in Morocco since 2024, I have created over 33 public repositories on GitHub, building dashboards, mobile apps in Kotlin and Compose, digital menus, and showcase sites. In 2026, I served as frontend developer at Pure Power fitness snack bar in Oujda, delivering a mobile-first digital menu with per-table QR codes. In March 2025, I completed a one-month IT internship at the Faculty of Sciences IT department at Mohammed First University in Oujda.',

    'education-list':
      'Education background. I am currently pursuing a Professional Bachelor in Computer Science at SUP MTI in Oujda for the 2025 to 2026 academic year. Prior to this, I completed a Specialized Technician diploma in digital development at the Professional Training Center in Oujda from 2023 to 2025. I earned my high school diploma in physical sciences, French option, at Ennahda High School in Ahfir in 2023.',

    'contact-main':
      'Contact information. You can reach me by email at hji dot sfn at gmail dot com, or on WhatsApp at plus 212 641 454 572. I am located in Oujda, Morocco.',

    'cv-download':
      'Curriculum Vitae. My resume is available for instant download. Feel free to click the Download my CV button in the hero banner, or click the button down below.',

    'game-info':
      'Memory game. This portfolio features an interactive memory matching game with a top 5 leaderboard. Take a moment to play a round and set a new high score!',

    'project-myfood':
      'MyFood project. A mobile application crafted with Kotlin and Jetpack Compose, powered by a Superbase backend for authentication, PostgreSQL, and storage. It supports a full customer journey alongside a management dashboard for restaurant owners using Kotlin, Jetpack Compose, Superbase, and Android.',

    'project-pure-power-menu':
      'Pure Power Menu. An interactive digital menu created for Pure Power, showcasing Mass Gainer and Shred product pages, nutritional macro information, and per-table QR code access in a mobile-first layout built with TypeScript, React, Tailwind CSS, and Vite.',

    'project-world-explorer':
      'World Explorer. An interactive web application for exploring global insights featuring real-time data, custom favorites, AI-generated anecdotes, and a modern UI. Built with JavaScript, React, Tailwind CSS, and external APIs.',

    'project-sultan-kunafa':
      'Sultan Kunafa. A high-end landing page designed to offer a visual experience around kunafa. Optimized for frontend conversions and direct WhatsApp ordering using TypeScript, React, Tailwind CSS, and Vite.',
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
