// Production Capacitor builds use the same HTTPS service as the hosted web app
// so rooms, script metadata, guest deletion and locale detection work on-device.
// Opening index.html as a file gives the browser a null origin; the hosted API
// cannot return voice catalogs to that origin. Always use the local web server.
if (window.location.protocol === "file:" || (window.location.hostname === "127.0.0.1" && window.location.port === "4173")) {
  window.location.replace(`http://localhost:4173/${window.location.search}${window.location.hash}`);
}
window.NOCTURNE_API_BASE = "https://juben-lyart.vercel.app";
window.NOCTURNE_LOCALE_ENDPOINT = "https://juben-lyart.vercel.app/api/locale";
