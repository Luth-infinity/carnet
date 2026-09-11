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
 * Identité propre à Carnet (quadrillage Seyès, titres en Newsreader, sommaire,
 * touches, couverture de carnet) sur la palette noir et blanc commune aux
 * sites de Luth. Pas d'italique décoratif ni de petits textes de remplissage :
 * chaque texte doit dire quelque chose que le titre ne dit pas déjà.
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
  'inline-flex items-center justify-center gap-2 rounded-[8px] bg-ink px-5 py-3 text-[15px] font-medium text-white shadow-[0_6px_16px_-8px_rgba(11,12,14,.6)] transition hover:-translate-y-px hover:shadow-[0_10px_22px_-10px_rgba(11,12,14,.7)]';
const BOUTON_BLANC =
  'inline-flex items-center justify-center gap-2 rounded-[8px] border border-rule bg-sheet px-5 py-3 text-[15px] font-medium transition hover:border-ink/30';

/** Une capture posée comme une feuille. */
function Capture({ src, alt, sombre, priority }: { src: string; alt: string; sombre?: boolean; priority?: boolean }) {
  return (
    <div
      className={`reveal overflow-hidden rounded-[10px] p-1.5 ring-1 ${
        sombre
          ? 'bg-[#1b1c1f] ring-white/10 shadow-[0_40px_80px_-40px_rgba(0,0,0,.8)]'
          : 'bg-sheet ring-rule shadow-[0_1px_0_rgba(11,12,14,.04),0_36px_70px_-36px_rgba(11,12,14,.4)]'
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
          className="text-ink-soft hover:text-ink text-[14px] font-medium transition-colors"
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

function Hero({ t }: { t: Contenu }) {
  return (
    <section id="top" className="relative overflow-hidden">
      <div aria-hidden className="seyes absolute inset-0 [--marge:max(9px,calc((100vw-72rem)/2-24px))]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-5 pt-20 pb-24 lg:grid-cols-[1.4fr_1fr] lg:pt-28">
        <div>
          <h1 className="reveal titre text-[40px] text-balance sm:text-[52px] lg:text-[58px]">
            {t.hero.titre}
          </h1>
          <p className="reveal text-ink-soft mt-7 max-w-[50ch] text-[18px] leading-relaxed">{t.hero.texte}</p>
          <div className="reveal mt-9 flex flex-wrap items-center gap-3">
            <a href="#telecharger" className={BOUTON_ENCRE}>
              {t.hero.telecharger}
              <span aria-hidden>↓</span>
            </a>
            <a href={REPO} className={BOUTON_BLANC}>
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

function Pourquoi({ t }: { t: Contenu }) {
  return (
    <section id="pourquoi" className="mx-auto max-w-6xl px-5 py-28">
      <h2 className="reveal titre max-w-[20ch] text-[40px] text-balance sm:text-[52px]">{t.pourquoi.titre}</h2>
      <div className="reveal text-ink-soft mt-8 max-w-[65ch] space-y-5 text-[18px] leading-relaxed">
        <p>{t.pourquoi.p1}</p>
        <p>{t.pourquoi.p2}</p>
        <p className="text-ink font-medium">{t.pourquoi.p3}</p>
      </div>
    </section>
  );
}

/** Les fonctions en sommaire numéroté, avec points de conduite, plutôt qu'en cartes. */
function Sommaire({ t }: { t: Contenu }) {
  return (
    <section id="fonctions" className="bg-sheet border-rule border-y">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="reveal titre text-[40px] sm:text-[52px]">{t.fonctions.titre}</h2>
        <ol className="mt-14 grid gap-x-16 md:grid-cols-2">
          {t.fonctions.cartes.map((f, i) => (
            <li key={f.titre} className="reveal border-rule border-t py-7">
              <div className="flex items-baseline gap-4">
                <span className="text-ink-soft font-mono text-[13px]">{String(i + 1).padStart(2, '0')}</span>
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
      <h2 className="reveal titre text-[40px] sm:text-[52px]">{t.flux.titre}</h2>
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

function Duo({ section, src, inverse }: { section: Contenu['blocs']; src: string; inverse?: boolean }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-28">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.5fr]">
        <div className={`reveal ${inverse ? 'lg:order-2' : ''}`}>
          <h2 className="titre text-[38px] sm:text-[48px]">{section.titre}</h2>
          <p className="text-ink-soft mt-6 text-[17px] leading-relaxed">{section.p1}</p>
          <p className="text-ink-soft mt-4 text-[17px] leading-relaxed">{section.p2}</p>
        </div>
        <div className={inverse ? 'lg:order-1' : ''}>
          <Capture src={src} alt={section.alt} />
        </div>
      </div>
    </section>
  );
}

/** Les chiffres entre deux filets épais. */
function Chiffres({ t }: { t: Contenu }) {
  return (
    <section id="chiffres" className="mx-auto max-w-6xl px-5 pb-28">
      <div className="border-ink border-y-2 py-14">
        {/* Titre et texte au-dessus, chiffres alignés dessous : tout sur une
            seule rangée faisait des hauteurs en escalier */}
        <div className="reveal">
          <h2 className="titre text-[34px] text-balance sm:text-[42px]">{t.chiffres.titre}</h2>
          <p className="text-ink-soft mt-4 max-w-[60ch] text-[16px] leading-relaxed">{t.chiffres.sous}</p>
        </div>
        <div className="border-rule mt-12 grid gap-10 border-t pt-10 sm:grid-cols-3">
          {t.chiffres.items.map((c) => (
            <div key={c.legende} className="reveal">
              <p className="titre text-[40px] leading-none whitespace-nowrap">{c.valeur}</p>
              <p className="text-ink-soft mt-4 max-w-[30ch] text-[15px] leading-relaxed">{c.legende}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Sombre({ t }: { t: Contenu }) {
  return (
    <section id="sombre" className="bg-nuit text-white">
      <div className="mx-auto max-w-6xl px-5 py-28">
        <h2 className="reveal titre text-[40px] text-balance sm:text-[52px]">{t.sombre.titre}</h2>
        <p className="reveal mt-5 max-w-[60ch] text-[17px] leading-relaxed text-white/60">{t.sombre.texte}</p>
        <div className="mt-14">
          <Capture src="/app-sombre.png" alt={t.sombre.alt} sombre />
        </div>
      </div>
    </section>
  );
}

/** À savoir avant d'installer, en cases à cocher comme dans l'application. */
function Confiance({ t }: { t: Contenu }) {
  return (
    <section id="a-savoir" className="mx-auto max-w-6xl px-5 py-28">
      <h2 className="reveal titre text-[40px] text-balance sm:text-[52px]">{t.confiance.titre}</h2>
      <ul className="mt-12 grid gap-x-16 gap-y-9 md:grid-cols-2">
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
    </section>
  );
}

/** Le journal des versions, date et numéro dans la marge. */
async function Changelog({ t, locale }: Props) {
  const releases = await getReleases(locale);
  if (releases.length === 0) return null;

  return (
    <section id="versions" className="bg-sheet border-rule border-y">
      <div className="mx-auto max-w-6xl px-5 py-24">
        <h2 className="reveal titre text-[40px] sm:text-[52px]">{t.changelog.titre}</h2>
        <ol className="mt-12">
          {releases.map((release) => (
            <li key={release.version} className="reveal grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="md:border-r md:border-r-ink/15 md:pr-6 md:pb-10 md:text-right">
                <p className="text-[17px] font-medium">{release.version}</p>
                <p className="text-ink-soft mt-1 text-[14px]">{release.date}</p>
              </div>
              <div className="pb-10 md:pl-2">
                {release.points.length > 0 ? (
                  <ul className="space-y-2.5 text-[16px] leading-relaxed">
                    {release.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="bg-ink/40 mt-[0.7em] size-1 shrink-0 rounded-full" />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-soft text-[16px]">{t.changelog.vide}</p>
                )}
                <a
                  href={release.page}
                  className="text-ink-soft hover:text-ink mt-3 inline-block text-[14px] underline decoration-ink/30 underline-offset-4"
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

/** Le téléchargement en couverture de carnet noire, fermée par son élastique. */
function Telecharger({ t, dl }: { t: Contenu; dl: Telechargements }) {
  const principal =
    'inline-flex w-full items-center justify-center rounded-[8px] bg-white px-6 py-3.5 text-[15px] font-medium text-ink transition hover:-translate-y-px sm:w-auto';
  const secondaire = 'underline decoration-white/30 underline-offset-4 hover:text-white';

  return (
    <section id="telecharger" className="mx-auto max-w-6xl px-5 py-28">
      <div className="reveal relative mx-auto max-w-4xl overflow-hidden rounded-[14px] bg-[#111214] px-8 py-16 text-white shadow-[0_50px_90px_-45px_rgba(11,12,14,.75)] sm:px-16">
        <div
          aria-hidden
          className="absolute inset-y-0 right-14 w-3 bg-gradient-to-r from-black/60 via-black to-black/50 shadow-[inset_1px_0_0_rgba(255,255,255,.08)]"
        />

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
          <p className="mt-6 text-[14px] text-white/50">{t.telecharger.signature}</p>
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
          <a href={`${REPO}/stargazers`} className={BOUTON_BLANC}>
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
        <p className="flex items-center gap-2.5 text-[14px] font-medium">
          <Image src="/icon.png" alt="" width={64} height={64} className="size-5 rounded-[24%]" />
          Carnet
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
        <Hero t={t} />
        <div className="mx-auto -mt-6 max-w-6xl px-5 pb-8">
          <Capture src="/app-clair.png" alt={t.shot.alt} priority />
        </div>
        <Pourquoi t={t} />
        <Sommaire t={t} />
        <Touches t={t} />
        <Duo section={t.blocs} src="/app-blocs.png" />
        <Duo section={t.taches} src="/app-taches.png" inverse />
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
