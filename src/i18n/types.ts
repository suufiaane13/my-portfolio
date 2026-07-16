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
    languages: string
    game: string
    gameHintMessages: readonly string[]
    gameHintCta: string
    gameHintBadge: string
    gameHintDismiss: string
    contact: string
    login: string
    admin: string
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
    personalBest: string
    personalBestStats: string
    newRecord: string
    backToPortfolio: string
    leaderboard: {
      title: string
      loading: string
      empty: string
      nameLabel: string
      namePlaceholder: string
      nameError: string
      submit: string
      success: string
      successRank: string
      submitError: string
      rateLimit: string
      wakingUp: string
    }
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
    downloadCv: string
    aboutAria: string
  }
  chatbot: {
    title: string
    subtitle: string
    badge: string
    /** FAB label under badge, e.g. Guide Soufiane */
    fabName: string
    open: string
    close: string
    backToMenu: string
    chooseProject: string
    listenAgain: string
    stopSpeech: string
    speaking: string
    menu: {
      about: string
      freelance: string
      skills: string
      projects: string
      experience: string
      education: string
      contact: string
      cv: string
      game: string
    }
    quickReplies: {
      skills: string
      projects: string
      freelance: string
      contact: string
      cv: string
      game: string
    }
    actions: {
      viewSection: string
    }
    templates: {
      intro: string
      greeting: string
      thanks: string
      fallback: string
      projectPrefix: string
      cvAvailable: string
      gameIntro: string
      coreStack: string
      location: string
      emailLabel: string
      whatsappLabel: string
      socialTitle: string
    }
  }
  newsletter: {
    title: string
    description: string
    placeholder: string
    subscribe: string
    success: string
    alreadySubscribed: string
    error: string
  }
  about: {
    title: string
    description: string
  }
  profile: {
    title: string
    tagline: string
    availability: string
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
      fsoStage: ExperienceTranslation
    }
  }
  education: {
    title: string
    description: string
    items: {
      licence: EducationTranslation
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
  languages: {
    title: string
    description: string
    footnote: string
  }
  contact: {
    title: string
    description: string
    info: string
    spokenLanguages: string
    formTitle: string
    name: string
    namePlaceholder: string
    email: string
    emailPlaceholder: string
    message: string
    messagePlaceholder: string
    submit: string
    submitSoon: string
    submitting: string
    formUnavailable: string
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
    rateLimit: string
    rateLimitDescription: string
    wakingUp: string
    wakingUpDescription: string
  }
  auth: {
    loginTitle: string
    loginDescription: string
    email: string
    emailPlaceholder: string
    password: string
    passwordPlaceholder: string
    passwordMin: string
    signIn: string
    signingIn: string
    loginSuccess: string
    loginError: string
    invalidCredentials: string
    notAdmin: string
    notConfigured: string
    /** Use {{minutes}} placeholder */
    rateLimit: string
    backToSite: string
    forgotPassword: string
    forgotPasswordTitle: string
    forgotPasswordDescription: string
    sendResetLink: string
    sendingReset: string
    resetEmailSent: string
    resetEmailError: string
    backToLogin: string
    resetPasswordTitle: string
    resetPasswordDescription: string
    newPassword: string
    confirmPassword: string
    passwordMismatch: string
    updatePassword: string
    updatingPassword: string
    passwordUpdated: string
    passwordUpdateError: string
  }
  admin: {
    title: string
    navLabel: string
    signOut: string
    themeLight: string
    themeDark: string
    openMenu: string
    closeMenu: string
    pagination: {
      previous: string
      next: string
      pageOf: string
      showing: string
    }
    deleteDialog: {
      title: string
      cancel: string
      confirm: string
      deleting: string
    }
    nav: {
      dashboard: string
      content: string
      messages: string
      analytics: string
      scores: string
      newsletter: string
    }
    dashboard: {
      welcome: string
      subtitle: string
      unreadMessages: string
      events7d: string
      events30d: string
      totalScores: string
      newsletterSubscribers: string
      quickLinks: string
      topEvents: string
      noEvents: string
    }
    messages: {
      subtitle: string
      empty: string
      updateSuccess: string
      updateError: string
      filters: {
        all: string
      }
      status: {
        new: string
        read: string
        replied: string
        spam: string
      }
      actions: {
        reply: string
        markRead: string
        markReplied: string
        markSpam: string
      }
      searchPlaceholder: string
      delete: string
      confirmDelete: string
      deleteSuccess: string
      deleteError: string
    }
    analytics: {
      subtitle: string
      empty: string
      columns: {
        type: string
        path: string
        detail: string
        date: string
      }
      eventTypes: Record<string, string>
      dailyChart: string
      dailyChartDesc: string
    }
    newsletter: {
      subtitle: string
      empty: string
      delete: string
      confirmDelete: string
      deleteSuccess: string
      deleteError: string
      columns: {
        email: string
        locale: string
        source: string
        date: string
      }
    }
    scores: {
      subtitle: string
      empty: string
      delete: string
      confirmDelete: string
      deleteSuccess: string
      deleteError: string
      columns: {
        rank: string
        player: string
        grid: string
        moves: string
        time: string
        date: string
      }
    }
    content: {
      hubTitle: string
      hubDescription: string
      backToDashboard: string
      backToHub: string
      edit: string
      save: string
      saveSuccess: string
      saveError: string
      create: string
      createSuccess: string
      createExperience: string
      createEducation: string
      createCategory: string
      createSkill: string
      createInterest: string
      createLanguage: string
      createSocial: string
      delete: string
      confirmDelete: string
      confirmDeleteItem: string
      deleteSuccess: string
      deleteError: string
      upload: string
      uploading: string
      uploadSuccess: string
      uploadError: string
      uploadInvalidType: string
      uploadTooLarge: string
      uploadNotConfigured: string
      orUploadUrl: string
      currentFile: string
      noFileSelected: string
      expandSection: string
      collapseSection: string
      uploadAvatarHint: string
      uploadCvHint: string
      uploadProjectHint: string
      uploadMissingSlug: string
      published: string
      validation: {
        slugRequired: string
        slugInvalid: string
        titleRequired: string
        urlInvalid: string
      }
      draft: string
      empty: string
      preview: string
      selectItem: string
      backToList: string
      allPublished: string
      draftsCount: string
      itemCount: string
      tabs: {
        identity: string
        texts: string
        links: string
        more: string
      }
      groups: {
        identity: string
        identityDesc: string
        publicTexts: string
        publicTextsDesc: string
        linksMedia: string
        linksMediaDesc: string
        github: string
        githubDesc: string
        expertise: string
        expertiseDesc: string
        interests: string
        interestsDesc: string
        languages: string
        languagesDesc: string
        social: string
        socialDesc: string
        content: string
        contentDesc: string
        media: string
        mediaDesc: string
        options: string
        optionsDesc: string
      }
      sections: {
        profile: { title: string; description: string }
        projects: { title: string; description: string }
        skills: { title: string; description: string }
        experience: { title: string; description: string }
        education: { title: string; description: string }
      }
      fields: {
        title: string
        description: string
        longDescription: string
        imageUrl: string
        githubUrl: string
        demoUrl: string
        tags: string
        year: string
        sortOrder: string
        featured: string
        skills: string
        period: string
        role: string
        company: string
        technologies: string
        projectSlug: string
        isCurrent: string
        institution: string
        isCompleted: string
        name: string
        label: string
        email: string
        avatarUrl: string
        avatar: string
        cvUrl: string
        cv: string
        logo: string
        projectImage: string
        publicRepos: string
        memberSince: string
        whatsappHref: string
        iconKey: string
        isCore: string
        githubHandle: string
        tagline: string
        availability: string
        bio: string
        expertise: string
        interests: string
        level: string
        socialLinks: string
        address: string
        whatsapp: string
        handle: string
        slug: string
        flagEmoji: string
      }
    }
  }
}
