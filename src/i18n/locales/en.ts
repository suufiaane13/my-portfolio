import type { Translations } from '@/i18n/types'

export const en: Translations = {
  meta: {
    title: 'Soufiane HAJJI — Full-Stack Developer & UI/UX Designer',
    description:
      'Portfolio of Soufiane HAJJI. Full-Stack Developer & UI/UX Designer specializing in React, TypeScript, Node.js, and Tailwind CSS.',
    keywords: [
      'developer',
      'full-stack',
      'ui/ux',
      'react',
      'typescript',
      'node.js',
      'portfolio',
      'freelance',
      'morocco',
    ],
    locale: 'en_US',
    inLanguage: 'en-US',
    siteName: 'Soufiane HAJJI Portfolio',
  },
  common: {
    skipToContent: 'Skip to content',
    loading: 'Loading',
    discover: 'Discover',
    github: 'GitHub',
    demo: 'Demo',
    details: 'Details',
    featured: 'Featured',
    all: 'All',
    current: 'Current',
    seeProject: 'View',
    technos: 'technologies',
    scrollToTop: 'Scroll back to top',
  },
  nav: {
    about: 'About',
    skills: 'Skills',
    experience: 'Experience',
    education: 'Education',
    projects: 'Projects',
    interests: 'Interests',
    game: 'Game',
    gameHintMessages: [
      'Try the memory game!',
      'Need a break? Play a round 🎮',
      'Challenge: match every pair!',
    ],
    gameHintCta: 'Play',
    gameHintDismiss: 'Dismiss',
    contact: 'Contact',
    menu: 'Menu',
    home: 'Back to home',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile navigation',
    skillCategories: 'Skill categories',
  },
  hero: {
    viewProjects: 'View my projects',
    contactMe: 'Contact me',
    aboutAria: 'Go to about section',
  },
  about: {
    title: 'About me',
    description: 'Full-Stack developer passionate about technological innovation',
  },
  profile: {
    title: 'Full-Stack Developer & UI/UX Designer',
    tagline:
      'React, Laravel, Rust & Tauri — I build web apps, mobile apps, and tools for startups and freelance clients.',
    bio: [
      'Full-stack developer based in Morocco, specializing in React, TypeScript, Laravel, and mobile-first applications. 30+ open-source projects on GitHub, from landing pages to business management tools.',
      'My approach combines polished design, maintainable code, and fast delivery — dashboards, e-commerce, Android apps, and offline business tools.',
    ],
    expertise: [
      { title: 'Frontend', description: 'React, Vite, Tailwind CSS v4, TypeScript' },
      { title: 'Backend', description: 'Laravel, PHP, Python, FastAPI, Supabase' },
      { title: 'Mobile', description: 'Kotlin, Jetpack Compose, React Native' },
      { title: 'Systems', description: 'Rust, Tauri, Docker, Oracle DB' },
    ],
  },
  skills: {
    title: 'Skills',
    description: 'Stack organized by domain — focused on what I use in production',
    coreStack: 'Core stack',
    githubProjects: 'GitHub projects',
    categories: {
      frontend: {
        title: 'Front-end',
        description: 'Modern, performant, and accessible interfaces.',
      },
      backend: {
        title: 'Back-end',
        description: 'REST APIs, business logic, and maintainable architectures.',
      },
      mobile: {
        title: 'Mobile & Desktop',
        description: 'Native and cross-platform applications.',
      },
      data: {
        title: 'Data & DevOps',
        description: 'Databases, deployment, and production workflows.',
      },
      design: {
        title: 'Design',
        description: 'UI/UX, prototyping, and design systems.',
      },
    },
  },
  experience: {
    title: 'Experience',
    description: 'My professional journey and concrete achievements',
    items: {
      freelance: {
        period: '2024 — Present',
        role: 'Freelance Full-Stack Developer',
        company: 'Morocco · Remote',
        description:
          '33+ public repos on GitHub. Dashboards, mobile apps (Kotlin/Compose), digital menus, medical management (Oracle/FastAPI), and showcase sites for local clients.',
      },
      purePower: {
        period: '2026',
        role: 'Frontend Developer',
        company: 'Pure Power — Fitness snack, Oujda',
        description:
          'Built a mobile-first digital menu: interactive menu, macro cards, per-table QR codes, and production deployment.',
      },
      cmfp: {
        period: '2023 — 2025',
        role: 'Specialized Technician — Digital Development',
        company: 'Professional Training Center, Oujda',
        description:
          'Academic Laravel/Blade projects: library, IT inventory, e-learning, business management. Strong foundations in PHP, MySQL, and Agile methodology.',
      },
    },
  },
  education: {
    title: 'Education',
    description: 'My academic background',
    items: {
      tsdd: {
        year: '2023–2025',
        title: 'Specialized Technician in Digital Development',
        description: 'Training in web and mobile development',
        institution: 'Professional Training Center, Oujda',
      },
      bac: {
        year: '2022–2023',
        title: 'High School Diploma in Physical Sciences — French Option',
        description: 'Baccalaureate with specialization in physical sciences',
        institution: 'Ennahda High School, Ahfir',
      },
    },
  },
  projects: {
    title: 'My work',
    description: 'Projects I have built',
    noResults: 'No projects for this filter.',
    items: {
      myfood: {
        title: 'MyFood',
        description:
          'Android food ordering app: menu, cart, delivery, and restaurant management space.',
        longDescription:
          'Kotlin + Jetpack Compose mobile app with Supabase backend (Auth, PostgreSQL, Storage). Full customer journey and management space for restaurant owners.',
      },
      'pure-power-menu': {
        title: 'Pure Power Menu',
        description:
          'Mobile-first digital menu for a fitness snack bar in Oujda — macros, table QR codes, React + Tailwind v4.',
        longDescription:
          'Interactive digital menu for Pure Power with Mass Gainer & Shred product pages, nutritional macros, per-table QR codes, and mobile-first design.',
      },
      'world-explorer': {
        title: 'World Explorer',
        description:
          'Explore 195+ countries, their cultures, capitals, and populations. Real-time info and AI anecdotes.',
        longDescription:
          'Interactive web app to discover the world: real-time data, favorites, AI-generated anecdotes, and modern design. Free and interactive.',
      },
      'sultan-kunafa': {
        title: 'Sultan Kunafa',
        description:
          'Premium showcase site for an oriental desserts brand — quick ordering via WhatsApp.',
        longDescription:
          'High-end landing page highlighting the visual experience around kunafa. Frontend optimized for conversion and WhatsApp ordering.',
      },
    },
  },
  interests: {
    title: 'Interests',
    description: 'What I enjoy outside of code',
    swimming: 'Swimming',
    chess: 'Chess',
    travel: 'Travel',
  },
  memoryGame: {
    title: 'Memory Game',
    description: 'Match the icon pairs — travel, nature and passions at a glance',
    time: 'Time',
    moves: 'Moves',
    pairs: 'Pairs',
    gridSizeLabel: 'Grid size',
    sound: 'Sound',
    restart: 'Restart',
    start: 'Start',
    startHint: 'Pick a grid size, then start the game.',
    playAgain: 'Play again',
    soundOn: 'Enable sound',
    soundOff: 'Mute sound',
    boardLabel: 'Memory game board',
    hiddenCard: 'Hidden card',
    winTitle: 'You Win!',
    winMessage: 'Congratulations! All pairs matched 🚀',
    winStats: '{{moves}} moves in {{time}}',
    backToPortfolio: 'Back to portfolio',
    leaderboard: {
      title: 'Leaderboard',
      loading: 'Loading leaderboard…',
      empty: 'No scores yet — be the first!',
      nameLabel: 'Your nickname',
      namePlaceholder: 'e.g. Soufiane',
      nameError: 'Invalid nickname (2–20 characters, letters/numbers).',
      submit: 'Save score',
      success: 'Score saved!',
      successRank: 'Score saved — you rank #{{rank}}!',
      submitError: 'Could not save score. Please try again.',
      rateLimit: 'Too many attempts — try again in a minute.',
    },
    cards: {
      compass: 'Compass',
      waves: 'Waves',
      chess: 'Chess',
      mountain: 'Mountain',
      moon: 'Moon',
      palm: 'Palm',
      camera: 'Camera',
      coffee: 'Coffee',
      plane: 'Plane',
      book: 'Book',
      music: 'Music',
      star: 'Star',
      sun: 'Sun',
      anchor: 'Anchor',
      flower: 'Flower',
      globe: 'Globe',
      sparkles: 'Sparkles',
      diamond: 'Diamond',
    },
  },
  contact: {
    title: 'Contact',
    description:
      "Let's talk about your next project. I'm available for collaborations and opportunities.",
    info: 'Information',
    spokenLanguages: 'Languages',
    formTitle: 'Send me a message',
    formDescription: 'Fill out the form below — I usually reply within 24–48 hours.',
    formUnavailable:
      'Form temporarily unavailable. Please reach me by email or WhatsApp.',
    name: 'Full name *',
    namePlaceholder: 'Your name',
    email: 'Email *',
    emailPlaceholder: 'you@email.com',
    message: 'Message *',
    messagePlaceholder: 'Describe your project or request...',
    submit: 'Send message',
    submitSoon: 'Soon',
    submitting: 'Sending...',
    labels: {
      email: 'Email',
      whatsapp: 'WhatsApp',
      address: 'Address',
    },
    spoken: {
      ar: { name: 'Arabic', level: 'Native language' },
      fr: { name: 'French', level: 'Fluent' },
      en: { name: 'English', level: 'Fluent' },
    },
  },
  footer: {
    rights: 'All rights reserved.',
    builtWith: 'Built with React & Vite',
  },
  theme: {
    light: 'Switch to light mode',
    dark: 'Switch to dark mode',
  },
  language: {
    toggle: 'Change language',
    fr: 'Français',
    en: 'English',
  },
  validation: {
    nameMin: 'Name must be at least 2 characters',
    nameMax: 'Name is too long',
    emailInvalid: 'Invalid email address',
    messageMin: 'Message must be at least 10 characters',
    messageMax: 'Message is too long',
  },
  toast: {
    sending: 'Sending message...',
    success: 'Message sent successfully!',
    successDescription: 'I will get back to you as soon as possible.',
    error: 'Error while sending',
    errorDescription: 'Check your connection and try again.',
    submitError: 'Error while sending the message',
    rateLimit: 'Too many messages sent',
    rateLimitDescription: 'Try again in an hour or contact me on WhatsApp.',
  },
}
