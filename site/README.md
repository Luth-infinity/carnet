# Site de Carnet

Vitrine Next.js, bilingue : l'anglais à la racine, le français sous `/fr`. La mécanique
(dictionnaire, releases, détection d'OS, révélation au défilement) vient du site de
Polyglot ; **l'identité est propre à Carnet** et ne doit pas redevenir celle de Hublink.

## Direction artistique

Identité propre à Carnet, **sur la palette noir et blanc des sites de Luth** (gris très
légèrement froids, encre noire, aucun accent coloré, jamais de beige) :

- quadrillage **Seyès** en gris neutre, avec son trait de marge, en fond du hero ;
- **Newsreader** pour les titres (la police serif proposée dans l'application), **Geist**
  pour le texte, **Geist Mono** pour les numéros et les touches ;
- boutons à coins de 8 px (pas de pilules), barre de navigation pleine largeur ;
- motifs : page d'exemple aux cases cochables dans le hero (`app/demo.tsx`), sommaire
  numéroté avec points de conduite, touches de clavier en relief (`touche`), journal des
  versions avec le numéro dans la marge, téléchargement en couverture de carnet noire.

**Pas de remplissage** : ni italique décoratif, ni légendes sous les captures, ni
surtitres qui répètent le titre, ni petites phrases qui n'apportent rien. Chaque texte
doit dire quelque chose que le titre ne dit pas déjà.

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
