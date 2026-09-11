# Site de Carnet

Vitrine Next.js, bilingue : l'anglais à la racine, le français sous `/fr`. La mécanique
(dictionnaire, releases, détection d'OS, révélation au défilement) vient du site de
Polyglot ; **l'identité est propre à Carnet** et ne doit pas redevenir celle de Hublink.

## Direction artistique

Carnet est un cahier, le site en reprend la matière :

- **Papier crème** (`paper`, `sheet`) et encre chaude, quadrillage **Seyès** avec sa marge
  rouge en fond du hero (`seyes`, estompé vers le bas) ;
- **Newsreader** pour les titres (la police serif proposée dans l'application), **Geist**
  pour le texte et **Geist Mono** pour les rubriques, les touches et les numéros ;
- les deux accents de l'application : le **bleu des cases cochées** et le **jaune du
  surligneur**, qui se pose sur la fin du titre au chargement (`surligne`) ;
- boutons à coins de 8 px (jamais de pilules), barre de navigation pleine largeur ;
- motifs éditoriaux : liste cochable pour de vrai dans le hero (`app/demo.tsx`), sommaire
  numéroté avec points de conduite, touches de clavier en relief (`touche`), légendes
  « Fig. n », journal des versions daté dans la marge, téléchargement en couverture de
  carnet à élastique, section sombre pleine largeur pour le thème sombre.

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
