import { useEffect } from 'react'
import { profile } from '@/data/profile'
import { siteConfig } from '@/data/site'
import { socialLinks } from '@/data/contact'
import { useTranslation } from '@/i18n/LanguageProvider'

export function SeoHead() {
  const { t, locale } = useTranslation()

  useEffect(() => {
    document.title = t.meta.title

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let element = document.querySelector(`meta[${attr}="${name}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, name)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMeta('description', t.meta.description)
    setMeta('keywords', t.meta.keywords.join(', '))
    setMeta('author', profile.name)
    setMeta('robots', 'index, follow')

    setMeta('og:title', t.meta.title, true)
    setMeta('og:description', t.meta.description, true)
    setMeta('og:type', 'website', true)
    setMeta('og:locale', t.meta.locale, true)
    setMeta('og:url', siteConfig.url, true)
    setMeta('og:image', `${siteConfig.url}${siteConfig.ogImage}`, true)
    setMeta('og:site_name', t.meta.siteName, true)

    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', t.meta.title)
    setMeta('twitter:description', t.meta.description)
    setMeta('twitter:image', `${siteConfig.url}${siteConfig.ogImage}`)

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = siteConfig.url

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: profile.name,
          jobTitle: t.profile.title,
          url: siteConfig.url,
          image: `${siteConfig.url}${profile.avatar}`,
          logo: `${siteConfig.url}${profile.logo}`,
          email: 'hjisfn@gmail.com',
          sameAs: socialLinks.map((link) => link.href),
          knowsAbout: [
            'React',
            'TypeScript',
            'Node.js',
            'UI/UX Design',
            'Tailwind CSS',
          ],
        },
        {
          '@type': 'WebSite',
          name: t.meta.title,
          url: siteConfig.url,
          description: t.meta.description,
          inLanguage: t.meta.inLanguage,
          publisher: {
            '@type': 'Person',
            name: profile.name,
            logo: {
              '@type': 'ImageObject',
              url: `${siteConfig.url}${profile.logo}`,
            },
          },
        },
      ],
    }

    let script = document.getElementById('json-ld') as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.id = 'json-ld'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(jsonLd)
  }, [t, locale])

  return null
}
