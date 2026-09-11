/**
 * Les deux versions du site, côte à côte.
 *
 * Un seul dictionnaire par langue plutôt qu'une bibliothèque d'internationalisation :
 * il n'y a que deux langues et une seule page, et voir les deux textes l'un sous
 * l'autre est le meilleur moyen de repérer qu'une traduction a dérivé.
 */

export type Locale = 'en' | 'fr';

type Section = { titre: string; p1: string; p2: string; alt: string };

export type Contenu = {
  meta: { title: string; description: string };
  nav: { fonctions: string; versions: string; autreLangue: string; telecharger: string };
  hero: {
    badge: (version: string) => string;
    /** Le titre se lit `titre` puis `titreSurligne`, cette seconde partie passée au surligneur. */
    titre: string;
    titreSurligne: string;
    texte: string;
    telecharger: string;
    code: string;
  };
  /** La page d'exemple du hero, dont les cases se cochent vraiment. */
  demo: {
    titre: string;
    sousTitre: string;
    taches: [string, boolean][];
    lienAvant: string;
    lienPage: string;
    placeholder: string;
    legende: string;
  };
  libelles: { sommaire: string; figure: string; journal: string };
  shot: { alt: string };
  pourquoi: { titre: string; p1: string; p2: string; p3: string };
  fonctions: { titre: string; cartes: { titre: string; texte: string }[] };
  flux: { titre: string; sous: string; etapes: { touches: string[]; titre: string; texte: string }[] };
  blocs: Section;
  taches: Section;
  chiffres: { titre: string; sous: string; items: { valeur: string; legende: string }[] };
  sombre: { titre: string; texte: string; alt: string };
  confiance: { titre: string; intro: string; points: [string, string][] };
  changelog: {
    titre: string;
    sous: (n: number) => string;
    actuelle: string;
    detail: string;
    vide: string;
  };
  telecharger: {
    titre: string;
    sous: (version: string) => string;
    win: string;
    mac: string;
    winArm: string;
    macIntel: string;
    noteLien: string;
    signature: string;
  };
  soutenir: { titre: string; texte: string; cafe: string; etoile: string };
  footer: {
    signature: string;
    suite: string;
    github: string;
    versions: string;
    bug: string;
    soutenir: string;
  };
};

/**
 * Espaces insécables de la typographie française, devant « : ; ? ! » et à
 * l'intérieur des guillemets : sans elles, « @ » se coupait en fin de ligne.
 */
export function typographie(texte: string): string {
  return texte
    .replace(/« /g, '« ')
    .replace(/ »/g, ' »')
    .replace(/ ([:;?!])/g, ' $1');
}

/** Applique `typographie` à toutes les chaînes d'un dictionnaire, fonctions comprises. */
function typographier<T>(valeur: T): T {
  if (typeof valeur === 'string') return typographie(valeur) as T;
  if (typeof valeur === 'function') {
    const fn = valeur as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => typographier(fn(...args))) as T;
  }
  if (Array.isArray(valeur)) return valeur.map(typographier) as T;
  if (valeur && typeof valeur === 'object') {
    return Object.fromEntries(Object.entries(valeur).map(([k, v]) => [k, typographier(v)])) as T;
  }
  return valeur;
}

const brut: Contenu = {
  meta: {
    title: 'Carnet, des notes et des tâches sur votre ordinateur',
    description:
      'Un carnet de notes de bureau : pages imbriquées, tâches regroupées, liens entre pages. Gratuit, sans compte, pour Windows et macOS.'
  },
  nav: {
    fonctions: 'Fonctions',
    versions: 'Versions',
    autreLangue: 'EN',
    telecharger: 'Télécharger'
  },
  hero: {
    badge: (version) => `Version ${version} · Windows et macOS`,
    titre: 'Vos notes, vos tâches et vos projets',
    titreSurligne: 'au même endroit',
    texte:
      "Carnet est un carnet de notes de bureau. Les pages s'imbriquent, les cases à cocher de toutes les pages se retrouvent dans une seule liste, et tout reste sur votre ordinateur, sans compte à créer.",
    telecharger: 'Télécharger Carnet',
    code: 'Voir le code'
  },
  demo: {
    titre: 'Aujourd’hui',
    sousTitre: 'Journal',
    taches: [
      ['Relire les maquettes de l’accueil', true],
      ['Envoyer le compte rendu', true],
      ['Préparer la réunion de jeudi', false],
      ['Appeler le garage', false]
    ],
    lienAvant: 'Détails dans',
    lienPage: 'Refonte du site',
    placeholder: 'Tapez « / » pour insérer un bloc',
    legende: 'Ces cases se cochent : essayez.'
  },
  libelles: { sommaire: 'Sommaire', figure: 'Fig.', journal: 'Journal des versions' },
  shot: { alt: 'Carnet, une page de projet avec ses étapes et son planning' },
  pourquoi: {
    titre: 'Entre le dossier de fichiers texte et Notion',
    p1: "Un dossier de fichiers texte se contente de stocker : pas de cases à cocher, pas de liens entre les notes, et une recherche qui dépend du système.",
    p2: "Les outils plus complets demandent un compte, une connexion et un temps d'apprentissage. Pour prendre des notes et suivre quelques projets, c'est beaucoup.",
    p3: "Carnet garde l'essentiel : des pages, des blocs, des tâches et des liens. Il fonctionne hors ligne et n'envoie pas vos notes en ligne."
  },
  fonctions: {
    titre: 'Ce que fait Carnet',
    cartes: [
      {
        titre: 'Des pages dans des pages',
        texte:
          "Une page peut en contenir d'autres. Elles se réorganisent par glisser-déposer dans la barre latérale, et le fil d'Ariane indique où l'on se trouve."
      },
      {
        titre: 'Le menu « / »',
        texte:
          'Titres, listes, tâches, encadrés, tableaux, sections dépliantes et code : tout s\'insère au clavier. Les raccourcis Markdown fonctionnent aussi.'
      },
      {
        titre: 'Une seule liste de tâches',
        texte:
          'La vue Tâches regroupe les cases à cocher de toutes les pages. Cocher depuis la liste met à jour la page d\'origine.'
      },
      {
        titre: 'Des liens entre pages',
        texte:
          '« @ » crée un lien vers une autre page. Le lien suit les changements de titre, et chaque page affiche celles qui la mentionnent.'
      },
      {
        titre: 'La note du jour',
        texte:
          'Ctrl J ouvre la page du jour, rangée dans le Journal, avec une liste de priorités et un espace pour les notes.'
      },
      {
        titre: 'Tout se retrouve',
        texte:
          'La palette Ctrl K cherche dans les titres et dans le texte des pages, et lance les actions courantes.'
      }
    ]
  },
  flux: {
    titre: 'Trois touches pour commencer',
    sous: 'Tout se fait au clavier, et tout reste accessible à la souris.',
    etapes: [
      {
        touches: ['Ctrl', 'N'],
        titre: 'Créer une page',
        texte:
          "La page s'ouvre avec le curseur dans le titre. Tant qu'elle est vide, quatre modèles sont proposés : liste de tâches, réunion, projet et journal."
      },
      {
        touches: ['/'],
        titre: 'Structurer',
        texte:
          "Sur une ligne vide, « / » ouvre la liste des blocs. Quelques lettres filtrent la liste, et Entrée insère le bloc choisi."
      },
      {
        touches: ['@'],
        titre: 'Relier',
        texte: '« @ » propose les pages existantes, ou crée une sous-page avec le nom tapé.'
      }
    ]
  },
  blocs: {
    titre: 'Un éditeur qui reste simple',
    p1: 'Seize blocs dans le menu « / », une barre de mise en forme quand on sélectionne du texte, et une poignée pour déplacer un bloc à la souris.',
    p2: 'Chaque page a son icône, sa couverture et sa police : sans empattement, avec empattement ou à chasse fixe.',
    alt: 'Le menu « / » ouvert sous un tableau, avec la liste des blocs'
  },
  taches: {
    titre: 'Toutes les tâches au même endroit',
    p1: 'Les cases à cocher restent dans leurs pages, là où elles ont un contexte. La vue Tâches les rassemble par page, avec la progression et un filtre sur celles qui restent à faire.',
    p2: "Le champ d'ajout rapide range une tâche dans la page « Tâches rapides », pour la classer plus tard.",
    alt: 'La vue Tâches, avec les tâches regroupées par page'
  },
  chiffres: {
    titre: 'Rien à créer, rien à synchroniser',
    sous: "Carnet n'a pas de serveur. Vos notes vivent dans le profil de l'application, et une sauvegarde complète tient dans un fichier.",
    items: [
      { valeur: '0 compte', legende: 'Aucune inscription et aucun mot de passe à retenir.' },
      { valeur: '16 blocs', legende: 'Dans le menu « / », du simple titre au tableau.' },
      { valeur: '2 systèmes', legende: 'Windows et macOS, sur processeur Intel, AMD, ARM ou Apple Silicon.' }
    ]
  },
  sombre: {
    titre: 'Clair ou sombre, selon vos réglages',
    texte:
      'Le thème suit celui du système, et se change depuis la barre latérale. Ici, une page en police à empattement sur le thème sombre.',
    alt: 'Carnet en thème sombre, une page de lectures en police à empattement'
  },
  confiance: {
    titre: 'À savoir avant d\'installer',
    intro: 'Carnet est gratuit et son code est public. Quelques points pratiques :',
    points: [
      [
        'Vos notes restent sur la machine',
        "Elles s'enregistrent au fil de la frappe dans le profil de l'application. La seule requête réseau vérifie s'il existe une nouvelle version."
      ],
      [
        'Pensez aux sauvegardes',
        "Réglages, puis « Exporter une sauvegarde », produit un fichier JSON à restaurer sur la même machine ou sur une autre."
      ],
      [
        'Les mises à jour',
        "Sous Windows, une nouvelle version se télécharge et s'installe depuis l'application. Sous macOS, l'application la signale et renvoie vers le téléchargement."
      ],
      [
        "L'application n'est pas signée",
        "Au premier lancement, Windows peut afficher SmartScreen : « Informations complémentaires », puis « Exécuter quand même ». Sur macOS, faites un clic droit sur l'application, puis « Ouvrir »."
      ]
    ]
  },
  changelog: {
    titre: 'Versions',
    sous: (n) => (n > 1 ? `Les ${n} dernières versions publiées.` : 'La dernière version publiée.'),
    actuelle: 'Actuelle',
    detail: 'Notes complètes sur GitHub',
    vide: 'Pas de détail pour cette version.'
  },
  telecharger: {
    titre: 'Télécharger Carnet',
    sous: (version) => `Version ${version}, gratuite, pour Windows et macOS.`,
    win: 'Télécharger pour Windows',
    mac: 'Télécharger pour Mac (Apple Silicon)',
    winArm: 'Windows sur ARM',
    macIntel: 'Mac avec processeur Intel',
    noteLien: 'Toutes les versions',
    signature: "L'application n'est pas signée : pour le premier lancement, voir « À savoir » plus haut."
  },
  soutenir: {
    titre: 'Si Carnet vous est utile',
    texte:
      "L'application est gratuite et le restera. Si elle vous sert au quotidien, un café fait plaisir, et une étoile sur le dépôt aide d'autres personnes à la trouver.",
    cafe: 'Offrir un café',
    etoile: 'Mettre une étoile'
  },
  footer: {
    signature: 'Carnet, des notes sur votre ordinateur',
    suite: 'Les autres apps',
    github: 'GitHub',
    versions: 'Versions',
    bug: 'Signaler un problème',
    soutenir: 'Soutenir'
  }
};

export const fr = typographier(brut);

export const en: Contenu = {
  meta: {
    title: 'Carnet, notes and tasks on your computer',
    description:
      'A desktop notebook: nested pages, gathered tasks, links between pages. Free, no account, for Windows and macOS.'
  },
  nav: {
    fonctions: 'Features',
    versions: 'Releases',
    autreLangue: 'FR',
    telecharger: 'Download'
  },
  hero: {
    badge: (version) => `Version ${version} · Windows and macOS`,
    titre: 'Your notes, tasks and projects,',
    titreSurligne: 'all in one place',
    texte:
      'Carnet is a desktop notebook. Pages nest inside each other, the checkboxes from every page come together in a single list, and everything stays on your computer, with no account to create.',
    telecharger: 'Download Carnet',
    code: 'View the code'
  },
  demo: {
    titre: 'Today',
    sousTitre: 'Journal',
    taches: [
      ['Review the homepage mockups', true],
      ['Send the meeting notes', true],
      ['Prepare Thursday’s meeting', false],
      ['Call the garage', false]
    ],
    lienAvant: 'Details in',
    lienPage: 'Website redesign',
    placeholder: 'Type "/" to insert a block',
    legende: 'These boxes really check: try it.'
  },
  libelles: { sommaire: 'Contents', figure: 'Fig.', journal: 'Release notes' },
  shot: { alt: 'Carnet, a project page with its steps and schedule' },
  pourquoi: {
    titre: 'Between a folder of text files and Notion',
    p1: 'A folder of text files only stores things: no checkboxes, no links between notes, and search depends on your system.',
    p2: 'Fuller tools ask for an account, a connection and time to learn them. To take notes and follow a few projects, that is a lot.',
    p3: 'Carnet keeps the essentials: pages, blocks, tasks and links. It works offline and never sends your notes online.'
  },
  fonctions: {
    titre: 'What Carnet does',
    cartes: [
      {
        titre: 'Pages inside pages',
        texte:
          'A page can hold other pages. Reorder them by drag and drop in the sidebar, and the breadcrumb shows where you are.'
      },
      {
        titre: 'The "/" menu',
        texte:
          'Headings, lists, tasks, callouts, tables, collapsible sections and code: everything is inserted from the keyboard. Markdown shortcuts work too.'
      },
      {
        titre: 'A single task list',
        texte:
          'The Tasks view gathers the checkboxes from every page. Checking one in the list updates the page it came from.'
      },
      {
        titre: 'Links between pages',
        texte:
          '"@" links to another page. The link follows title changes, and each page lists the pages that mention it.'
      },
      {
        titre: "Today's note",
        texte: "Ctrl J opens today's page, filed in the Journal, with a priority list and room for notes."
      },
      {
        titre: 'Find anything',
        texte: 'The Ctrl K palette searches titles and page content, and runs common actions.'
      }
    ]
  },
  flux: {
    titre: 'Three keys to get started',
    sous: 'Everything works from the keyboard, and everything stays reachable with the mouse.',
    etapes: [
      {
        touches: ['Ctrl', 'N'],
        titre: 'Create a page',
        texte:
          'The page opens with the cursor in the title. While it is empty, four templates are offered: task list, meeting, project and journal.'
      },
      {
        touches: ['/'],
        titre: 'Structure',
        texte: 'On an empty line, "/" opens the block list. A few letters filter it, and Enter inserts the block.'
      },
      {
        touches: ['@'],
        titre: 'Connect',
        texte: '"@" suggests existing pages, or creates a subpage with the name you typed.'
      }
    ]
  },
  blocs: {
    titre: 'An editor that stays simple',
    p1: 'Sixteen blocks in the "/" menu, a formatting bar when you select text, and a handle to move a block with the mouse.',
    p2: 'Each page has its own icon, cover and font: sans serif, serif or monospace.',
    alt: 'The "/" menu open below a table, listing the blocks'
  },
  taches: {
    titre: 'Every task in one place',
    p1: 'Checkboxes stay in their pages, where they have context. The Tasks view gathers them by page, with progress and a filter for what is left to do.',
    p2: 'The quick-add field files a task in the "Tâches rapides" page, to sort it out later.',
    alt: 'The Tasks view, with tasks grouped by page'
  },
  chiffres: {
    titre: 'Nothing to sign up for, nothing to sync',
    sous: 'Carnet has no server. Your notes live in the app profile, and a full backup fits in a single file.',
    items: [
      { valeur: '0 accounts', legende: 'No sign-up and no password to remember.' },
      { valeur: '16 blocks', legende: 'In the "/" menu, from a plain heading to a table.' },
      { valeur: '2 systems', legende: 'Windows and macOS, on Intel, AMD, ARM or Apple Silicon.' }
    ]
  },
  sombre: {
    titre: 'Light or dark, as you prefer',
    texte:
      "The theme follows your system, and can be switched from the sidebar. Here, a page in a serif font on the dark theme.",
    alt: 'Carnet in dark mode, a reading list page in a serif font'
  },
  confiance: {
    titre: 'Good to know before installing',
    intro: 'Carnet is free and its code is public. Its interface is in French for now. A few practical points:',
    points: [
      [
        'Your notes stay on your machine',
        'They are saved as you type in the app profile. The only network request checks whether a new version exists.'
      ],
      [
        'Keep backups',
        'In the settings, "Exporter une sauvegarde" produces a JSON file you can restore on the same machine or another one.'
      ],
      [
        'Updates',
        'On Windows, a new version downloads and installs from within the app. On macOS, the app announces it and links to the download.'
      ],
      [
        'The app is not signed',
        'On first launch, Windows may show SmartScreen: "More info", then "Run anyway". On macOS, right-click the app, then "Open".'
      ]
    ]
  },
  changelog: {
    titre: 'Releases',
    sous: (n) => (n > 1 ? `The last ${n} published versions.` : 'The latest published version.'),
    actuelle: 'Current',
    detail: 'Full notes on GitHub',
    vide: 'No details for this version.'
  },
  telecharger: {
    titre: 'Download Carnet',
    sous: (version) => `Version ${version}, free, for Windows and macOS.`,
    win: 'Download for Windows',
    mac: 'Download for Mac (Apple Silicon)',
    winArm: 'Windows on ARM',
    macIntel: 'Mac with an Intel processor',
    noteLien: 'All releases',
    signature: 'The app is not signed: for the first launch, see "Good to know" above.'
  },
  soutenir: {
    titre: 'If Carnet is useful to you',
    texte:
      'The app is free and will stay that way. If you use it every day, a coffee is always welcome, and a star on the repository helps other people find it.',
    cafe: 'Buy me a coffee',
    etoile: 'Star the repository'
  },
  footer: {
    signature: 'Carnet, notes on your computer',
    suite: 'The other apps',
    github: 'GitHub',
    versions: 'Releases',
    bug: 'Report an issue',
    soutenir: 'Support'
  }
};
