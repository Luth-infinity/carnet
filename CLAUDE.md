@AGENTS.md

# Carnet — repères pour travailler sur ce dépôt

Application de notes de bureau : Next.js 16 exporté en statique, affiché par Electron. Même
famille que Hublink (`Luth-infinity/hublink`) : mêmes conventions de build, de release et de
mise à jour. Code, commentaires et commits **en français**, au présent, décrivant le
comportement.

## Architecture

| Dossier | Rôle |
| --- | --- |
| `app/`, `components/`, `lib/` | Interface Next.js (tout est client, aucune route serveur) |
| `lib/store.ts` | Pages, arbre, corbeille, journal (Zustand + `localStorage`, clé `carnet-data`) |
| `lib/doc.ts` | Lecture du JSON Tiptap : texte, tâches, mentions, export Markdown |
| `components/editor/` | Éditeur Tiptap, menu `/`, mentions `@`, encadrés, barres flottantes |
| `electron/main.js` | Fenêtre, protocole `carnet://`, menu, IPC |
| `electron/updates.js` | Recherche de version (API GitHub) et installation Windows (electron-updater) |
| `lib/desktop.ts` | Types de l'API exposée par `electron/preload.js` (`window.carnet`) |

**L'interface est servie par `carnet://app/`, pas par `file://`.** Les chemins absolus de
Next (`/_next/…`) s'y résolvent, et `localStorage` garde une origine stable : **changer le
schéma ou l'hôte ferait perdre toutes les notes des utilisateurs**. `resolveFile` suit les
conventions de `trailingSlash: true` (dossier → `index.html`).

**Une page s'ouvre sur `/p/?id=…`.** L'export statique ne sait pas générer `/p/[id]` pour
des pages créées après la compilation. Toujours passer par `pageHref()` et
`useActivePageId()` (`lib/routes.ts`) ; `useSearchParams` impose une frontière `Suspense`,
posée dans `AppShell`.

**Toutes les dépendances de l'interface sont en `devDependencies`** : elles sont bundlées
dans `out/`. Seul `electron-updater` est une dépendance de production, embarquée dans l'asar.
Une bibliothèque ajoutée en `dependencies` alourdirait l'installeur sans servir.

**Le sélecteur d'emojis lit `public/emojibase/fr/`** au lieu du CDN par défaut de frimousse,
pour marcher hors ligne. Mettre à jour ces deux fichiers depuis `emojibase-data` si de
nouveaux emojis manquent.

**Raccourcis** : `Ctrl N` / `Ctrl J` dans l'app de bureau, `Alt N` / `Alt J` dans un
navigateur qui garde les premiers pour lui (`shortcut()` dans `lib/desktop.ts`). Le menu
natif les affiche avec `registerAccelerator: false` : l'interface les gère, sinon chaque
action partirait deux fois.

## Procédure de release

1. Bump `version` dans `package.json`, commit.
2. `npm run dist:win` → `release/Carnet-Setup-<v>-x64.exe`, `-arm64.exe` et `latest.yml`.
3. Pousser sur `main`.
4. `gh release create vX.Y.Z --draft` avec les trois `.exe`, leurs `.blockmap` **et
   `release/latest.yml`** : sans ce dernier, la mise à jour automatique échoue en silence.
5. `gh release edit vX.Y.Z --draft=false` : la publication déclenche
   `.github/workflows/macos.yml`, qui joint les deux `.dmg` quelques minutes plus tard.
6. Redéployer le site (`vercel --prod` depuis `site/`) pour que le journal soit à jour
   tout de suite.

**Notes de version** : paragraphes en français, puis un titre `## English` et leur
traduction, puis les lignes d'installation commençant par `**Windows**` / `**macOS**`.
Le site n'affiche que les quatre premiers paragraphes de la langue de la page : mettre
l'important en tête.

## Le site

`site/` est la vitrine Next.js bilingue, en ligne sur **`carnet-luth.vercel.app`** (projet
Vercel `carnet-site`, déployé à la main, non relié au dépôt). Liens de téléchargement,
numéro de version et journal sont lus sur les releases GitHub : rien à bumper. Tout le
reste (captures, typographie) est dans `site/README.md`. Carnet figure aussi sur
`luth-apps.vercel.app`, dont le dossier `Documents/Apps/luth` n'est pas versionné.

Garder la numérotation en `0.x` : `electron-updater` ne redescend jamais d'un numéro.
La mise à jour automatique ne vaut que pour Windows ; macOS se contente d'un signalement
(Squirrel.Mac exige une app signée et notariée).

## Tester

- Interface : `npm run dev`, puis Playwright avec Edge (`executablePath`) en headless.
- Application : `npm run build`, puis `_electron.launch` de Playwright sur
  `node_modules/electron/dist/electron.exe` avec `. --static --user-data-dir=<profil jetable>`.
  Le verrou d'instance unique remonterait sinon la fenêtre d'une autre instance.

## Pièges rencontrés

- Tiptap 3 ne pose plus `data-type="taskItem"` sur les tâches : cibler `ul[data-type="taskList"] > li`.
- La fonction `placeholder` de Tiptap reçoit le nouveau document mais `editor.state` est encore
  l'ancien : `resolve(pos)` plante pendant un `setContent`. Les variantes sont en CSS.
- Sans `TrailingNode`, impossible d'écrire sous un tableau placé en fin de page.
- Le raccourci de la sidebar shadcn (`Ctrl B`) entrait en conflit avec le gras : passé à `Ctrl \`.
- Un sélecteur Zustand avec `useShallow` qui renvoie des objets recréés (`map(p => ({…}))`)
  boucle à l'infini : renvoyer les objets du store.
- `editor.commands.focus()` attend une frame : la touche tapée juste après Entrée dans le
  titre y restait. Le titre donne le focus par `editor.view.focus()`, synchrone.
