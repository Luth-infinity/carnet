import { typographie } from './content';

export type Release = {
  version: string;
  date: string;
  page: string;
  points: string[];
};

const DEPOT = 'Luth-infinity/carnet';
const API = `https://api.github.com/repos/${DEPOT}/releases`;

export const PAGE_VERSIONS = `https://github.com/${DEPOT}/releases`;

export type Telechargements = {
  version: string;
  win: string | null;
  winArm: string | null;
  macArm: string | null;
  macIntel: string | null;
};

const AUCUN: Telechargements = { version: '', win: null, winArm: null, macArm: null, macIntel: null };

type ReleaseGitHub = {
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  assets: { name: string; browser_download_url: string }[];
};

/** Revalidé toutes les dix minutes, comme le site de Polyglot. */
async function lireReleases(): Promise<ReleaseGitHub[]> {
  const res = await fetch(API, {
    headers: { Accept: 'application/vnd.github+json' },
    next: { revalidate: 600 }
  });
  if (!res.ok) return [];
  const data = (await res.json()) as ReleaseGitHub[];
  return data.filter((r) => !r.draft && !r.prerelease);
}

/**
 * Isole la partie d'une note de version rédigée dans la langue voulue. Les
 * notes de Carnet sont écrites en français, puis sous un titre « ## English ».
 */
function section(body: string, locale: 'en' | 'fr'): string {
  const coupure = body.search(/^#{1,3}\s*English\s*$/im);
  if (coupure === -1) return body;
  return locale === 'en' ? body.slice(coupure) : body.slice(0, coupure);
}

/** Garde les phrases, écarte les titres et les lignes d'installation (qui commencent par `**`). */
function summarize(body: string): string[] {
  return body
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('**') && !l.startsWith('>'))
    .map((l) => l.replace(/^[-*]\s*/, ''))
    .filter((l) => l.length > 25 && !l.startsWith('`'))
    .slice(0, 4);
}

/**
 * Le journal des versions vient des releases GitHub : il se met à jour à
 * chaque publication, sans double saisie qui finirait par diverger.
 */
export async function getReleases(locale: 'en' | 'fr' = 'fr'): Promise<Release[]> {
  try {
    return (await lireReleases()).slice(0, 5).map((r) => ({
      version: r.tag_name.replace(/^v/, ''),
      date: new Date(r.published_at).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      page: r.html_url,
      points: summarize(section(r.body || '', locale)).map((p) => (locale === 'fr' ? typographie(p) : p))
    }));
  } catch {
    // Le site doit se construire même si l'API GitHub est indisponible.
    return [];
  }
}

/**
 * Les liens de téléchargement sont lus sur la dernière release, jamais écrits
 * à la main. Noms produits par electron-builder : `Carnet-Setup-<v>-x64.exe`,
 * `-arm64.exe`, `Carnet-<v>-arm64.dmg` et `-x64.dmg`. Les `.dmg` arrivent
 * quelques minutes après la publication : en attendant, le bouton renvoie
 * vers la page des versions plutôt que vers le vide.
 */
export async function getTelechargements(): Promise<Telechargements> {
  try {
    const derniere = (await lireReleases())[0];
    if (!derniere) return AUCUN;
    const url = (suffixe: string): string | null =>
      derniere.assets.find((a) => a.name.endsWith(suffixe))?.browser_download_url ?? null;

    return {
      version: derniere.tag_name.replace(/^v/, ''),
      win: url('-x64.exe'),
      winArm: url('-arm64.exe'),
      macArm: url('-arm64.dmg'),
      macIntel: url('-x64.dmg')
    };
  } catch {
    return AUCUN;
  }
}
