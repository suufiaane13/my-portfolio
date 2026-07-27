import { LOGO_PNG_BASE64 } from './logo-base64.ts'

/**
 * Palette alignée sur le dark mode du portfolio (index.css + theme-color #13131f)
 */
const BRAND = {
  background: '#13131f',
  card: '#1a1a28',
  cardBorder: '#2a2a3e',
  sectionAlt: '#222233',
  primary: '#9b7dff',
  primarySoft: '#7c5cff',
  primaryGlow: 'rgba(124, 92, 255, 0.22)',
  text: '#ededf2',
  muted: '#8b8ba3',
  accentBg: '#252538',
  white: '#ffffff',
} as const

const OWNER = {
  name: 'Soufiane HAJJI',
  title: {
    fr: 'Développeur Full-Stack & UI/UX Designer',
    en: 'Full-Stack Developer & UI/UX Designer',
  },
} as const

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function siteUrl() {
  return Deno.env.get('PORTFOLIO_SITE_URL') ?? 'https://soufiane-hajji.netlify.app'
}

function logoSrc() {
  const custom = Deno.env.get('PORTFOLIO_LOGO_URL')
  if (custom) return custom
  return `data:image/png;base64,${LOGO_PNG_BASE64}`
}

function formatDate(locale: string) {
  return new Date().toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR', {
    dateStyle: 'full',
    timeStyle: 'short',
  })
}

function logoHeader() {
  const src = logoSrc()
  const site = siteUrl()

  return `
    <a href="${site}" style="text-decoration:none;display:inline-block;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
        <tr>
          <td align="center" style="background-color:#0d0d16;border:1px solid rgba(155,125,255,0.35);border-radius:14px;padding:10px;width:64px;height:64px;">
            <img
              src="${src}"
              alt="${OWNER.name}"
              width="52"
              height="52"
              style="display:block;width:52px;height:52px;object-fit:contain;border:0;outline:none;"
            />
          </td>
        </tr>
      </table>
    </a>`
}

function emailShell(params: {
  locale: string
  preheader: string
  badge: string
  title: string
  body: string
  footerNote: string
}) {
  const isEn = params.locale === 'en'
  const url = siteUrl()

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'fr'}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(params.title)}</title>
  <style>
    @media only screen and (max-width: 620px) {
      .container { width: 100% !important; }
      .content-pad { padding: 28px 20px !important; }
      .header-pad { padding: 32px 20px 28px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.background};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${escapeHtml(params.preheader)}
  </div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.background};">
    <tr>
      <td align="center" style="padding:36px 16px;">
        <table role="presentation" class="container" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td class="header-pad" style="background-color:${BRAND.card};border:1px solid ${BRAND.cardBorder};border-bottom:none;border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
              ${logoHeader()}
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.primary};">
                ${escapeHtml(params.badge)}
              </p>
              <h1 style="margin:0;font-size:26px;font-weight:700;line-height:1.25;color:${BRAND.text};letter-spacing:-0.02em;">
                ${escapeHtml(params.title)}
              </h1>
              <div style="margin:20px auto 0;width:48px;height:3px;border-radius:999px;background:linear-gradient(90deg,${BRAND.primarySoft},${BRAND.primary});"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td class="content-pad" style="background-color:${BRAND.card};padding:32px 40px 36px;border-left:1px solid ${BRAND.cardBorder};border-right:1px solid ${BRAND.cardBorder};">
              ${params.body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.sectionAlt};border:1px solid ${BRAND.cardBorder};border-top:1px solid ${BRAND.cardBorder};border-radius:0 0 16px 16px;padding:28px 40px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${BRAND.text};letter-spacing:-0.01em;">
                ${OWNER.name}
              </p>
              <p style="margin:0 0 18px;font-size:13px;color:${BRAND.muted};">
                ${escapeHtml(isEn ? OWNER.title.en : OWNER.title.fr)}
              </p>
              <a href="${url}" style="display:inline-block;padding:10px 20px;font-size:13px;font-weight:600;color:${BRAND.primary};text-decoration:none;border:1px solid rgba(155,125,255,0.35);border-radius:10px;background-color:${BRAND.accentBg};">
                ${isEn ? 'Visit portfolio' : 'Voir le portfolio'}
              </a>
              <p style="margin:22px 0 0;font-size:11px;line-height:1.6;color:${BRAND.muted};">
                ${escapeHtml(params.footerNote)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function infoRow(label: string, value: string, isLink = false) {
  const valueHtml = isLink
    ? `<a href="mailto:${escapeHtml(value)}" style="color:${BRAND.primary};text-decoration:none;font-weight:600;">${escapeHtml(value)}</a>`
    : `<span style="color:${BRAND.text};font-weight:600;">${escapeHtml(value)}</span>`

  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid ${BRAND.cardBorder};">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="100" style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};vertical-align:top;padding-top:2px;">
              ${escapeHtml(label)}
            </td>
            <td style="font-size:15px;line-height:1.5;vertical-align:top;">
              ${valueHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
}

function messageBlock(label: string, message: string) {
  return `
    <div style="margin-top:24px;">
      <p style="margin:0 0 10px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.muted};">
        ${escapeHtml(label)}
      </p>
      <div style="background-color:${BRAND.accentBg};border:1px solid ${BRAND.cardBorder};border-left:3px solid ${BRAND.primarySoft};border-radius:0 12px 12px 0;padding:20px 22px;">
        <p style="margin:0;font-size:15px;line-height:1.75;color:${BRAND.text};white-space:pre-wrap;">${escapeHtml(message)}</p>
      </div>
    </div>`
}

function ctaButton(href: string, label: string) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 0;">
      <tr>
        <td style="border-radius:12px;background-color:${BRAND.primarySoft};">
          <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:12px;">
            ${label}
          </a>
        </td>
      </tr>
    </table>`
}

function statusPills(isEn: boolean) {
  const saved = isEn ? 'Message saved' : 'Message enregistré'
  const sent = isEn ? 'Notification sent' : 'Notification envoyée'

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:8px;">
      <tr>
        <td style="padding:0 6px 0 0;width:50%;">
          <div style="background-color:${BRAND.accentBg};border:1px solid ${BRAND.cardBorder};border-radius:10px;padding:12px 14px;text-align:center;">
            <span style="font-size:12px;font-weight:600;color:${BRAND.primary};">&#10003;</span>
            <span style="font-size:12px;color:${BRAND.muted};margin-left:6px;">${saved}</span>
          </div>
        </td>
        <td style="padding:0 0 0 6px;width:50%;">
          <div style="background-color:${BRAND.accentBg};border:1px solid ${BRAND.cardBorder};border-radius:10px;padding:12px 14px;text-align:center;">
            <span style="font-size:12px;font-weight:600;color:${BRAND.primary};">&#10003;</span>
            <span style="font-size:12px;color:${BRAND.muted};margin-left:6px;">${sent}</span>
          </div>
        </td>
      </tr>
    </table>`
}

export function buildOwnerEmail(params: {
  name: string
  email: string
  message: string
  locale: string
}) {
  const isEn = params.locale === 'en'
  const replyHref = `mailto:${encodeURIComponent(params.email)}?subject=${encodeURIComponent(
    isEn ? `Re: Your message to ${OWNER.name}` : `Re: Votre message pour ${OWNER.name}`,
  )}`
  const replyLabel = isEn ? `Reply to ${escapeHtml(params.name)}` : `Répondre à ${escapeHtml(params.name)}`

  const body = `
    <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:${BRAND.muted};">
      ${
        isEn
          ? `You received a new message via your portfolio contact form.`
          : `Vous avez reçu un nouveau message via le formulaire de contact de votre portfolio.`
      }
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      ${infoRow(isEn ? 'Name' : 'Nom', params.name)}
      ${infoRow('Email', params.email, true)}
      ${infoRow(isEn ? 'Date' : 'Date', formatDate(params.locale))}
    </table>
    ${messageBlock(isEn ? 'Message' : 'Message', params.message)}
    ${ctaButton(replyHref, replyLabel)}
  `

  return emailShell({
    locale: params.locale,
    preheader: isEn
      ? `New message from ${params.name}`
      : `Nouveau message de ${params.name}`,
    badge: isEn ? 'Portfolio · Contact' : 'Portfolio · Contact',
    title: isEn ? 'New message received' : 'Nouveau message reçu',
    body,
    footerNote: isEn
      ? 'This email was sent automatically from your portfolio contact form.'
      : 'Cet email a été envoyé automatiquement depuis le formulaire de contact de votre portfolio.',
  })
}

export function buildOwnerEmailText(params: {
  name: string
  email: string
  message: string
  locale: string
}) {
  const isEn = params.locale === 'en'
  return isEn
    ? `New message from ${params.name}\n\nName: ${params.name}\nEmail: ${params.email}\nDate: ${formatDate(params.locale)}\n\nMessage:\n${params.message}\n\n— ${OWNER.name}\n${siteUrl()}`
    : `Nouveau message de ${params.name}\n\nNom: ${params.name}\nEmail: ${params.email}\nDate: ${formatDate(params.locale)}\n\nMessage:\n${params.message}\n\n— ${OWNER.name}\n${siteUrl()}`
}

export function buildConfirmationEmail(params: {
  name: string
  email: string
  message: string
  locale: string
}) {
  const isEn = params.locale === 'en'
  const firstName = escapeHtml(params.name.split(' ')[0] ?? params.name)
  const url = siteUrl()

  const body = `
    <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:${BRAND.text};letter-spacing:-0.02em;">
      ${isEn ? `Hello ${firstName},` : `Bonjour ${firstName},`}
    </p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:${BRAND.muted};">
      ${
        isEn
          ? `Thank you for reaching out. Your message has been received — I'll get back to you within <span style="color:${BRAND.text};font-weight:600;">24–48 hours</span>.`
          : `Merci pour votre message. Il a bien été reçu — je vous répondrai sous <span style="color:${BRAND.text};font-weight:600;">24 à 48 heures</span>.`
      }
    </p>
    ${statusPills(isEn)}
    ${messageBlock(isEn ? 'Your message' : 'Votre message', params.message)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.65;color:${BRAND.muted};">
      ${
        isEn
          ? `In the meantime, feel free to explore my projects on the portfolio.`
          : `En attendant, n'hésitez pas à découvrir mes projets sur le portfolio.`
      }
    </p>
    ${ctaButton(url, isEn ? 'View my portfolio' : 'Voir mon portfolio')}
  `

  return emailShell({
    locale: params.locale,
    preheader: isEn
      ? `Thanks ${params.name} — your message was received.`
      : `Merci ${params.name} — votre message a bien été reçu.`,
    badge: isEn ? 'Confirmation' : 'Confirmation',
    title: isEn ? 'Message received' : 'Message bien reçu',
    body,
    footerNote: isEn
      ? 'You are receiving this email because you submitted the contact form on my portfolio.'
      : 'Vous recevez cet email car vous avez utilisé le formulaire de contact de mon portfolio.',
  })
}

export function buildConfirmationEmailText(params: {
  name: string
  message: string
  locale: string
}) {
  const isEn = params.locale === 'en'
  return isEn
    ? `Hello ${params.name},\n\nYour message has been received. I'll get back to you within 24–48 hours.\n\nYour message:\n${params.message}\n\n— ${OWNER.name}\n${siteUrl()}`
    : `Bonjour ${params.name},\n\nVotre message a bien été reçu. Je vous répondrai sous 24 à 48 heures.\n\nVotre message:\n${params.message}\n\n— ${OWNER.name}\n${siteUrl()}`
}

/** Sujets sans emoji — meilleure délivrabilité */
export function ownerEmailSubject(name: string, locale: string) {
  return locale === 'en'
    ? `[Portfolio] New message from ${name}`
    : `[Portfolio] Nouveau message de ${name}`
}

export function confirmationEmailSubject(locale: string) {
  return locale === 'en'
    ? 'Your message was received — Soufiane HAJJI'
    : 'Votre message a bien été reçu — Soufiane HAJJI'
}

export function formatFromAddress(email: string) {
  const name = Deno.env.get('CONTACT_FROM_NAME') ?? OWNER.name
  return `${name} <${email}>`
}
