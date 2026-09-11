'use client';

import * as React from 'react';
import type { Contenu } from './content';

/**
 * Une page de Carnet en miniature, sur sa feuille. Les cases se cochent pour
 * de vrai, avec la coche et le trait de l'application : le produit se
 * comprend mieux en le touchant qu'en le décrivant.
 */
export function Demo({ t }: { t: Contenu['demo'] }) {
  const [faites, setFaites] = React.useState(() => t.taches.map(([, coche]) => coche));
  const total = faites.filter(Boolean).length;

  return (
    <figure>
      <div className="relative">
        {/* Deux feuilles glissées dessous : une pile, pas une carte */}
        <div aria-hidden className="bg-sheet ring-rule absolute inset-0 translate-x-3 translate-y-2 rotate-[2.2deg] rounded-[10px] ring-1" />
        <div aria-hidden className="bg-sheet ring-rule absolute inset-0 -translate-x-2 translate-y-1.5 -rotate-[1.6deg] rounded-[10px] ring-1" />

        <div className="bg-sheet ring-rule relative rounded-[10px] px-7 pt-7 pb-6 shadow-[0_1px_0_rgba(31,28,23,.04),0_30px_60px_-30px_rgba(31,28,23,.35)] ring-1 sm:px-9">
          <div className="text-ink-soft flex items-center gap-1.5 text-[12px]">
            <span>📓</span>
            <span>{t.sousTitre}</span>
            <span className="opacity-40">/</span>
            <span className="text-ink">☀️ {t.titre}</span>
          </div>

          <p className="mt-5 text-[40px] leading-none">☀️</p>
          <h3 className="titre mt-3 text-[34px]">{t.titre}</h3>

          <ul className="mt-5 space-y-2.5">
            {t.taches.map(([texte], i) => {
              const coche = faites[i];
              return (
                <li key={texte}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={coche}
                    onClick={() => setFaites((f) => f.map((v, j) => (j === i ? !v : v)))}
                    className="group flex w-full items-center gap-3 text-left text-[15px]"
                  >
                    <span
                      className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors duration-200 ${
                        coche ? 'border-bleu bg-bleu' : 'border-ink/30 bg-sheet group-hover:border-bleu'
                      }`}
                    >
                      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                        <path
                          d="M2.5 6.2 5 8.6l4.6-5.2"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          pathLength={1}
                          style={{
                            strokeDasharray: 1,
                            strokeDashoffset: coche ? 0 : 1,
                            transition: 'stroke-dashoffset 220ms ease-out'
                          }}
                        />
                      </svg>
                    </span>
                    <span className="relative">
                      <span className={`transition-colors duration-300 ${coche ? 'text-ink-soft' : ''}`}>{texte}</span>
                      {/* Le trait se dessine de gauche à droite, comme au stylo */}
                      <span
                        aria-hidden
                        className="bg-ink-soft/70 absolute top-1/2 left-0 h-px transition-[width] duration-300 ease-out"
                        style={{ width: coche ? '100%' : '0%' }}
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 text-[15px]">
            {t.lienAvant}{' '}
            <span className="decoration-ink/25 inline-flex items-baseline gap-1 font-medium underline underline-offset-[3px]">
              <span className="no-underline">🚀</span>
              {t.lienPage}
            </span>
            .
          </p>

          <p className="text-ink-soft/60 mt-3 flex items-center text-[15px]">
            {t.placeholder}
            <span className="bg-ink ml-0.5 inline-block h-[1.1em] w-px animate-pulse" />
          </p>

          <div className="border-rule mt-6 flex items-center justify-between border-t pt-4">
            <span className="text-ink-soft font-mono text-[11px]">
              {total}/{t.taches.length}
            </span>
            <span className="bg-rule h-1 w-24 overflow-hidden rounded-full">
              <span
                className="bg-bleu block h-full rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${(total / t.taches.length) * 100}%` }}
              />
            </span>
          </div>
        </div>
      </div>

      <figcaption className="text-ink-soft mt-6 text-center font-serif text-[15px] italic">{t.legende}</figcaption>
    </figure>
  );
}
