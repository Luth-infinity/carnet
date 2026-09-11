import Image from 'next/image';
import { Reveal } from './reveal';
import { getReleases, getTelechargements, PAGE_VERSIONS, type Telechargements } from './releases';
import { SUPPORT_URL } from './support';
import type { Contenu, Locale } from './content';
import { LangLink } from './lang-link';

/**
 * La page, une seule fois, alimentée par le dictionnaire de la langue.
 *
 * Le fichier ne s'appelle pas `Page.tsx` : sous Windows, ce serait le même
 * fichier que la route `page.tsx`.
 */

const REPO = 'https://github.com/Luth-infinity/carnet';
// Le sommaire des applications : Carnet n'est pas seul.
const SUITE = 'https://luth-apps.vercel.app';
const RELEASE = `${REPO}/releases/latest`;
type Props = { t: Contenu; locale: Locale };

// L'anglais est servi à la racine, le français sous /fr.
const autreLangue = (locale: Locale) => (locale === 'en' ? '/fr' : '/');

const LIEN_NAV =
  'hidden rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:text-ink sm:block';

// Système de surfaces du site Hublink : blanc, filet très clair et ombre longue et douce
const CADRE_IMAGE =
  'reveal overflow-hidden rounded-[20px] bg-card p-2 shadow-[0_2px_4px_rgba(11,12,14,.04),0_24px_64px_-24px_rgba(11,12,14,.28)] ring-1 ring-line/70';
const CARTE =
  'reveal rounded-2xl bg-card p-6 shadow-[0_1px_2px_rgba(11,12,14,.05),0_12px_32px_-16px_rgba(11,12,14,.16)] ring-1 ring-line/60';

function Logo({ className = 'size-6' }: { className?: string }) {
  return <Image src="/icon.png" alt="" width={64} height={64} className={`${className} rounded-[24%]`} />;
}

function Nav({ t, locale }: Props) {
  return (
    <div className="sticky top-4 z-50 flex justify-center px-4">
      <nav className="bg-card/90 ring-line/60 flex items-center gap-1 rounded-full p-1.5 pl-3 shadow-[0_1px_2px_rgba(11,12,14,.06),0_8px_24px_-8px_rgba(11,12,14,.18)] ring-1 backdrop-blur">
        <a href="#top" className="mr-3 flex items-center gap-2 text-[15px] font-semibold tracking-tight">
          <Logo />
          Carnet
        </a>
        <a href="#fonctions" className={LIEN_NAV}>
          {t.nav.fonctions}
        </a>
        <a href="#versions" className={LIEN_NAV}>
          {t.nav.versions}
        </a>
        <a href={REPO} className={LIEN_NAV}>
          GitHub
        </a>
        <LangLink
          href={autreLangue(locale)}
          hrefLang={locale === 'en' ? 'fr' : 'en'}
          className="text-ink-soft hover:text-ink rounded-full px-2.5 py-1.5 text-sm font-medium transition-colors"
        >
          {t.nav.autreLangue}
        </LangLink>
        <a
          href="#telecharger"
          className="bg-ink ml-1 rounded-full px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
        >
          {t.nav.telecharger}
        </a>
      </nav>
    </div>
  );
}

function Hero({ t, version }: { t: Contenu; version: string }) {
  return (
    <header id="top" className="mx-auto max-w-6xl px-4 pt-16 pb-10 text-center sm:pt-24">
      <p className="reveal bg-card text-ink-soft ring-line mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] ring-1">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        {t.hero.badge(version || '0.1')}
      </p>
      <h1 className="reveal headline mx-auto max-w-[16ch] text-[13vw] sm:text-[76px] lg:text-[88px]">
        {t.hero.titre}
      </h1>
      <p className="reveal text-ink-soft mx-auto mt-6 max-w-[56ch] text-[17px] leading-relaxed">
        {t.hero.texte}
      </p>
      <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
        <a
          href="#telecharger"
          className="bg-ink rounded-full px-6 py-3 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
        >
          {t.hero.telecharger}
        </a>
        <a
          href={REPO}
          className="bg-card ring-line hover:bg-canvas rounded-full px-6 py-3 text-[15px] font-medium ring-1 transition-colors"
        >
          {t.hero.code}
        </a>
      </div>
    </header>
  );
}

function Capture({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={2560}
      height={1600}
      priority={priority}
      sizes="(min-width: 1024px) 1100px, 100vw"
      className="w-full rounded-[13px]"
    />
  );
}

function Shot({ t }: { t: Contenu }) {
  return (
    <div className="px-4 pb-4">
      <div className={`mx-auto max-w-5xl ${CADRE_IMAGE}`}>
        <Capture src="/app-clair.png" alt={t.shot.alt} priority />
      </div>
    </div>
  );
}

function Pourquoi({ t }: { t: Contenu }) {
  return (
    <section id="pourquoi" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="reveal headline max-w-[18ch] text-[40px] sm:text-[54px]">{t.pourquoi.titre}</h2>
        <div className="reveal text-ink-soft mt-8 grid gap-x-12 gap-y-5 text-[17px] leading-relaxed lg:grid-cols-2">
          <p>{t.pourquoi.p1}</p>
          <p>{t.pourquoi.p2}</p>
          <p className="text-ink font-medium lg:col-span-2">{t.pourquoi.p3}</p>
        </div>
      </div>
    </section>
  );
}

function Fonctions({ t }: { t: Contenu }) {
  return (
    <section id="fonctions" className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="reveal headline max-w-[14ch] text-[40px] sm:text-[54px]">{t.fonctions.titre}</h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.fonctions.cartes.map((f) => (
            <article key={f.titre} className={CARTE}>
              <h3 className="text-[17px] font-semibold tracking-tight">{f.titre}</h3>
              <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">{f.texte}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flux({ t }: { t: Contenu }) {
  return (
    <section id="flux" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="reveal headline max-w-[16ch] text-[40px] sm:text-[54px]">{t.flux.titre}</h2>
        <p className="reveal text-ink-soft mt-6 text-[17px] leading-relaxed">{t.flux.sous}</p>
        <ol className="mt-12 grid gap-4 lg:grid-cols-3">
          {t.flux.etapes.map((e, i) => (
            <li key={e.titre} className={`${CARTE} p-7`}>
              <div className="flex items-center gap-3">
                <span className="bg-ink flex size-6 items-center justify-center rounded-full text-[12px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="bg-canvas ring-line text-ink-soft rounded-full px-2.5 py-1 font-mono text-[11px] ring-1">
                  {e.cle}
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-semibold tracking-tight">{e.titre}</h3>
              <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">{e.texte}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Texte d'un côté, capture de l'autre ; `inverse` place la capture à gauche. */
function Duo({
  id,
  titre,
  p1,
  p2,
  alt,
  src,
  inverse
}: {
  id: string;
  titre: string;
  p1: string;
  p2: string;
  alt: string;
  src: string;
  inverse?: boolean;
}) {
  return (
    <section id={id} className="px-4 pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.35fr]">
        <div className={`reveal ${inverse ? 'lg:order-2' : ''}`}>
          <h2 className="headline text-[40px] sm:text-[52px]">{titre}</h2>
          <p className="text-ink-soft mt-6 max-w-[46ch] text-[17px] leading-relaxed">{p1}</p>
          <p className="text-ink-soft mt-4 max-w-[46ch] text-[17px] leading-relaxed">{p2}</p>
        </div>
        <div className={`${CADRE_IMAGE} ${inverse ? 'lg:order-1' : ''}`}>
          <Capture src={src} alt={alt} />
        </div>
      </div>
    </section>
  );
}

function Chiffres({ t }: { t: Contenu }) {
  return (
    <section id="chiffres" className="px-4 pb-24">
      <div className="mx-auto max-w-6xl">
        {/* Le bloc de contraste de Hublink : un aplat encre sur la page claire */}
        <div className="reveal bg-ink rounded-[24px] px-6 py-14 text-center text-white sm:px-12">
          <h2 className="headline mx-auto max-w-[18ch] text-[34px] sm:text-[46px]">{t.chiffres.titre}</h2>
          <p className="mx-auto mt-4 max-w-[56ch] text-[15px] leading-relaxed text-white/60">{t.chiffres.sous}</p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {t.chiffres.items.map((c) => (
              <div key={c.legende}>
                <p className="headline text-[30px] sm:text-[36px]">{c.valeur}</p>
                <p className="mx-auto mt-3 max-w-[26ch] text-[14px] leading-relaxed text-white/55">{c.legende}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Sombre({ t }: { t: Contenu }) {
  return (
    <section id="sombre" className="px-4 pb-24">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="reveal headline mx-auto max-w-[18ch] text-[40px] sm:text-[52px]">{t.sombre.titre}</h2>
        <p className="reveal text-ink-soft mx-auto mt-6 max-w-[56ch] text-[17px] leading-relaxed">{t.sombre.texte}</p>
        <div className={`mx-auto mt-12 max-w-5xl ${CADRE_IMAGE} bg-[#141416]`}>
          <Capture src="/app-sombre.png" alt={t.sombre.alt} />
        </div>
      </div>
    </section>
  );
}

function Confiance({ t }: { t: Contenu }) {
  return (
    <section id="a-savoir" className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <h2 className="reveal headline text-[40px] sm:text-[54px]">{t.confiance.titre}</h2>
        <p className="reveal text-ink-soft mt-6 max-w-[64ch] text-[17px] leading-relaxed">{t.confiance.intro}</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {t.confiance.points.map(([titre, texte]) => (
            <li key={titre} className={`${CARTE} p-5`}>
              <p className="text-[15px] font-semibold tracking-tight">{titre}</p>
              <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">{texte}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

async function Changelog({ t, locale }: Props) {
  const releases = await getReleases(locale);
  // Rien plutôt qu'une section vide si l'API GitHub n'a pas répondu.
  if (releases.length === 0) return null;

  return (
    <section id="versions" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="reveal headline text-[40px] sm:text-[54px]">{t.changelog.titre}</h2>
        <p className="reveal text-ink-soft mt-6 text-[17px] leading-relaxed">{t.changelog.sous(releases.length)}</p>

        <ol className="reveal bg-card ring-line/60 mt-10 overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(11,12,14,.05),0_12px_32px_-16px_rgba(11,12,14,.16)] ring-1">
          {releases.map((release, index) => (
            <li
              key={release.version}
              className="border-line grid gap-4 p-6 sm:grid-cols-[160px_1fr] sm:gap-8"
              style={index > 0 ? { borderTopWidth: 1 } : undefined}
            >
              <div>
                <p className="flex items-baseline gap-2 text-[17px] font-semibold tracking-tight">
                  {release.version}
                  {index === 0 && (
                    <span className="bg-ink rounded-full px-2 py-0.5 text-[10px] font-medium text-white">
                      {t.changelog.actuelle}
                    </span>
                  )}
                </p>
                <p className="text-ink-soft mt-1 text-[13px]">{release.date}</p>
              </div>
              <div>
                {release.points.length > 0 ? (
                  <ul className="text-ink-soft space-y-2 text-[15px] leading-relaxed">
                    {release.points.map((point) => (
                      <li key={point} className="flex gap-2.5">
                        <span className="bg-ink-soft/50 mt-2 size-1 shrink-0 rounded-full" />
                        {point}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-ink-soft text-[15px]">{t.changelog.vide}</p>
                )}
                <a
                  href={release.page}
                  className="text-ink-soft hover:text-ink mt-3 inline-block text-[13px] underline underline-offset-4"
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

function Telecharger({ t, dl }: { t: Contenu; dl: Telechargements }) {
  const principal =
    'bg-ink w-full rounded-full px-6 py-3.5 text-[15px] font-medium text-white transition-transform hover:scale-[1.02] sm:w-auto';
  const secondaire = 'hover:text-ink underline underline-offset-4';

  return (
    <section id="telecharger" className="px-4 pb-24">
      <div className="mx-auto max-w-6xl text-center">
        <Image src="/icon.png" alt="" width={128} height={128} className="reveal mx-auto size-16" />
        <h2 className="reveal headline mt-6 text-[40px] sm:text-[54px]">{t.telecharger.titre}</h2>
        <p className="reveal text-ink-soft mx-auto mt-5 max-w-[60ch] text-[17px] leading-relaxed">
          {t.telecharger.sous(dl.version || '0.1')}
        </p>

        {/* Le script du <head> pose `data-os` avant le rendu : l'autre bouton ne
            s'affiche pas. Plateforme inconnue ou JS coupé : les deux restent là. */}
        <div className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a data-cta="win" href={dl.win ?? PAGE_VERSIONS} className={principal}>
            {t.telecharger.win}
          </a>
          <a data-cta="mac" href={dl.macArm ?? PAGE_VERSIONS} className={principal}>
            {t.telecharger.mac}
          </a>
        </div>

        <p className="reveal text-ink-soft mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[13px]">
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

        <p className="reveal text-ink-soft mx-auto mt-5 max-w-[60ch] text-[13px] leading-relaxed">
          {t.telecharger.signature}
        </p>
      </div>
    </section>
  );
}

function Soutenir({ t }: { t: Contenu }) {
  // Rien plutôt qu'un lien mort tant que le pseudo n'est pas renseigné dans support.ts
  if (!SUPPORT_URL) return null;

  return (
    <section id="soutenir" className="px-4 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className={`${CARTE} rounded-[24px] p-8 sm:p-12`}>
          <h2 className="headline max-w-[20ch] text-[32px] sm:text-[42px]">{t.soutenir.titre}</h2>
          <p className="text-ink-soft mt-5 text-[16px] leading-relaxed">{t.soutenir.texte}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="bg-ink rounded-full px-6 py-3 text-[15px] font-medium text-white transition-transform hover:scale-[1.02]"
            >
              {t.soutenir.cafe}
            </a>
            <a
              href={`${REPO}/stargazers`}
              className="text-ink-soft ring-line hover:text-ink rounded-full px-5 py-3 text-[15px] font-medium ring-1 transition-colors"
            >
              {t.soutenir.etoile}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer({ t }: { t: Contenu }) {
  return (
    <footer className="px-4 pb-10">
      <div className="border-line mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
        <p className="text-ink-soft flex items-center gap-2 text-[14px]">
          <Logo className="size-4" />
          {t.footer.signature}
        </p>
        <div className="text-ink-soft flex flex-wrap items-center justify-center gap-5 text-[14px]">
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
      <main lang={locale} className="mx-auto max-w-[1600px] pb-px">
        <div className="bg-canvas mt-4 rounded-[28px] pt-2 pb-px">
          <Hero t={t} version={dl.version} />
          <Shot t={t} />
          <Pourquoi t={t} />
          <Fonctions t={t} />
          <Flux t={t} />
          <Duo id="blocs" src="/app-blocs.png" {...t.blocs} />
          <Duo id="taches" src="/app-taches.png" inverse {...t.taches} />
          <Chiffres t={t} />
          <Sombre t={t} />
          <Confiance t={t} />
          <Changelog t={t} locale={locale} />
          <Telecharger t={t} dl={dl} />
          <Soutenir t={t} />
          <Footer t={t} />
        </div>
      </main>
    </>
  );
}
