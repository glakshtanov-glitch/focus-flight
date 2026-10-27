// MapTiler key: read from .env.local when running locally,
// and from the MAPTILER_KEY repo secret when GitHub Actions builds the site.
export const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY
