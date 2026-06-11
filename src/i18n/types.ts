export type Locale = 'fr' | 'en'

export interface SkillCategoryTranslation {
  title: string
  description: string
}

export interface ProjectTranslation {
  title: string
  description: string
  longDescription: string
}

export interface ExperienceTranslation {
  period: string
  role: string
  company: string
  description: string
}

export interface EducationTranslation {
  year: string
  title: string
  description: string
  institution: string
}

export interface ExpertiseTranslation {
  title: string
  description: string
}

export interface SpokenLanguageTranslation {
  name: string
  level: string
}

export interface Translations {
  meta: {
    title: string
    description: string
    keywords: string[]
    locale: string
    inLanguage: string
    siteName: string
  }
  common: {
    skipToContent: string
    loading: string
    discover: string
    github: string
    demo: string
    details: string
    featured: string
    all: string
    current: string
    seeProject: string
    technos: string
    scrollToTop: string
  }
  nav: {
    about: string
    skills: string
    experience: string
    education: string
    projects: string
    interests: string
    game: string
    gameHintMessages: readonly string[]
    gameHintCta: string
    gameHintDismiss: string
    contact: string
    menu: string
    home: string
    mainNav: string
    mobileNav: string
    skillCategories: string
  }
  memoryGame: {
    title: string
    description: string
    time: string
    moves: string
    pairs: string
    gridSizeLabel: string
    sound: string
    restart: string
    start: string
    startHint: string
    playAgain: string
    soundOn: string
    soundOff: string
    boardLabel: string
    hiddenCard: string
    winTitle: string
    winMessage: string
    winStats: string
    backToPortfolio: string
    cards: {
      compass: string
      waves: string
      chess: string
      mountain: string
      moon: string
      palm: string
      camera: string
      coffee: string
      plane: string
      book: string
      music: string
      star: string
      sun: string
      anchor: string
      flower: string
      globe: string
      sparkles: string
      diamond: string
    }
  }
  hero: {
    viewProjects: string
    contactMe: string
    aboutAria: string
  }
  about: {
    title: string
    description: string
  }
  profile: {
    title: string
    tagline: string
    bio: [string, string]
    expertise: ExpertiseTranslation[]
  }
  skills: {
    title: string
    description: string
    coreStack: string
    githubProjects: string
    categories: {
      frontend: SkillCategoryTranslation
      backend: SkillCategoryTranslation
      mobile: SkillCategoryTranslation
      data: SkillCategoryTranslation
      design: SkillCategoryTranslation
    }
  }
  experience: {
    title: string
    description: string
    items: {
      freelance: ExperienceTranslation
      purePower: ExperienceTranslation
      cmfp: ExperienceTranslation
    }
  }
  education: {
    title: string
    description: string
    items: {
      tsdd: EducationTranslation
      bac: EducationTranslation
    }
  }
  projects: {
    title: string
    description: string
    noResults: string
    items: {
      myfood: ProjectTranslation
      'pure-power-menu': ProjectTranslation
      'world-explorer': ProjectTranslation
      'sultan-kunafa': ProjectTranslation
    }
  }
  interests: {
    title: string
    description: string
    swimming: string
    chess: string
    travel: string
  }
  contact: {
    title: string
    description: string
    info: string
    spokenLanguages: string
    formTitle: string
    formDescription: string
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    message: string
    messagePlaceholder: string
    submit: string
    submitSoon: string
    submitting: string
    labels: {
      email: string
      whatsapp: string
      address: string
    }
    spoken: {
      ar: SpokenLanguageTranslation
      fr: SpokenLanguageTranslation
      en: SpokenLanguageTranslation
    }
  }
  footer: {
    rights: string
    builtWith: string
  }
  theme: {
    light: string
    dark: string
  }
  language: {
    toggle: string
    fr: string
    en: string
  }
  validation: {
    nameMin: string
    nameMax: string
    emailInvalid: string
    messageMin: string
    messageMax: string
  }
  toast: {
    sending: string
    success: string
    successDescription: string
    error: string
    errorDescription: string
    submitError: string
  }
}
