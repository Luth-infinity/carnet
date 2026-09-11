import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // L'application de bureau embarque le site exporté en fichiers statiques (dossier out/)
  output: "export",
  // Chaque route devient un dossier avec son index.html, que le protocole carnet:// sait servir
  trailingSlash: true,
}

export default nextConfig
