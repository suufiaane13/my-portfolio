import type { Translations } from '@/i18n/types'

export const fr: Translations = {
  meta: {
    title: 'Soufiane HAJJI — Développeur Full-Stack & UI/UX Designer',
    description:
      'Portfolio de Soufiane HAJJI. Développeur Full-Stack & UI/UX Designer spécialisé en React, TypeScript, Node.js et Tailwind CSS.',
    keywords: [
      'développeur',
      'full-stack',
      'ui/ux',
      'react',
      'typescript',
      'node.js',
      'portfolio',
      'freelance',
      'maroc',
    ],
    locale: 'fr_FR',
    inLanguage: 'fr-FR',
    siteName: 'Soufiane HAJJI Portfolio',
  },
  common: {
    skipToContent: 'Aller au contenu',
    loading: 'Chargement',
    discover: 'Découvrir',
    github: 'GitHub',
    demo: 'Demo',
    details: 'Détails',
    featured: 'Featured',
    all: 'Tous',
    current: 'En cours',
    seeProject: 'Voir',
    technos: 'technos',
    scrollToTop: 'Remonter en haut de la page',
  },
  nav: {
    about: 'À propos',
    skills: 'Compétences',
    experience: 'Expérience',
    education: 'Formation',
    projects: 'Projets',
    interests: 'Intérêts',
    game: 'Jeu',
    gameHintMessages: [
      'Essaie le jeu des paires !',
      'Une pause ? Lance une partie 🎮',
      'Défi : retrouve toutes les paires !',
    ],
    gameHintCta: 'Jouer',
    gameHintDismiss: 'Fermer',
    contact: 'Contact',
    menu: 'Menu',
    home: "Retour à l'accueil",
    mainNav: 'Navigation principale',
    mobileNav: 'Navigation mobile',
    skillCategories: 'Catégories de compétences',
  },
  hero: {
    viewProjects: 'Voir mes projets',
    contactMe: 'Me contacter',
    aboutAria: 'Aller à la section à propos',
  },
  about: {
    title: 'À propos de moi',
    description: "Développeur Full-Stack passionné par l'innovation technologique",
  },
  profile: {
    title: 'Développeur Full-Stack & UI/UX Designer',
    tagline:
      'React, Laravel, Rust & Tauri — je construis des apps web, mobiles et outils pour startups et clients freelance.',
    bio: [
      'Développeur full-stack basé au Maroc, spécialisé en React, TypeScript, Laravel et applications mobile-first. Plus de 30 projets open source sur GitHub, du site vitrine à la gestion métier.',
      'Mon approche combine design soigné, code maintenable et livraison rapide — dashboards, e-commerce, apps Android et outils métier offline.',
    ],
    expertise: [
      { title: 'Frontend', description: 'React, Vite, Tailwind CSS v4, TypeScript' },
      { title: 'Backend', description: 'Laravel, PHP, Python, FastAPI, Supabase' },
      { title: 'Mobile', description: 'Kotlin, Jetpack Compose, React Native' },
      { title: 'Systèmes', description: 'Rust, Tauri, Docker, Oracle DB' },
    ],
  },
  skills: {
    title: 'Compétences',
    description: "Stack organisée par domaine — focus sur ce que j'utilise en production",
    coreStack: 'Stack principale',
    githubProjects: 'projets GitHub',
    categories: {
      frontend: {
        title: 'Front-end',
        description: 'Interfaces modernes, performantes et accessibles.',
      },
      backend: {
        title: 'Back-end',
        description: 'APIs REST, logique métier et architectures maintenables.',
      },
      mobile: {
        title: 'Mobile & Desktop',
        description: 'Applications natives et cross-platform.',
      },
      data: {
        title: 'Data & DevOps',
        description: 'Bases de données, déploiement et workflows de production.',
      },
      design: {
        title: 'Design',
        description: 'UI/UX, prototypage et design systems.',
      },
    },
  },
  experience: {
    title: 'Expérience',
    description: 'Mon parcours professionnel et mes réalisations concrètes',
    items: {
      freelance: {
        period: '2024 — Présent',
        role: 'Développeur Full-Stack Freelance',
        company: 'Maroc · Remote',
        description:
          '33+ repos publics sur GitHub. Dashboards, apps mobile (Kotlin/Compose), menus digitaux, gestion médicale (Oracle/FastAPI) et sites vitrine pour clients locaux.',
      },
      purePower: {
        period: '2026',
        role: 'Développeur Frontend',
        company: 'Pure Power — Snack fitness, Oujda',
        description:
          'Création du menu digital mobile-first : carte interactive, fiches macros, QR code par table et déploiement en production.',
      },
      cmfp: {
        period: '2023 — 2025',
        role: 'Technicien Spécialisé — Développement Digital',
        company: 'Centre Mixte de Formation Professionnelle, Oujda',
        description:
          'Projets académiques Laravel/Blade : bibliothèque, inventaire IT, e-learning, gestion commerciale. Bases solides PHP, MySQL et méthode Agile.',
      },
    },
  },
  education: {
    title: 'Formation',
    description: 'Mon parcours académique',
    items: {
      tsdd: {
        year: '2023–2025',
        title: 'Technicien Spécialisé en Développement Digital',
        description: 'Formation en développement web et mobile',
        institution: 'Centre Mixte de Formation Professionnelle, Oujda',
      },
      bac: {
        year: '2022–2023',
        title: 'Baccalauréat Sciences Physiques — Option Français',
        description: 'Diplôme du baccalauréat avec spécialisation en sciences physiques',
        institution: 'Lycée Ennahda, Ahfir',
      },
    },
  },
  projects: {
    title: 'Mes réalisations',
    description: "Projets que j'ai développés",
    noResults: 'Aucun projet pour ce filtre.',
    items: {
      myfood: {
        title: 'MyFood',
        description:
          'App Android de commande de plats : menu, panier, livraison et espace restaurateur.',
        longDescription:
          'Application mobile Kotlin + Jetpack Compose avec backend Supabase (Auth, PostgreSQL, Storage). Parcours complet client et espace de gestion pour restaurateurs.',
      },
      'pure-power-menu': {
        title: 'Pure Power Menu',
        description:
          'Menu digital mobile-first pour snack fitness à Oujda — macros, QR code table, React + Tailwind v4.',
        longDescription:
          'Carte digitale interactive pour Pure Power avec fiches produits Mass Gainer & Shred, macros nutritionnels, QR code par table et design mobile-first.',
      },
      'world-explorer': {
        title: 'World Explorer',
        description:
          'Explorez 195+ pays, leurs cultures, capitales et populations. Infos temps réel et anecdotes IA.',
        longDescription:
          'Application web interactive pour découvrir le monde : données en temps réel, favoris, anecdotes générées par IA et design moderne. Gratuit et interactif.',
      },
      'sultan-kunafa': {
        title: 'Sultan Kunafa',
        description:
          'Site vitrine premium pour marque de desserts orientaux — commande rapide via WhatsApp.',
        longDescription:
          "Landing page haut de gamme mettant en valeur l'expérience visuelle autour de la kunafa. Frontend optimisé pour la conversion et la commande via WhatsApp.",
      },
    },
  },
  interests: {
    title: "Centres d'intérêt",
    description: 'Ce qui me passionne en dehors du code',
    swimming: 'Natation',
    chess: "Jeu d'échecs",
    travel: 'Voyages',
  },
  memoryGame: {
    title: 'Jeu des paires',
    description: 'Retrouvez les paires d’icônes — voyage, nature et passions en un clin d’œil',
    time: 'Temps',
    moves: 'Coups',
    pairs: 'Paires',
    gridSizeLabel: 'Taille de la grille',
    sound: 'Son',
    restart: 'Recommencer',
    start: 'Commencer',
    startHint: 'Choisissez la grille, puis lancez la partie.',
    playAgain: 'Rejouer',
    soundOn: 'Activer le son',
    soundOff: 'Couper le son',
    boardLabel: 'Plateau du jeu des paires',
    hiddenCard: 'Carte cachée',
    winTitle: 'Bravo !',
    winMessage: 'Félicitations ! Toutes les paires sont réunies 🚀',
    winStats: '{{moves}} coups en {{time}}',
    backToPortfolio: 'Retour au portfolio',
    leaderboard: {
      title: 'Classement',
      loading: 'Chargement du classement…',
      empty: 'Aucun score pour l’instant — soyez le premier !',
      nameLabel: 'Votre pseudo',
      namePlaceholder: 'Ex. Soufiane',
      nameError: 'Pseudo invalide (2 à 20 caractères, lettres/chiffres).',
      submit: 'Enregistrer le score',
      success: 'Score enregistré !',
      successRank: 'Score enregistré — vous êtes {{rank}}ᵉ !',
      submitError: 'Impossible d’enregistrer le score. Réessayez.',
      rateLimit: 'Trop de tentatives — réessayez dans une minute.',
    },
    cards: {
      compass: 'Boussole',
      waves: 'Vagues',
      chess: 'Échecs',
      mountain: 'Montagne',
      moon: 'Lune',
      palm: 'Palmier',
      camera: 'Photo',
      coffee: 'Café',
      plane: 'Avion',
      book: 'Livre',
      music: 'Musique',
      star: 'Étoile',
      sun: 'Soleil',
      anchor: 'Ancre',
      flower: 'Fleur',
      globe: 'Globe',
      sparkles: 'Éclat',
      diamond: 'Diamant',
    },
  },
  contact: {
    title: 'Contact',
    description:
      'Discutons de votre prochain projet. Je suis disponible pour des collaborations et opportunités.',
    info: 'Informations',
    spokenLanguages: 'Langues',
    formTitle: 'Envoyez-moi un message',
    formDescription: 'Remplissez le formulaire ci-dessous — je vous réponds sous 24–48 h.',
    formUnavailable:
      'Formulaire temporairement indisponible. Contactez-moi par email ou WhatsApp.',
    name: 'Nom complet *',
    namePlaceholder: 'Votre nom',
    email: 'Email *',
    emailPlaceholder: 'votre@email.com',
    message: 'Message *',
    messagePlaceholder: 'Décrivez votre projet ou votre demande...',
    submit: 'Envoyer le message',
    submitSoon: 'Bientôt',
    submitting: 'Envoi en cours...',
    labels: {
      email: 'Email',
      whatsapp: 'WhatsApp',
      address: 'Adresse',
    },
    spoken: {
      ar: { name: 'Arabe', level: 'Langue maternelle' },
      fr: { name: 'Français', level: 'Courant' },
      en: { name: 'Anglais', level: 'Courant' },
    },
  },
  footer: {
    rights: 'Tous droits réservés.',
    builtWith: 'Développé avec React & Vite',
  },
  theme: {
    light: 'Activer le mode clair',
    dark: 'Activer le mode sombre',
  },
  language: {
    toggle: 'Changer de langue',
    fr: 'Français',
    en: 'English',
  },
  validation: {
    nameMin: 'Le nom doit contenir au moins 2 caractères',
    nameMax: 'Le nom est trop long',
    emailInvalid: 'Adresse email invalide',
    messageMin: 'Le message doit contenir au moins 10 caractères',
    messageMax: 'Le message est trop long',
  },
  toast: {
    sending: 'Envoi du message en cours...',
    success: 'Message envoyé avec succès !',
    successDescription: 'Je vous répondrai dans les plus brefs délais.',
    error: "Erreur lors de l'envoi",
    errorDescription: 'Vérifiez votre connexion et réessayez.',
    submitError: "Erreur lors de l'envoi du message",
    rateLimit: 'Trop de messages envoyés',
    rateLimitDescription: 'Réessayez dans une heure ou contactez-moi par WhatsApp.',
  },
}
