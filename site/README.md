# Site de Carnet

Vitrine Next.js, bilingue : l'anglais à la racine, le français sous `/fr`. Même base que le
site de Polyglot, sur le sol clair et le système de surfaces du site Hublink.

```bash
npm install
npm run dev     # http://localhost:3218
npm run build
```

Déployé sur **`carnet-luth.vercel.app`** (projet Vercel `carnet-site`) par `vercel --prod`
depuis ce dossier. Le projet n'est pas relié au dépôt : redéployer après chaque release
pour que le journal soit à jour tout de suite (il se revalide sinon toutes les dix minutes).

## Ce qui se met à jour tout seul

- **Les liens de téléchargement et le numéro de version**, lus sur la dernière release
  GitHub par `getTelechargements()` (`app/releases.ts`). Aucun numéro à bumper à la main.
- **Le journal des versions**, lu sur les releases par `getReleases()`. Le corps d'une
  release s'écrit en français, puis sous un titre `## English` ; `summarize()` garde les
  quatre premiers paragraphes de plus de 25 caractères et écarte les lignes qui commencent
  par `#`, `**` ou `>`. Les lignes d'installation commencent donc par `**Windows**` /
  `**macOS**` : visibles sur GitHub, absentes du site.

## Ce qui se met à jour à la main

**Les captures** de `public/` (`app-clair`, `app-sombre`, `app-blocs`, `app-taches`), en
2560 × 1600. Elles sont prises sur l'export de production de l'application (`npm run build`
à la racine, puis un serveur statique sur `out/`), avec un carnet de démonstration injecté
dans `localStorage` et Edge piloté par Playwright à 1280 × 800, facteur 2. Le serveur de
développement ajouterait le badge de Next dans le coin.

Les données de démonstration ne doivent contenir **aucun vrai nom** : seul le pseudo Luth
apparaît sur les sites.

## Typographie

`typographie()` (`app/content.ts`) pose les espaces insécables françaises devant `: ; ? !`
et dans les guillemets, sur tout le dictionnaire français et sur les notes de version.
Écrire les textes avec des espaces ordinaires : la fonction s'en charge.
