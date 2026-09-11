import type { Metadata } from 'next';
import './globals.css';

// Adresse publique : sert à résoudre l'image Open Graph en URL absolue
export const metadata: Metadata = {
  metadataBase: new URL('https://carnet-luth.vercel.app')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* `suppressHydrationWarning` : le script plus bas ajoute une classe à
       <html> avant l'hydratation, ce que React signalerait sinon comme une
       divergence serveur / client. */
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=Inter:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Marque la page comme animable seulement si JS tourne : sans cela, un
            échec de script laisserait tout le contenu invisible. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add('js')`
          }}
        />
        {/* Note la plateforme avant le rendu, pour ne proposer que le bon
            installeur. Un iPad se déclare « MacIntel » : on le distingue par le
            tactile. Plateforme inconnue : tous les boutons restent affichés. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
  var ua = navigator.userAgent || '';
  var pf = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
  var tactile = navigator.maxTouchPoints > 1;
  var os = '';
  if (/win/i.test(pf) || /Windows/.test(ua)) os = 'win';
  else if ((/mac/i.test(pf) || /Mac OS X/.test(ua)) && !tactile) os = 'mac';
  if (os) document.documentElement.dataset.os = os;
} catch (e) {}`
          }}
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
