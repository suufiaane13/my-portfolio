# Assets publics

Fichiers servis depuis `public/` :

| Fichier | Statut | Usage |
|---------|--------|-------|
| `logo.png` | ✅ présent | Navbar, footer, emails, OG (fallback) |
| `hajji-bg.png` | ✅ présent | Photo profil (fallback statique + chaîne de secours) |
| `favicon.svg` | ✅ présent | Favicon, dernier fallback image |
| `placeholder-project.svg` | ✅ présent | Projets sans capture |
| `CV_Soufiane.pdf` | ❌ à ajouter | Bouton téléchargement CV (Hero) — ou upload via CMS |
| `projects/world-explorer.png` | ❌ à ajouter | Capture projet — ou upload via CMS Storage |
| `projects/yobo.png` | ❌ à ajouter | Capture projet — ou upload via CMS Storage |

## Notes

- L’avatar CMS (`avatarUrl`) est prioritaire ; en cas d’erreur, le site bascule sur `hajji-bg.png` → `logo.png` → `favicon.svg`.
- Après ajout du CV, mettre à jour l’URL dans le CMS admin (Profil → CV) ou dans `src/data/profile.ts` (`cvUrl`).
- Les images de projets peuvent être importées depuis `/admin/content/projects` (bucket Supabase `portfolio`).
