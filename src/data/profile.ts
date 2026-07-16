export const profile = {
  name: 'Soufiane HAJJI',
  availability: 'Disponible pour freelance — hireable',
  github: 'https://github.com/suufiaane13',
  githubHandle: '@suufiaane13',
  avatar: '/hajji-bg.png',
  logo: '/logo.png',
  cvUrl: '/CV_Soufiane.pdf',
  cvFilename: 'CV_Soufiane_HAJJI.pdf',
  stats: {
    publicRepos: 33,
    memberSince: 2022,
  },
} as const

export type Profile = typeof profile
