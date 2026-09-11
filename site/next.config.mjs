/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  // Le site vit dans le dépôt de l'application, qui a son propre package-lock.json
  outputFileTracingRoot: import.meta.dirname
};
