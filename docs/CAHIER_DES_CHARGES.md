# Cahier des charges — Portfolio Soufiane HAJJI v2

**Projet :** `susu_portfolio`  
**Référence :** `portfolio-soufiane-main` (v1)  
**Version :** 1.0  
**Date :** 11 juin 2025  
**Statut :** Spécification initiale

---

## 1. Contexte & objectifs

### 1.1 Contexte

Soufiane HAJJI dispose d'un portfolio v1 développé en **Next.js 14**, avec Tailwind CSS, GSAP, shadcn/ui et déploiement Netlify. Ce site présente son profil de **Développeur Full-Stack & UI/UX Designer** avec 7 sections principales, un loader animé, un formulaire de contact fonctionnel et un design dark mode.

Un nouveau projet **`susu_portfolio`** a été initié en **Vite + React 19 + TypeScript + Tailwind CSS v4**, avec une base technique plus légère et moderne.

### 1.2 Objectifs du v2

| Objectif | Description |
|----------|-------------|
| **Image professionnelle** | Portfolio premium, mémorable, crédible pour recruteurs et clients |
| **Performance** | Chargement rapide, animations fluides sans bloquer l'accès au contenu |
| **Responsive natif** | Expérience optimisée mobile, tablette et desktop — pas une adaptation tardive |
| **Maintenabilité** | Architecture modulaire, contenu externalisé, code typé |
| **Conversion** | Faciliter le contact, le téléchargement CV et la découverte des projets |
| **Accessibilité** | Conformité WCAG 2.1 AA minimum |

### 1.3 Cibles utilisateurs

- **Recruteurs / RH** — scan rapide (< 30 s), CV, compétences, projets
- **Clients / prospects** — portfolio, contact, preuve de compétences
- **Pairs développeurs** — qualité technique, GitHub, stack
- **Mobile first** — majorité du trafic attendu sur smartphone

---

## 2. Audit de l'existant (`portfolio-soufiane-main`)

### 2.1 Points forts à conserver

| Élément | Détail |
|---------|--------|
| **Structure éditoriale** | Hero → À propos → Compétences → Formation → Projets → Intérêts → Contact |
| **Identité visuelle** | Logo personnel, photo profil, palette sombre, accent primary |
| **Navigation** | Fixed nav, scroll spy, menu mobile drawer, téléchargement CV |
| **Contenu métier** | Données réelles (formation CMFP Oujda, projets World Explorer & Yobo, langues, réseaux) |
| **Formulaire contact** | Validation, toasts, envoi email double (propriétaire + confirmation client) |
| **SEO de base** | Metadata, Open Graph, sitemap, robots.txt |
| **Accessibilité partielle** | ARIA labels, focus rings, navigation clavier |

### 2.2 Limites & problèmes identifiés

#### UX / Performance

| Problème | Impact | Priorité |
|----------|--------|----------|
| **Loader global ~10 s** | L'utilisateur attend avant de voir le contenu | 🔴 Critique |
| **Animations GSAP excessives** (hero : 3 rotations + parallax + pulsation) | CPU/GPU élevé, risque motion sickness | 🔴 Critique |
| **Pas de toggle thème clair/sombre** | `dark` hardcodé dans le layout | 🟡 Moyen |
| **Stats hero peu crédibles** | « 100% satisfaction », « 15+ projets » sans preuve | 🟡 Moyen |
| **Pas de CTA principal** | Hero sans bouton « Me contacter » / « Voir mes projets » | 🔴 Critique |

#### Contenu & fonctionnel

| Problème | Impact |
|----------|--------|
| Seulement **2 projets** | Portfolio faible en densité |
| Liens GitHub = `#` | Boutons Code non fonctionnels |
| **Pas de section Expérience** | Lacune pour le parcours pro / stages / freelance |
| Icône « Voyages » = icône Natation (`Waves`) | Incohérence visuelle |
| Numéros WhatsApp différents (footer vs contact) | Incohérence données |
| Pas de pages détail projet | Pas de case study |

#### Technique

| Problème | Impact |
|----------|--------|
| Données hardcodées dans chaque composant | Difficile à maintenir |
| shadcn/ui complet installé, peu utilisé | Bundle lourd |
| Layouts contact mobile compressés (3 cartes en ligne) | Lisibilité faible sur petit écran |
| Duplication mobile/desktop dans Contact & Projects | Code verbose, risque de divergence |
| Next.js + Image optimisée | Migration vers Vite nécessite stratégie images |

### 2.3 Stack v1 vs v2 cible

| Couche | v1 (`portfolio-soufiane-main`) | v2 (`susu_portfolio`) |
|--------|-------------------------------|------------------------|
| Framework | Next.js 14 (App Router) | **Vite 8 + React 19** |
| Langage | TypeScript | TypeScript |
| Styles | Tailwind CSS v4 + shadcn | **Tailwind CSS v4** (+ shadcn sélectif) |
| Animations | GSAP + ScrollTrigger | **CSS + Framer Motion** (léger, `prefers-reduced-motion`) |
| Routing | Next.js (SPA unique) | **React Router** ou SPA sections (hash/scroll) |
| Formulaire | Netlify Functions + Nodemailer | **Netlify Functions** ou **Formspree / Resend** |
| Déploiement | Netlify / Vercel | **Netlify** (recommandé) ou Vercel |
| Icons | lucide-react | lucide-react |
| Validation form | Manuelle | **Zod + React Hook Form** |

---

## 3. Vision produit v2

### 3.1 Positionnement

> Un portfolio **editorial-tech** : sobre, premium, rapide. L'identité de Soufiane se lit en 5 secondes ; la profondeur (projets, compétences) se révèle au scroll, sans friction.

### 3.1 Principes directeurs

1. **Content first** — Le contenu est accessible immédiatement (loader optionnel ≤ 2 s ou skeleton)
2. **Mobile-native** — Conçu pour 375px, enrichi pour 768px et 1280px+
3. **Motion with purpose** — Animations qui guident, pas qui distraient
4. **Single source of truth** — Toutes les données dans `/src/data/`
5. **Progressive enhancement** — Site fonctionnel sans JS pour le contenu statique

### 3.2 Proposition de valeur affichée

**Titre :** Soufiane HAJJI  
**Sous-titre :** Développeur Full-Stack & UI/UX Designer  
**Accroche :** Je conçois et développe des expériences web modernes, performantes et centrées utilisateur.  
**CTA Hero :** `Voir mes projets` · `Me contacter` · `Télécharger CV`

---

## 4. Périmètre fonctionnel

### 4.1 Sections (in scope)

| # | Section | ID | Statut v1 | v2 |
|---|---------|-----|-----------|-----|
| 0 | **Loader / Splash** | — | Oui (long) | Optionnel, ≤ 2 s, skippable |
| 1 | **Navigation** | — | Oui | Améliorée |
| 2 | **Hero** | `#hero` | Oui | Repensée |
| 3 | **À propos** | `#about` | Oui | Enrichie |
| 4 | **Compétences** | `#skills` | Oui | Avec niveaux visuels |
| 5 | **Expérience** | `#experience` | ❌ Non | **Nouvelle** |
| 6 | **Formation** | `#education` | Oui | Timeline améliorée |
| 7 | **Projets** | `#projects` | Oui | Filtres + modal détail |
| 8 | **Process / Services** | `#services` | ❌ Non | **Nouvelle** (optionnelle phase 2) |
| 9 | **Centres d'intérêt** | `#interests` | Oui | Corrigée |
| 10 | **Contact** | `#contact` | Oui | UX mobile refaite |
| 11 | **Footer** | — | Oui | Simplifié |

### 4.2 Fonctionnalités transverses

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Scroll fluide vers sections | `scroll-behavior: smooth` + offset header | P0 |
| Scroll spy navigation | Section active highlightée | P0 |
| Téléchargement CV PDF | `/CV_Soufiane.pdf` | P0 |
| Formulaire contact | Nom, email, message + validation Zod | P0 |
| Toasts feedback | Succès / erreur envoi | P0 |
| Thème clair / sombre | Toggle persistant (localStorage) | P1 |
| Bouton « Retour en haut » | Visible après scroll > 500px | P1 |
| Partage social (OG) | Meta tags dynamiques | P1 |
| Filtre projets par tag | React, TypeScript, etc. | P1 |
| Modal / drawer détail projet | Screenshots, stack, liens | P1 |
| Analytics | Plausible ou Vercel Analytics | P2 |
| i18n FR / EN | Phase 2 | P2 |

### 4.3 Hors périmètre (v2.0)

- Blog / articles
- Espace admin CMS
- Authentification
- Chat en direct
- Paiement / devis en ligne

---

## 5. Architecture technique

### 5.1 Structure des dossiers cible

```
susu_portfolio/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   ├── profil/hajji.png
│   ├── projects/          # screenshots projets
│   ├── CV_Soufiane.pdf
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/        # Navigation, Footer, SectionWrapper
│   │   ├── sections/      # Hero, About, Skills, etc.
│   │   ├── ui/            # Button, Card, Input (shadcn)
│   │   └── shared/        # ThemeToggle, ScrollToTop, Loader
│   ├── data/
│   │   ├── profile.ts
│   │   ├── skills.ts
│   │   ├── projects.ts
│   │   ├── education.ts
│   │   ├── experience.ts
│   │   └── contact.ts
│   ├── hooks/
│   │   ├── useScrollSpy.ts
│   │   ├── useMediaQuery.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── styles/
│   │   └── index.css      # @import tailwindcss + @theme
│   ├── App.tsx
│   └── main.tsx
├── netlify/
│   └── functions/contact.ts
├── docs/
│   └── CAHIER_DES_CHARGES.md
├── index.html
├── vite.config.ts
└── package.json
```

### 5.2 Dépendances recommandées

```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "framer-motion": "^11",
    "lucide-react": "^0.460",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "sonner": "^1"
  },
  "devDependencies": {
    "tailwindcss": "^4.3",
    "@tailwindcss/vite": "^4.3",
    "typescript": "^6",
    "vite": "^8",
    "@vitejs/plugin-react": "^6"
  }
}
```

> shadcn/ui : installer **uniquement** les composants nécessaires (Button, Card, Input, Textarea, Sheet, Dialog, Badge).

### 5.3 Gestion des données

Toutes les données éditoriales dans `/src/data/*.ts` avec interfaces TypeScript :

```typescript
// Exemple : src/data/projects.ts
export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  tags: string[]
  image: string
  github?: string
  demo?: string
  featured: boolean
  year: number
}
```

---

## 6. Design System UI/UX

### 6.1 Direction artistique

**Style :** Dark premium éditorial avec touches de glassmorphism subtil  
**Inspiration :** Portfolios dev haut de gamme (minimal, typographique, espace généreux)  
**Éviter :** Gradients criards, animations excessives, effet « template générique IA »

### 6.2 Palette de couleurs

Basée sur l'existant v1, affinée en OKLCH (Tailwind v4 `@theme`) :

| Token | Usage | Valeur proposée (dark) |
|-------|-------|------------------------|
| `--background` | Fond principal | `oklch(0.13 0.01 270)` — noir bleuté |
| `--foreground` | Texte principal | `oklch(0.95 0 0)` |
| `--primary` | Accent, CTA, liens actifs | `oklch(0.75 0.18 280)` — violet/indigo |
| `--primary-foreground` | Texte sur primary | `oklch(0.15 0 0)` |
| `--muted-foreground` | Texte secondaire | `oklch(0.65 0.02 270)` |
| `--border` | Bordures, séparateurs | `oklch(0.25 0.02 270)` |
| `--card` | Surfaces cartes | `oklch(0.17 0.01 270)` |

**Mode clair :** variante inversée avec `--background: oklch(0.98 0 0)`.

### 6.3 Typographie

| Rôle | Police | Fallback | Usage |
|------|--------|----------|-------|
| **Display / Titres** | Space Grotesk | system-ui | H1, H2, nom |
| **Body** | Inter | system-ui | Paragraphes, UI |
| **Code / Tags** | JetBrains Mono | monospace | Stack technique |

**Échelle typographique (fluid) :**

| Élément | Mobile | Tablette | Desktop |
|---------|--------|----------|---------|
| H1 (Hero) | 2.25rem (36px) | 3rem (48px) | 4.5rem (72px) |
| H2 (Section) | 1.75rem (28px) | 2.25rem (36px) | 3rem (48px) |
| H3 | 1.25rem (20px) | 1.5rem (24px) | 1.75rem (28px) |
| Body | 1rem (16px) | 1rem | 1.125rem (18px) |
| Small / Caption | 0.875rem (14px) | 0.875rem | 0.875rem |

Utiliser `clamp()` ou classes Tailwind `text-*` responsives.

### 6.4 Espacements & grilles

| Token | Valeur |
|-------|--------|
| Container max | `max-w-7xl` (1280px) |
| Padding horizontal | `px-4` mobile · `px-6` tablet · `px-8` desktop |
| Section padding Y | `py-16` mobile · `py-20` tablet · `py-24` desktop |
| Gap grilles | `gap-4` mobile · `gap-6` tablet · `gap-8` desktop |
| Border radius | `rounded-xl` cartes · `rounded-2xl` hero cards · `rounded-full` badges |

### 6.5 Composants UI standards

| Composant | Variantes | Notes |
|-----------|-----------|-------|
| **Button** | primary, outline, ghost, icon | Min height 44px (touch target) |
| **Card** | default, glass, bordered | Hover : border-primary/50 + shadow |
| **Badge / Tag** | skill, project-tag | `rounded-full`, bg-primary/10 |
| **Input / Textarea** | default, error | Labels visibles, messages erreur |
| **Sheet** | mobile nav | Slide from right, backdrop blur |
| **Dialog** | project detail | Focus trap, ESC close |

### 6.6 États interactifs

- **Hover :** scale max 1.02, transition 200ms ease
- **Focus :** ring-2 ring-primary ring-offset-2 ring-offset-background
- **Active nav :** text-primary + border-b-2 ou pill bg-primary/10
- **Disabled :** opacity-50, cursor-not-allowed
- **Loading :** skeleton shimmer ou spinner inline

---

## 7. Responsive Design — Mobile · Tablette · Web

### 7.1 Breakpoints

| Nom | Min-width | Appareils cibles |
|-----|-----------|------------------|
| `xs` | 0 | iPhone SE, petits Android (320–374px) |
| `sm` | 640px | Grands mobiles, paysage mobile |
| `md` | 768px | Tablettes portrait (iPad) |
| `lg` | 1024px | Tablettes paysage, petits laptops |
| `xl` | 1280px | Desktop standard |
| `2xl` | 1536px | Grands écrans |

### 7.2 Stratégie Mobile-First

Concevoir d'abord pour **375px**, puis enrichir :

```
Mobile (base) → sm → md → lg → xl
```

### 7.3 Comportements par section et breakpoint

#### Navigation

| Breakpoint | Comportement |
|------------|--------------|
| `< lg` | Hamburger → Sheet/Drawer 320px, photo profil + liens icon + label |
| `≥ lg` | Nav horizontale inline, bouton CV visible |
| Tous | Fixed top, blur backdrop après scroll 50px, hauteur 64px (mobile) / 72px (desktop) |

#### Hero

| Breakpoint | Layout |
|------------|--------|
| Mobile | Stack vertical centré, logo bg réduit (opacity 0.05), stats 2×2 grid |
| Tablette | Idem, typo plus grande, stats 4 colonnes |
| Desktop | Contenu centré max-w-4xl, logo bg plus grand, CTA horizontal |

#### À propos

| Breakpoint | Layout |
|------------|--------|
| Mobile | Photo centrée (w-64), texte dessous, expertise cards 2×2 |
| Tablette | Photo + texte côte à côte si espace |
| Desktop | Grid 2 cols (photo 40% / contenu 60%), expertise 2×2 |

#### Compétences

| Breakpoint | Layout |
|------------|--------|
| Mobile | 1 colonne, cartes empilées |
| Tablette | 2 colonnes |
| Desktop | 4 colonnes (Front / Back / BDD / Outils) |

#### Projets

| Breakpoint | Layout |
|------------|--------|
| Mobile | **Carousel swipe** (Embla) ou stack vertical — **pas** scroll horizontal non intuitif |
| Tablette | Grid 2 colonnes |
| Desktop | Grid 2–3 colonnes, hover overlay avec actions |

#### Contact

| Breakpoint | Layout |
|------------|--------|
| Mobile | Infos contact en **liste verticale** (pas 3 micro-cartes), formulaire pleine largeur |
| Tablette | Infos + formulaire stack |
| Desktop | Grid 1/3 infos + 2/3 formulaire |

#### Footer

| Breakpoint | Layout |
|------------|--------|
| Mobile | Stack : logo → réseaux (icons only) → copyright |
| Desktop | Flex row space-between |

### 7.4 Touch & interactions mobiles

- Touch targets minimum **44×44px**
- Espacement liens menu ≥ 8px
- Swipe gestures sur carousel projets
- Pas de hover-only actions (toujours visible ou tap)
- `safe-area-inset` pour iPhone notch

### 7.5 Images responsives

```html
<!-- Stratégie Vite : srcset ou composant ResponsiveImage -->
<img
  src="/profil/hajji.png"
  srcset="/profil/hajji-400.webp 400w, /profil/hajji-800.webp 800w"
  sizes="(max-width: 768px) 256px, 384px"
  loading="lazy"
  decoding="async"
  alt="Soufiane HAJJI — Développeur Full-Stack"
/>
```

Formats : **WebP/AVIF** avec fallback PNG. Compression ≤ 100 Ko (profil), ≤ 200 Ko (projets).

---

## 8. Spécifications détaillées par section

### 8.1 Loader (optionnel)

| Critère | Spécification |
|---------|---------------|
| Durée max | **2 secondes** ou chargement assets critiques |
| Skippable | Clic ou touche ESC → accès immédiat |
| Animation | Logo fade + scale simple (pas de rotation multiple) |
| Fallback | Si `prefers-reduced-motion` → pas de loader, skeleton hero |
| Progress | Barre fine optionnelle, pas de faux pourcentage |

### 8.2 Hero

**Contenu :**
- Nom : Soufiane HAJJI
- Titre : Développeur Full-Stack & UI/UX Designer
- Accroche : 1 phrase value proposition
- CTA : `[Voir mes projets]` `[Me contacter]`
- Liens secondaires : GitHub, LinkedIn (icons)
- Indicateur scroll subtil (chevron bounce)

**Supprimer / Remplacer :**
- ❌ Stats « 100% satisfaction » → ✅ Métriques vérifiables ou badges compétences
- ❌ Logo animation 8+ secondes → ✅ Parallax léger au scroll uniquement

**Animation v2 :**
- Entrée staggered : titre → sous-titre → CTA (Framer Motion, 0.6s total)
- Logo background : opacity 0.06, scale statique
- `prefers-reduced-motion` : tout visible sans animation

### 8.3 À propos

**Contenu repris v1 + enrichi :**
- Photo profil avec skeleton loading
- Bio 2 paragraphes (passion, approche)
- 4 cartes expertise : Frontend, Backend, Responsive, Performance
- **Ajout :** ligne « Disponible pour freelance / CDI / stage » avec badge statut

### 8.4 Compétences

**Catégories v1 conservées :**

| Catégorie | Technologies |
|-----------|-------------|
| Front-end | HTML5, CSS3, JavaScript, React, Tailwind CSS, Bootstrap |
| Back-end | PHP, Python, Node.js, Laravel, Express.js, API REST |
| Base de données | MySQL, MongoDB, Supabase |
| Outils | Git/GitHub, VS Code, Canva, Agile/Scrum |

**Amélioration v2 :**
- Barre de niveau ou dots (1–5) par compétence clé
- Logos technos (Simple Icons) si disponibles
- Grouper visuellement par couleur de catégorie

### 8.5 Expérience (nouvelle)

Structure timeline (même pattern que Formation) :

```typescript
// Données à compléter par Soufiane
{
  period: "2024 — Présent",
  role: "Développeur Full-Stack Freelance",
  company: "Projets clients",
  description: "Développement d'applications web React/Node.js",
  technologies: ["React", "Node.js", "Tailwind"]
}
```

Permet stages, projets académiques, missions freelance.

### 8.6 Formation

Reprendre données v1 :
1. **2023–2025** — Technicien Spécialisé en Développement Digital — CMFP Oujda
2. **2022–2023** — Bac Sciences Physiques — Lycée Ennahda, Ahfir

**Amélioration :** timeline verticale avec ligne animée au scroll, badge « Diplôme obtenu / En cours ».

### 8.7 Projets

**Données v1 :**

| Projet | Stack | Demo |
|--------|-------|------|
| World Explorer | React, TS, Tailwind | world-explorer0.netlify.app |
| Yobo Fast Food | React, TS, Tailwind | yobo-fast-food-ice.netlify.app |

**Améliorations v2 :**
- Liens GitHub réels (corriger `#`)
- Filtres par tag
- Modal détail : description longue, galerie, rôle, défis, résultats
- Badge « Featured » sur projets phares
- Placeholder élégant si image manquante
- **Objectif contenu :** minimum **4 projets** à terme

### 8.8 Centres d'intérêt

| Intérêt | Icône correcte |
|---------|----------------|
| Natation | `Waves` |
| Jeu d'échecs | `Crown` ou `Chess` (custom) |
| Voyages | `Plane` ou `MapPin` — **corriger v1** |

Layout : 3 cartes, grid responsive, hover subtil.

### 8.9 Contact

**Informations (source unique `/src/data/contact.ts`) :**

| Champ | Valeur |
|-------|--------|
| Email | hjisfn@gmail.com |
| Téléphone | +212 6 41 45 45 72 |
| Adresse | Hay Saada Rue Khaibar N°07, Ahfir |
| WhatsApp | +212 602 353 136 *(harmoniser avec footer)* |

**Langues :** Arabe (maternelle), Français (courant), Anglais (courant)

**Formulaire :**
- Champs : nom*, email*, message*
- Validation Zod côté client
- Rate limiting côté server
- Honeypot anti-spam
- Toast succès/erreur (Sonner)

### 8.10 Footer

- Logo + nom + titre
- Réseaux : Instagram (@suuf.iaane), GitHub (@suufiaane), WhatsApp
- Copyright dynamique (année courante)
- Mention : « Développé avec React & Vite »

---

## 9. Animations & micro-interactions

### 9.1 Principes

| Règle | Détail |
|-------|--------|
| Durée max entrée section | 600ms |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Scroll reveal | Une fois, threshold 15% viewport |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` → désactiver |
| Performance | Animer `transform` et `opacity` uniquement |

### 9.2 Bibliothèque recommandée

**Framer Motion** (alternative légère à GSAP pour ce scope) :
- `motion.div` avec `whileInView`
- `AnimatePresence` pour modals et menu mobile
- Bundle ~30 Ko gzip vs GSAP ~50 Ko + ScrollTrigger

### 9.3 Interactions clés

| Élément | Interaction |
|---------|-------------|
| Nav links | Smooth scroll + highlight actif |
| Project cards | Hover lift + image scale 1.05 |
| Skills tags | Stagger fade-in |
| Contact submit | Button loading state + toast |
| Theme toggle | Icon rotate transition |
| Mobile menu | Sheet slide + backdrop fade |

---

## 10. Performance, SEO & accessibilité

### 10.1 Objectifs Lighthouse (mobile)

| Métrique | Cible |
|----------|-------|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 95 |
| SEO | ≥ 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |

### 10.2 SEO

```html
<title>Soufiane HAJJI — Développeur Full-Stack & UI/UX Designer</title>
<meta name="description" content="Portfolio de Soufiane HAJJI. React, TypeScript, Node.js. Création d'expériences web modernes." />
<meta property="og:title" content="Soufiane HAJJI — Portfolio" />
<meta property="og:image" content="/og-image.png" /> <!-- 1200×630 -->
<link rel="canonical" href="https://[domaine].netlify.app" />
```

- `robots.txt`, `sitemap.xml`
- JSON-LD `Person` + `WebSite`
- Alt text descriptif sur toutes les images

### 10.3 Accessibilité (WCAG 2.1 AA)

| Critère | Implémentation |
|---------|----------------|
| Contraste texte | Ratio ≥ 4.5:1 (body), ≥ 3:1 (large text) |
| Navigation clavier | Tab order logique, skip link « Aller au contenu » |
| Focus visible | Ring primary sur tous interactifs |
| ARIA | `aria-label` nav, `aria-expanded` menu, `role="dialog"` modals |
| Formulaires | Labels associés, `aria-invalid`, messages erreur |
| Animations | Respect `prefers-reduced-motion` |
| Langue | `<html lang="fr">` |

---

## 11. Backend & déploiement

### 11.1 Contact API

**Option A — Netlify Functions (migration v1) :**
- Endpoint : `/.netlify/functions/contact`
- Nodemailer + Gmail App Password
- Variables : `GMAIL_USER`, `GMAIL_APP_PASSWORD`

**Option B — Resend / Formspree (recommandé simplicité) :**
- Moins de maintenance serverless
- Meilleure délivrabilité email

### 11.2 Hébergement

| Plateforme | Avantages |
|------------|-----------|
| **Netlify** | Functions contact existantes, déploiement Git |
| Vercel | Alternative, Edge Functions |

**Configuration :**
- Build : `npm run build`
- Publish : `dist/`
- Redirects SPA : `/* /index.html 200`
- Headers cache assets : 1 an pour `/assets/*`

### 11.3 Variables d'environnement

```env
VITE_SITE_URL=https://soufiane-hajji.netlify.app
GMAIL_USER=
GMAIL_APP_PASSWORD=
# ou
RESEND_API_KEY=
```

---

## 12. Planning de réalisation

### Phase 1 — Fondations (Semaine 1)

- [ ] Architecture dossiers + design tokens Tailwind v4
- [ ] Composants UI de base (Button, Card, Input)
- [ ] Navigation + Footer + Theme toggle
- [ ] Fichiers data typés
- [ ] Migration assets (logo, profil, CV, projets)

### Phase 2 — Sections core (Semaine 2)

- [ ] Hero + About
- [ ] Skills + Education
- [ ] Projects (grid + modal)
- [ ] Interests + Contact form

### Phase 3 — Polish (Semaine 3)

- [ ] Animations Framer Motion
- [ ] Responsive QA (375, 768, 1024, 1280)
- [ ] Accessibilité audit
- [ ] SEO + meta tags
- [ ] Netlify deploy + contact function

### Phase 4 — Enrichissement (Semaine 4+)

- [ ] Section Expérience (contenu à fournir)
- [ ] Projets supplémentaires
- [ ] i18n EN
- [ ] Analytics

---

## 13. Critères d'acceptation (Definition of Done)

### Fonctionnel

- [ ] Toutes les sections v1 présentes et enrichies
- [ ] Navigation scroll spy fonctionnelle sur 3 breakpoints
- [ ] Formulaire contact envoie email + confirmation
- [ ] CV téléchargeable depuis nav et hero
- [ ] Liens demo/GitHub/réseaux sociaux fonctionnels
- [ ] Thème clair/sombre persistant

### Design

- [ ] Cohérence design system (couleurs, typo, espacements)
- [ ] Aucun débordement horizontal sur 320px
- [ ] Touch targets ≥ 44px sur mobile
- [ ] États hover/focus/active sur tous interactifs

### Technique

- [ ] TypeScript strict, zero `any` non justifié
- [ ] Données centralisées dans `/src/data/`
- [ ] Build production sans erreur
- [ ] Lighthouse mobile Performance ≥ 90

### Contenu

- [ ] Textes relus, sans fautes
- [ ] Coordonnées harmonisées (un seul numéro WhatsApp)
- [ ] Alt text sur toutes les images
- [ ] Minimum 2 projets avec liens réels

---

## 14. Livrables

| Livrable | Format |
|----------|--------|
| Code source | Repo Git `susu_portfolio` |
| Site déployé | URL Netlify production |
| Documentation | README + ce cahier des charges |
| Assets | `/public` optimisés WebP |
| CV | PDF à jour |

---

## 15. Annexes

### A. Contenu à fournir par Soufiane

- [ ] Section Expérience (stages, freelance, projets pro)
- [ ] Liens GitHub réels des 2 projets
- [ ] 2+ projets supplémentaires (screenshots, descriptions)
- [ ] Numéro WhatsApp officiel (harmonisation)
- [ ] Photo profil haute résolution (optionnelle mise à jour)
- [ ] OG image 1200×630
- [ ] URL domaine final souhaité

### B. Références design

- Portfolios minimal dark : brittanychiang.com (structure), leerob.io (performance)
- Composants : ui.shadcn.com
- Icons : lucide.dev, simpleicons.org

### C. Mapping v1 → v2 composants

| v1 (Next.js) | v2 (Vite) |
|--------------|-----------|
| `components/hero-section.tsx` | `src/components/sections/Hero.tsx` |
| `components/navigation.tsx` | `src/components/layout/Navigation.tsx` |
| `components/about-section.tsx` | `src/components/sections/About.tsx` |
| `components/skills-section.tsx` | `src/components/sections/Skills.tsx` |
| `components/education-section.tsx` | `src/components/sections/Education.tsx` |
| `components/projects-section.tsx` | `src/components/sections/Projects.tsx` |
| `components/interests-section.tsx` | `src/components/sections/Interests.tsx` |
| `components/contact-section.tsx` | `src/components/sections/Contact.tsx` |
| `components/footer.tsx` | `src/components/layout/Footer.tsx` |
| `components/global-loader.tsx` | `src/components/shared/Loader.tsx` |
| `components/section-animations.tsx` | Framer Motion `whileInView` |
| `app/globals.css` | `src/styles/index.css` |

---

*Document rédigé à partir de l'analyse complète de `portfolio-soufiane-main` et de l'état initial de `susu_portfolio`.*
