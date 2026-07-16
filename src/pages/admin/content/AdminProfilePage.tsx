import { Globe, Heart, Languages, Link2, Plus, Share2, Sparkles, Trash2, User } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ContentEditorToolbar, stickyBelowToolbarClass } from '@/components/admin/content/ContentEditorToolbar'
import { ProfilePreviewCard } from '@/components/admin/content/ContentPreviewCard'
import { FileUploadField } from '@/components/admin/content/FileUploadField'
import { ContentFieldGrid, ContentSection, ContentSectionGroup } from '@/components/admin/content/ContentSection'
import { ContentSegmentPanel, ContentSegmentTabs } from '@/components/admin/content/ContentSegmentTabs'
import { FormInput, FormTextarea } from '@/components/admin/content/FormField'
import { PublishedToggle } from '@/components/admin/content/PublishedToggle'
import { Button } from '@/components/ui/Button'
import type { Locale } from '@/i18n/types'
import { useTranslation } from '@/i18n/LanguageProvider'
import { getExpertiseIcon, getInterestIcon, INTEREST_ICON_KEYS } from '@/lib/portfolioIcons'
import { validateOptionalUrl, validateSlug } from '@/lib/cmsValidation'
import { cn } from '@/lib/utils'
import { getSocialLinkIcon, SOCIAL_ICON_KEYS } from '@/lib/socialLinkIcons'
import { fetchAdminProfile, updateAdminProfile, createEmptyInterest, createEmptySpokenLanguage, createEmptySocialLink } from '@/services/admin/profile'
import type { AdminProfile } from '@/types/adminContent'

type ProfileTab = 'identity' | 'texts' | 'links' | 'more'

export function AdminProfilePage() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [locale, setLocale] = useState<Locale>('fr')
  const [activeTab, setActiveTab] = useState<ProfileTab>('identity')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletedInterestSlugs, setDeletedInterestSlugs] = useState<string[]>([])
  const [deletedLanguageSlugs, setDeletedLanguageSlugs] = useState<string[]>([])
  const [deletedSocialSlugs, setDeletedSocialSlugs] = useState<string[]>([])

  const tabs = useMemo(
    () => [
      { id: 'identity' as const, label: t.admin.content.tabs.identity },
      { id: 'texts' as const, label: t.admin.content.tabs.texts },
      { id: 'links' as const, label: t.admin.content.tabs.links },
      { id: 'more' as const, label: t.admin.content.tabs.more },
    ],
    [t],
  )

  const load = useCallback(async () => {
    setIsLoading(true)
    setProfile(await fetchAdminProfile())
    setIsLoading(false)
  }, [])

  useEffect(() => {
    document.title = `${t.admin.content.sections.profile.title} — ${t.admin.title}`
    void load()
  }, [t, load])

  const handleSave = async () => {
    if (!profile) return

    for (const url of [
      profile.githubUrl,
      profile.avatarUrl,
      profile.logoUrl,
      profile.cvUrl,
      profile.whatsappHref ?? '',
    ]) {
      const urlError = validateOptionalUrl(url)
      if (urlError) {
        toast.error(t.admin.content.validation[urlError])
        return
      }
    }

    for (const item of [...profile.interests, ...profile.spokenLanguages, ...profile.socialLinks]) {
      const slugError = validateSlug(item.slug)
      if (slugError) {
        toast.error(t.admin.content.validation[slugError])
        return
      }
    }

    for (const link of profile.socialLinks) {
      const urlError = validateOptionalUrl(link.href)
      if (urlError) {
        toast.error(t.admin.content.validation[urlError])
        return
      }
    }

    setIsSaving(true)
    const ok = await updateAdminProfile(profile, {
      deletedInterestSlugs,
      deletedLanguageSlugs,
      deletedSocialSlugs,
    })
    setIsSaving(false)
    if (!ok) {
      toast.error(t.admin.content.saveError)
      return
    }
    toast.success(t.admin.content.saveSuccess)
    setDeletedInterestSlugs([])
    setDeletedLanguageSlugs([])
    setDeletedSocialSlugs([])
    await load()
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t.common.loading}</p>
  }

  if (!profile) {
    return <p className="text-sm text-muted-foreground">{t.admin.content.empty}</p>
  }

  const copy = profile.translations[locale]

  return (
    <div>
      <ContentEditorToolbar
        title={t.admin.content.sections.profile.title}
        backTo="/admin/content"
        backLabel={t.admin.content.backToHub}
        locale={locale}
        onLocaleChange={setLocale}
        published={profile.published}
        onPublishedChange={(value) => setProfile({ ...profile, published: value })}
        showPublished
        onSave={() => void handleSave()}
        isSaving={isSaving}
      />

      <div className="mb-5 lg:hidden">
        <ProfilePreviewCard
          avatarUrl={profile.avatarUrl}
          name={profile.name}
          title={copy.title}
          tagline={copy.tagline}
          availability={copy.availability}
          githubHandle={profile.githubHandle}
          githubUrl={profile.githubUrl}
          published={profile.published}
        />
      </div>

      <ContentSegmentTabs
        items={tabs}
        active={activeTab}
        onChange={(id) => setActiveTab(id as ProfileTab)}
        className="mb-5 md:hidden"
      />

      <div className="lg:grid lg:grid-cols-3 lg:gap-6">
        <div className="lg:col-span-2">
          <ContentSectionGroup>
            <div className="space-y-5">
          <ContentSegmentPanel id="identity" activeTab={activeTab}>
            <ContentSection
              sectionId="profile-identity"
              icon={User}
              title={t.admin.content.groups.identity}
              description={t.admin.content.groups.identityDesc}
            >
              <ContentFieldGrid>
                <FormInput
                  label={t.admin.content.fields.name}
                  value={profile.name}
                  onChange={(v) => setProfile({ ...profile, name: v })}
                />
                <FormInput
                  label={t.admin.content.fields.email}
                  value={profile.email ?? ''}
                  onChange={(v) => setProfile({ ...profile, email: v })}
                />
                <FormInput
                  label={t.admin.content.fields.address}
                  value={profile.address ?? ''}
                  onChange={(v) => setProfile({ ...profile, address: v })}
                />
                <FormInput
                  label={t.admin.content.fields.whatsapp}
                  value={profile.whatsapp ?? ''}
                  onChange={(v) => setProfile({ ...profile, whatsapp: v })}
                />
                <FormInput
                  label={t.admin.content.fields.whatsappHref}
                  value={profile.whatsappHref ?? ''}
                  onChange={(v) => setProfile({ ...profile, whatsappHref: v })}
                />
              </ContentFieldGrid>
            </ContentSection>
          </ContentSegmentPanel>

          <ContentSegmentPanel id="texts" activeTab={activeTab}>
            <ContentSection
              sectionId="profile-texts"
              icon={Sparkles}
              title={t.admin.content.groups.publicTexts}
              description={t.admin.content.groups.publicTextsDesc}
            >
              <FormInput
                label={t.admin.content.fields.title}
                value={copy.title}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    translations: {
                      ...profile.translations,
                      [locale]: { ...copy, title: v },
                    },
                  })
                }
              />
              <FormInput
                label={t.admin.content.fields.tagline}
                value={copy.tagline}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    translations: {
                      ...profile.translations,
                      [locale]: { ...copy, tagline: v },
                    },
                  })
                }
              />
              <FormInput
                label={t.admin.content.fields.availability}
                value={copy.availability}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    translations: {
                      ...profile.translations,
                      [locale]: { ...copy, availability: v },
                    },
                  })
                }
              />
              <FormTextarea
                label={`${t.admin.content.fields.bio} 1`}
                value={copy.bio1}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    translations: {
                      ...profile.translations,
                      [locale]: { ...copy, bio1: v },
                    },
                  })
                }
                rows={4}
              />
              <FormTextarea
                label={`${t.admin.content.fields.bio} 2`}
                value={copy.bio2}
                onChange={(v) =>
                  setProfile({
                    ...profile,
                    translations: {
                      ...profile.translations,
                      [locale]: { ...copy, bio2: v },
                    },
                  })
                }
                rows={4}
              />
            </ContentSection>
          </ContentSegmentPanel>

          <ContentSegmentPanel id="links" activeTab={activeTab}>
            <ContentSection
              sectionId="profile-links"
              icon={Link2}
              title={t.admin.content.groups.linksMedia}
              description={t.admin.content.groups.linksMediaDesc}
            >
              <div className="space-y-4">
                <FileUploadField
                  kind="avatar"
                  variant="avatar"
                  label={t.admin.content.fields.avatar}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  value={profile.avatarUrl}
                  onUrlChange={(url) => setProfile({ ...profile, avatarUrl: url })}
                />
                <FileUploadField
                  kind="logo"
                  variant="logo"
                  label={t.admin.content.fields.logo}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  value={profile.logoUrl}
                  onUrlChange={(url) => setProfile({ ...profile, logoUrl: url })}
                />
                <FileUploadField
                  kind="cv"
                  variant="document"
                  label={t.admin.content.fields.cv}
                  accept="application/pdf"
                  value={profile.cvUrl}
                  filename={profile.cvFilename}
                  onUrlChange={(url) => setProfile({ ...profile, cvUrl: url })}
                  onFilenameChange={(filename) => setProfile({ ...profile, cvFilename: filename })}
                />
              </div>

              <div className="mt-6 border-t border-border/60 pt-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Link2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      {t.admin.content.groups.github}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t.admin.content.groups.githubDesc}
                    </p>
                  </div>
                </div>
                <ContentFieldGrid>
                  <FormInput
                    label={t.admin.content.fields.githubUrl}
                    value={profile.githubUrl}
                    onChange={(v) => setProfile({ ...profile, githubUrl: v })}
                  />
                  <FormInput
                    label={t.admin.content.fields.githubHandle}
                    value={profile.githubHandle}
                    onChange={(v) => setProfile({ ...profile, githubHandle: v })}
                  />
                  <FormInput
                    label={t.admin.content.fields.publicRepos}
                    type="number"
                    value={profile.publicRepos}
                    onChange={(v) =>
                      setProfile({ ...profile, publicRepos: Number(v) || profile.publicRepos })
                    }
                  />
                  <FormInput
                    label={t.admin.content.fields.memberSince}
                    type="number"
                    value={profile.memberSince}
                    onChange={(v) =>
                      setProfile({ ...profile, memberSince: Number(v) || profile.memberSince })
                    }
                  />
                </ContentFieldGrid>
              </div>
            </ContentSection>
          </ContentSegmentPanel>

          <ContentSegmentPanel id="more" activeTab={activeTab}>
            <ContentSection
              sectionId="profile-expertise"
              icon={Globe}
              title={t.admin.content.groups.expertise}
              description={t.admin.content.groups.expertiseDesc}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.expertise.map((item, index) => {
                  const Icon = getExpertiseIcon(item.iconKey)
                  return (
                    <div
                      key={item.slug}
                      className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">{item.slug}</span>
                        </div>
                        <PublishedToggle
                          published={item.published}
                          onChange={(value) => {
                            const expertise = [...profile.expertise]
                            expertise[index] = { ...item, published: value }
                            setProfile({ ...profile, expertise })
                          }}
                        />
                      </div>
                      <FormInput
                        label={t.admin.content.fields.title}
                        value={item.translations[locale].title}
                        onChange={(v) => {
                          const expertise = [...profile.expertise]
                          expertise[index] = {
                            ...item,
                            translations: {
                              ...item.translations,
                              [locale]: { ...item.translations[locale], title: v },
                            },
                          }
                          setProfile({ ...profile, expertise })
                        }}
                      />
                      <FormTextarea
                        label={t.admin.content.fields.description}
                        value={item.translations[locale].description}
                        onChange={(v) => {
                          const expertise = [...profile.expertise]
                          expertise[index] = {
                            ...item,
                            translations: {
                              ...item.translations,
                              [locale]: { ...item.translations[locale], description: v },
                            },
                          }
                          setProfile({ ...profile, expertise })
                        }}
                        rows={2}
                      />
                    </div>
                  )
                })}
              </div>
            </ContentSection>

            <ContentSection
              sectionId="profile-interests"
              icon={Heart}
              title={t.admin.content.groups.interests}
              description={t.admin.content.groups.interestsDesc}
              className="mt-5"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mb-3"
                onClick={() =>
                  setProfile({
                    ...profile,
                    interests: [...profile.interests, createEmptyInterest(profile.interests.length + 1)],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                {t.admin.content.createInterest}
              </Button>
              <div className="space-y-3">
                {profile.interests.map((item, index) => {
                  const Icon = getInterestIcon(item.iconKey)
                  return (
                    <div key={item.slug || `new-interest-${index}`} className="flex items-start gap-3 rounded-xl border border-border p-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1 space-y-3">
                        {!item.slug && (
                          <FormInput
                            label={t.admin.content.fields.slug}
                            value={item.slug}
                            onChange={(v) => {
                              const interests = [...profile.interests]
                              interests[index] = { ...item, slug: v }
                              setProfile({ ...profile, interests })
                            }}
                          />
                        )}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-foreground">
                            {t.admin.content.fields.iconKey}
                          </label>
                          <select
                            className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                            value={item.iconKey}
                            onChange={(e) => {
                              const interests = [...profile.interests]
                              interests[index] = { ...item, iconKey: e.target.value }
                              setProfile({ ...profile, interests })
                            }}
                          >
                            {INTEREST_ICON_KEYS.map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                          </select>
                        </div>
                        <FormInput
                          label={t.admin.content.fields.title}
                          value={item.translations[locale].label}
                          onChange={(v) => {
                            const interests = [...profile.interests]
                            interests[index] = {
                              ...item,
                              translations: {
                                ...item.translations,
                                [locale]: { label: v },
                              },
                            }
                            setProfile({ ...profile, interests })
                          }}
                        />
                        <PublishedToggle
                          published={item.published}
                          onChange={(value) => {
                            const interests = [...profile.interests]
                            interests[index] = { ...item, published: value }
                            setProfile({ ...profile, interests })
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (item.slug) {
                            setDeletedInterestSlugs((prev) => [...prev, item.slug])
                          }
                          setProfile({
                            ...profile,
                            interests: profile.interests.filter((_, i) => i !== index),
                          })
                        }}
                        className="shrink-0 rounded-lg p-2 text-destructive hover:bg-destructive/10"
                        aria-label={t.admin.content.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </ContentSection>

            <ContentSection
              sectionId="profile-languages"
              icon={Languages}
              title={t.admin.content.groups.languages}
              description={t.admin.content.groups.languagesDesc}
              className="mt-5"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mb-3"
                onClick={() =>
                  setProfile({
                    ...profile,
                    spokenLanguages: [
                      ...profile.spokenLanguages,
                      createEmptySpokenLanguage(profile.spokenLanguages.length + 1),
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                {t.admin.content.createLanguage}
              </Button>
              <div className="space-y-3">
                {profile.spokenLanguages.map((item, index) => (
                  <div key={item.slug || `new-language-${index}`} className="flex items-start gap-3 rounded-xl border border-border p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg">
                      <span aria-hidden="true">{item.flagEmoji}</span>
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      {!item.slug && (
                        <FormInput
                          label={t.admin.content.fields.slug}
                          value={item.slug}
                          onChange={(v) => {
                            const spokenLanguages = [...profile.spokenLanguages]
                            spokenLanguages[index] = { ...item, slug: v }
                            setProfile({ ...profile, spokenLanguages })
                          }}
                        />
                      )}
                      <FormInput
                        label={t.admin.content.fields.flagEmoji}
                        value={item.flagEmoji}
                        onChange={(v) => {
                          const spokenLanguages = [...profile.spokenLanguages]
                          spokenLanguages[index] = { ...item, flagEmoji: v }
                          setProfile({ ...profile, spokenLanguages })
                        }}
                      />
                      <FormInput
                        label={t.admin.content.fields.name}
                        value={item.translations[locale].name}
                        onChange={(v) => {
                          const spokenLanguages = [...profile.spokenLanguages]
                          spokenLanguages[index] = {
                            ...item,
                            translations: {
                              ...item.translations,
                              [locale]: { ...item.translations[locale], name: v },
                            },
                          }
                          setProfile({ ...profile, spokenLanguages })
                        }}
                      />
                      <FormInput
                        label={t.admin.content.fields.level}
                        value={item.translations[locale].level}
                        onChange={(v) => {
                          const spokenLanguages = [...profile.spokenLanguages]
                          spokenLanguages[index] = {
                            ...item,
                            translations: {
                              ...item.translations,
                              [locale]: { ...item.translations[locale], level: v },
                            },
                          }
                          setProfile({ ...profile, spokenLanguages })
                        }}
                      />
                      <PublishedToggle
                        published={item.published}
                        onChange={(value) => {
                          const spokenLanguages = [...profile.spokenLanguages]
                          spokenLanguages[index] = { ...item, published: value }
                          setProfile({ ...profile, spokenLanguages })
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (item.slug) {
                          setDeletedLanguageSlugs((prev) => [...prev, item.slug])
                        }
                        setProfile({
                          ...profile,
                          spokenLanguages: profile.spokenLanguages.filter((_, i) => i !== index),
                        })
                      }}
                      className="shrink-0 rounded-lg p-2 text-destructive hover:bg-destructive/10"
                      aria-label={t.admin.content.delete}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </ContentSection>

            <ContentSection
              sectionId="profile-social"
              icon={Share2}
              title={t.admin.content.groups.social}
              description={t.admin.content.groups.socialDesc}
              className="mt-5"
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mb-3"
                onClick={() =>
                  setProfile({
                    ...profile,
                    socialLinks: [
                      ...profile.socialLinks,
                      createEmptySocialLink(profile.socialLinks.length + 1),
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" />
                {t.admin.content.createSocial}
              </Button>
              <div className="space-y-4">
                {profile.socialLinks.map((link, index) => {
                  const Icon = getSocialLinkIcon(link.iconKey)
                  return (
                    <div
                      key={link.slug || `new-social-${index}`}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {link.label || link.slug || t.admin.content.createSocial}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PublishedToggle
                            published={link.published}
                            onChange={(value) => {
                              const socialLinks = [...profile.socialLinks]
                              socialLinks[index] = { ...link, published: value }
                              setProfile({ ...profile, socialLinks })
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (link.slug) {
                                setDeletedSocialSlugs((prev) => [...prev, link.slug])
                              }
                              setProfile({
                                ...profile,
                                socialLinks: profile.socialLinks.filter((_, i) => i !== index),
                              })
                            }}
                            className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                            aria-label={t.admin.content.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {!link.slug && (
                          <FormInput
                            label={t.admin.content.fields.slug}
                            value={link.slug}
                            onChange={(v) => {
                              const socialLinks = [...profile.socialLinks]
                              socialLinks[index] = { ...link, slug: v }
                              setProfile({ ...profile, socialLinks })
                            }}
                          />
                        )}
                        <ContentFieldGrid>
                          <FormInput
                            label={t.admin.content.fields.label}
                            value={link.label}
                            onChange={(v) => {
                              const socialLinks = [...profile.socialLinks]
                              socialLinks[index] = { ...link, label: v }
                              setProfile({ ...profile, socialLinks })
                            }}
                          />
                          <div>
                            <label className="mb-2 block text-sm font-medium text-foreground">
                              {t.admin.content.fields.iconKey}
                            </label>
                            <select
                              className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                              value={link.iconKey}
                              onChange={(e) => {
                                const socialLinks = [...profile.socialLinks]
                                socialLinks[index] = { ...link, iconKey: e.target.value }
                                setProfile({ ...profile, socialLinks })
                              }}
                            >
                              {SOCIAL_ICON_KEYS.map((key) => (
                                <option key={key} value={key}>
                                  {key}
                                </option>
                              ))}
                            </select>
                          </div>
                        </ContentFieldGrid>
                        <ContentFieldGrid>
                          <FormInput
                            label="URL"
                            value={link.href}
                            onChange={(v) => {
                              const socialLinks = [...profile.socialLinks]
                              socialLinks[index] = { ...link, href: v }
                              setProfile({ ...profile, socialLinks })
                            }}
                          />
                          <FormInput
                            label={t.admin.content.fields.handle}
                            value={link.handle}
                            onChange={(v) => {
                              const socialLinks = [...profile.socialLinks]
                              socialLinks[index] = { ...link, handle: v }
                              setProfile({ ...profile, socialLinks })
                            }}
                          />
                        </ContentFieldGrid>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ContentSection>
          </ContentSegmentPanel>
            </div>
          </ContentSectionGroup>
        </div>

        <aside className="hidden lg:block">
          <div className={cn(stickyBelowToolbarClass, 'space-y-4')}>
            <ProfilePreviewCard
              avatarUrl={profile.avatarUrl}
              name={profile.name}
              title={copy.title}
              tagline={copy.tagline}
              availability={copy.availability}
              githubHandle={profile.githubHandle}
              githubUrl={profile.githubUrl}
              published={profile.published}
            />
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
              <p>{t.admin.content.sections.profile.description}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
