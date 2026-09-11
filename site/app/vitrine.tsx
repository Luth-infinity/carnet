import Image from 'next/image';
import { Reveal } from './reveal';
import { getReleases, getTelechargements, PAGE_VERSIONS, type Telechargements } from './releases';
import { SUPPORT_URL } from './support';
import type { Contenu, Locale } from './content';
import { LangLink } from './lang-link';
import { Demo } from './demo';

/**
 * La page, une seule fois, alimentée par le dictionnaire de la langue.
 *
 * Direction artistique propre à Carnet, sans rien reprendre de Hublink : papier
 * crème et quadrillage Seyès, titres en Newsreader (la police serif de
 * l'application), accents bleu coche et jaune surligneur, légendes de figures
 * et sommaire éditorial. Seule la mécanique (releases, OS, langues) est commune.
 *
 * Le fichier ne s'appelle pas `Page.tsx` : sous Windows, ce serait le même
 * fichier que la route `page.tsx`.
 */

const REPO = 'https://github.com/Luth-infinity/carnet';
const SUITE = 'https://luth-apps.vercel.app';
const RELEASE = `${REPO}/releases/latest`;
type Props = { t: Contenu; locale: Locale };

const autreLangue = (locale: Locale) => (locale === 'en' ? '/fr' : '/');

const BOUTON_ENCRE =
  'inline-flex items-center justify-center gap-2 rounded-[8px] bg-ink px-5 py-3 text-[15px] font-medium text-paper shadow-[0_1px_0_rgba(255,255,255,.12)_inset,0_6px_16px_-8px_rgba(31,28,23,.6)] transition hover:-translate-y-px hover:shadow-[0_1px_0_rgba(255,255,255,.12)_inset,0_10px_22px_-10px_rgba(31,28,23,.7)]';
const BOUTON_PAPIER =
  'inline-flex items-center justify-center gap-2 rounded-[8px] border border-rule bg-sheet px-5 py-3 text-[15px] font-medium transition hover:border-ink/30';

/** Cadre d'une capture : une feuille posée, avec sa légende numérotée. */
function Figure({
  src,
  alt,
  numero,
  t,
  sombre,
  priority
}: {
  src: string;
  alt: string;
  numero: number;
  t: Contenu;
  sombre?: boolean;
  priority?: boolean;
}) {
  return (
    <figure className="reveal">
      <div
        className={`overflow-hidden rounded-[10px] p-1.5 ring-1 ${
          sombre
            ? 'bg-[#232226] ring-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]'
            : 'bg-sheet ring-rule shadow-[0_1px_0_rgba(31,28,23,.04),0_36px_70px_-36px_rgba(31,28,23,.4)]'
        }`}
      >
        <Image
          src={src}
          alt={alt}
          width={2560}
          height={1600}
          priority={priority}
          sizes="(min-width: 1024px) 1100px, 100vw"
          className="w-full rounded-[6px]"
        />
      </div>
      <figcaption className={`mt-3 font-serif text-[14px] italic ${sombre ? 'text-white/55' : 'text-ink-soft'}`}>
        <span className="not-italic font-mono text-[11px] tracking-wider uppercase">
          {t.libelles.figure} {numero}
        </span>{' '}
        {alt}
      </figcaption>
    </figure>
  );
}

function Nav({ t, locale }: Props) {
  const lien = 'hidden text-[14px] text-ink-soft transition-colors hover:text-ink md:block';
  return (
    <header className="bg-paper/85 border-rule sticky top-0 z-50 border-b backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-7 px-5">
        <a href="#top" className="mr-auto flex items-center gap-2.5">
          <Image src="/icon.png" alt="" width={64} height={64} className="size-7 rounded-[24%]" />
          <span className="titre text-[24px] leading-none">Carnet</span>
        </a>
        <a href="#fonctions" className={lien}>
          {t.nav.fonctions}
        </a>
        <a href="#versions" className={lien}>
          {t.nav.versions}
        </a>
        <a href={REPO} className={lien}>
          GitHub
        </a>
        <LangLink
          href={autreLangue(locale)}
          hrefLang={locale === 'en' ? 'fr' : 'en'}
          className="text-ink-soft hover:text-ink font-mono text-[12px] tracking-wider transition-colors"
        >
          {t.nav.autreLangue}
        </LangLink>
        <a href="#telecharger" className={`${BOUTON_ENCRE} px-4 py-2 text-[14px]`}>
          {t.nav.telecharger}
        </a>
      </nav>
    </header>
  );
}

function Hero({ t, version }: { t: Contenu; version: string }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="seyes absolute inset-0 [--marge:max(9px,calc((100vw-72rem)/2-24px))]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pt-16 pb-24 lg:grid-cols-[1.15fr_1fr] lg:pt-24">
        <div>
          <p className="reveal rubrique flex items-center gap-2">
            <span className="bg-bleu size-1.5 rounded-full" />
            {t.hero.badge(version || '0.1')}
          </p>
          <h1 className="reveal titre mt-6 text-[48px] sm:text-[68px] lg:text-[80px]">
            {t.hero.titre} <em className="surligne">{t.hero.titreSurligne}</em>
          </h1>
          <p className="reveal text-ink-soft mt-7 max-w-[50ch] text-[18px] leading-relaxed">{t.hero.texte}</p>
          <div className="reveal mt-9 flex flex-wrap items-center gap-3">
            <a href="#telecharger" className={BOUTON_ENCRE}>
              {t.hero.telecharger}
              <span aria-hidden>↓</span>
            </a>
            <a href={REPO} className={BOUTON_PAPIER}>
              {t.hero.code}
            </a>
          </div>
        </div>
        <div className="reveal mx-auto w-full max-w-[440px]">
          <Demo t={t.demo} />
        </div>
      </div>
    </section>
  );
}

function Shot({ t }: { t: Contenu }) {
  return (
    <div className="mx-auto -mt-6 max-w-6xl px-5 pb-8">
      <Figure src="/app-clair.png" alt={t.shot.alt} numero={1} t={t} priority />
    </div>
  );
}

function Pourquoi({ t }: { t: Contenu }) {
  return (
    <section id="pourquoi" className="mx-auto max-w-6xl px-5 py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <h2 className="reveal titre text-[40px] sm:text-[52px]">{t.pourquoi.titre}</h2>
        <div className="reveal text-ink-soft space-y-5 text-[18px] leading-relaxed">
          <p>{t.pourquoi.p1}</p>
          <p>{t.pourquoi.p2}</p>
          {/* La conclusion en citation de marge, filet rouge du cahier */}
          <p className="border-marge text-ink border-l-2 pl-5 font-serif text-[23px] leading-snug italic">
            {t.pourquoi.p3}
          </p>
        </div>
      </div>
    </section>
  );
}

/** Les fonctions en sommaire numéroté, avec points de conduite, plutôt qu'en cartes. */
function Sommaire({ t }: { t: Contenu }) {
  return (
    <section id="fonctions" className="bg-sheet border-rule border-y">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <p className="reveal rubrique">{t.libelles.sommaire}</p>
        <h2 className="reveal titre mt-4 text-[40px] sm:text-[52px]">{t.fonctions.titre}</h2>
        <ol className="mt-14 grid gap-x-16 md:grid-cols-2">
          {t.fonctions.cartes.map((f, i) => (
            <li key={f.titre} className="reveal border-rule border-t py-7">
              <div className="flex items-baseline gap-4">
                <span className="text-bleu font-mono text-[13px]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="titre text-[25px]">{f.titre}</h3>
                <span aria-hidden className="border-rule mb-1.5 flex-1 border-b border-dotted" />
              </div>
              <p className="text-ink-soft mt-3 pl-9 text-[16px] leading-relaxed">{f.texte}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Touches({ t }: { t: Contenu }) {
  return (
    <section id="flux" className="mx-auto max-w-6xl px-5 py-28">
      <div className="max-w-2xl">
        <h2 className="reveal titre text-[40px] sm:text-[52px]">{t.flux.titre}</h2>
        <p className="reveal text-ink-soft mt-5 text-[18px] leading-relaxed">{t.flux.sous}</p>
      </div>
      <ol className="mt-16 grid gap-12 md:grid-cols-3">
        {t.flux.etapes.map((e) => (
          <li key={e.titre} className="reveal">
            <div className="flex h-16 items-end gap-2 text-[18px]">
              {e.touches.map((k, i) => (
                <span key={k} className="flex items-center gap-2">
                  {i > 0 && <span className="text-ink-soft text-[14px]">+</span>}
                  <kbd className="touche">{k}</kbd>
                </span>
              ))}
            </div>
            <h3 className="titre mt-7 text-[26px]">{e.titre}</h3>
            <p className="text-ink-soft mt-3 text-[16px] leading-relaxed">{e.texte}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Duo({
  t,
  section,
  src,
  numero,
  inverse
}: {
  t: Contenu;
  section: Contenu['blocs'];
  src: string;
  numero: number;
  inverse?: boolean;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className={`reveal ${inverse ? 'lg:order-2' : ''}`}>
          <h2 className="titre text-[38px] sm:text-[48px]">{section.titre}</h2>
          <p className="text-ink-soft mt-6 text-[17px] leading-relaxed">{section.p1}</p>
          <p className="text-ink-soft mt-4 text-[17px] leading-relaxed">{section.p2}</p>
        </div>
        <div className={inverse ? 'lg:order-1' : ''}>
          <Figure src={src} alt={section.alt} numero={numero} t={t} />
        </div>
      </div>
    </section>
  );
}

/** Les chiffres posés sur une portée de cahier : grands numéraux italiques entre deux filets. */
function Chiffres({ t }: { t: Contenu }) {
  return (
    <section id="chiffres" className="mx-auto max-w-6xl px-5 pb-28">
      <div className="border-ink border-y-2 py-14">
        <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="reveal">
            <h2 className="titre text-[34px] sm:text-[42px]">{t.chiffres.titre}</h2>
            <p className="text-ink-soft mt-4 text-[16px] leading-relaxed">{t.chiffres.sous}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-3">
            {t.chiffres.items.map((c) => {
              const [nombre, ...mots] = c.valeur.split(' ');
              return (
                <div key={c.legende} className="reveal">
                  <p className="titre text-[76px] leading-[0.85] italic">{nombre}</p>
                  <p className="rubrique text-ink mt-3">{mots.join(' ')}</p>
                  <p className="text-ink-soft mt-2 text-[14px] leading-relaxed">{c.legende}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sombre({ t }: { t: Contenu }) {
  return (
    <section id="sombre" className="bg-nuit text-white">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_1fr]">
          <h2 className="reveal titre text-[40px] sm:text-[54px]">
            {t.sombre.titre.split(',')[0]}
            {t.sombre.titre.includes(',') && (
              <>
                ,<br />
                <em className="text-white/60">{t.sombre.titre.split(',').slice(1).join(',').trim()}</em>
              </>
            )}
          </h2>
          <p className="reveal max-w-[46ch] text-[17px] leading-relaxed text-white/60">{t.sombre.texte}</p>
        </div>
        <div className="mt-14">
          <Figure src="/app-sombre.png" alt={t.sombre.alt} numero={4} t={t} sombre />
        </div>
      </div>
    </section>
  );
}

/** À savoir avant d'installer : une liste de cases vides, à la manière de l'application. */
function Confiance({ t }: { t: Contenu }) {
  return (
    <section id="a-savoir" className="mx-auto max-w-6xl px-5 py-28">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="reveal">
          <h2 className="titre text-[40px] sm:text-[48px]">{t.confiance.titre}</h2>
          <p className="text-ink-soft mt-5 text-[17px] leading-relaxed">{t.confiance.intro}</p>
        </div>
        <ul className="space-y-7">
          {t.confiance.points.map(([titre, texte]) => (
            <li key={titre} className="reveal flex gap-4">
              <span className="border-ink/30 mt-1 size-[18px] shrink-0 rounded-[5px] border-[1.5px]" />
              <div>
                <p className="text-[17px] font-medium">{titre}</p>
                <p className="text-ink-soft mt-1.5 text-[16px] leading-relaxed">{texte}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Le journal des versions, date dans la marge rouge comme un cahier daté. */
async function Changelog({ t, locale }: Props) {
  const releases = await getReleases(locale);
  if (releases.length === 0) return null;

  return (
    <section id="versions" className="bg-sheet border-rule border-y">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <p className="reveal rubrique">{t.libelles.journal}</p>
        <h2 className="reveal titre mt-4 text-[40px] sm:text-[52px]">{t.changelog.titre}</h2>
        <p className="reveal text-ink-soft mt-4 text-[17px]">{t.changelog.sous(releases.length)}</p>

        <ol className="mt-12">
          {releases.map((release, index) => (
            <li key={release.version} className="reveal grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="md:border-r md:border-r-marge/70 md:pr-6 md:text-right md:pb-10">
                <p className="font-serif text-[16px] italic">{release.date}</p>
                <p className="text-ink-soft mt-1 font-mono text-[12px]">
                  v{release.version}
                  {index === 0 && <span className="text-bleu"> · {t.changelog.actuelle}</span>}
                </p>
              </div>
              <div className="pb-10 md:pl-2">
                {release.points.length > 0 ? (
                  <ul className="space-y-2.5 text-[16px] leading-relaxed">
                    {release.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="text-ink-soft mt-[0.1em] font-serif">–</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-soft text-[16px]">{t.changelog.vide}</p>
                )}
                <a
                  href={release.page}
                  className="text-bleu mt-3 inline-block text-[14px] underline decoration-1 underline-offset-4"
                >
                  {t.changelog.detail}
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Le téléchargement en couverture de carnet : toile sombre, élastique, étiquette. */
function Telecharger({ t, dl }: { t: Contenu; dl: Telechargements }) {
  const principal =
    'inline-flex w-full items-center justify-center rounded-[8px] bg-paper px-6 py-3.5 text-[15px] font-medium text-ink transition hover:-translate-y-px hover:bg-white sm:w-auto';
  const secondaire = 'underline decoration-white/30 underline-offset-4 hover:text-white';

  return (
    <section id="telecharger" className="mx-auto max-w-6xl px-5 py-28">
      <div className="reveal relative mx-auto max-w-4xl overflow-hidden rounded-[14px] bg-[#211f1c] px-8 py-16 text-white shadow-[0_50px_90px_-45px_rgba(31,28,23,.75)] sm:px-16">
        {/* Grain de la toile */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0 1px, transparent 1px 3px), repeating-linear-gradient(-45deg, #fff 0 1px, transparent 1px 3px)'
          }}
        />
        {/* L'élastique qui ferme le carnet */}
        <div aria-hidden className="absolute inset-y-0 right-14 w-3 bg-gradient-to-r from-black/50 via-[#0d0c0b] to-black/40 shadow-[inset_1px_0_0_rgba(255,255,255,.08)]" />

        <div className="relative max-w-xl">
          <Image src="/icon.png" alt="" width={128} height={128} className="size-14 rounded-[24%] ring-1 ring-white/15" />
          <h2 className="titre mt-7 text-[44px] sm:text-[58px]">{t.telecharger.titre}</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-white/65">{t.telecharger.sous(dl.version || '0.1')}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a data-cta="win" href={dl.win ?? PAGE_VERSIONS} className={principal}>
              {t.telecharger.win}
            </a>
            <a data-cta="mac" href={dl.macArm ?? PAGE_VERSIONS} className={principal}>
              {t.telecharger.mac}
            </a>
          </div>

          <p className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[14px] text-white/60">
            <a data-cta="win" href={dl.winArm ?? PAGE_VERSIONS} className={secondaire}>
              {t.telecharger.winArm}
            </a>
            <a data-cta="mac" href={dl.macIntel ?? PAGE_VERSIONS} className={secondaire}>
              {t.telecharger.macIntel}
            </a>
            <a href={PAGE_VERSIONS} className={secondaire}>
              {t.telecharger.noteLien}
            </a>
          </p>
          <p className="mt-6 font-serif text-[15px] italic text-white/50">{t.telecharger.signature}</p>
        </div>
      </div>
    </section>
  );
}

function Soutenir({ t }: { t: Contenu }) {
  if (!SUPPORT_URL) return null;
  return (
    <section id="soutenir" className="mx-auto max-w-6xl px-5 pb-24">
      <div className="reveal border-rule flex flex-col gap-8 border-t pt-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 className="titre text-[34px] sm:text-[40px]">{t.soutenir.titre}</h2>
          <p className="text-ink-soft mt-4 text-[17px] leading-relaxed">{t.soutenir.texte}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer noopener" className={BOUTON_ENCRE}>
            {t.soutenir.cafe}
          </a>
          <a href={`${REPO}/stargazers`} className={BOUTON_PAPIER}>
            {t.soutenir.etoile}
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: Contenu }) {
  return (
    <footer className="bg-sheet border-rule border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-5 py-10 md:flex-row">
        <p className="text-ink-soft flex items-center gap-2.5 font-serif text-[16px] italic">
          <Image src="/icon.png" alt="" width={64} height={64} className="size-5 rounded-[24%]" />
          {t.footer.signature}
        </p>
        <div className="text-ink-soft flex flex-wrap items-center justify-center gap-6 text-[14px]">
          <a href={SUITE} className="hover:text-ink">
            {t.footer.suite}
          </a>
          <a href={REPO} className="hover:text-ink">
            {t.footer.github}
          </a>
          <a href={RELEASE} className="hover:text-ink">
            {t.footer.versions}
          </a>
          <a href={`${REPO}/issues`} className="hover:text-ink">
            {t.footer.bug}
          </a>
          {SUPPORT_URL && (
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer noopener" className="hover:text-ink">
              {t.footer.soutenir}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default async function Vitrine({ t, locale }: Props) {
  const dl = await getTelechargements();

  return (
    <>
      <Reveal />
      <Nav t={t} locale={locale} />
      <main lang={locale}>
        <Hero t={t} version={dl.version} />
        <Shot t={t} />
        <Pourquoi t={t} />
        <Sommaire t={t} />
        <Touches t={t} />
        <Duo t={t} section={t.blocs} src="/app-blocs.png" numero={2} />
        <Duo t={t} section={t.taches} src="/app-taches.png" numero={3} inverse />
        <Chiffres t={t} />
        <Sombre t={t} />
        <Confiance t={t} />
        <Changelog t={t} locale={locale} />
        <Telecharger t={t} dl={dl} />
        <Soutenir t={t} />
      </main>
      <Footer t={t} />
    </>
  );
}
