(() => {
  const saved = (() => {
    try { return localStorage.getItem("nocturne-locale"); } catch { return null; }
  })();
  const queryLocale = new URLSearchParams(window.location.search).get("lang");
  const locale = queryLocale === "zh" || queryLocale === "en" ? queryLocale : (saved === "zh" || saved === "en" ? saved : (/^zh(?:-|$)/i.test(navigator.language || "") ? "zh" : "en"));
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-legal-lang]").forEach((section) => {
    section.hidden = section.dataset.legalLang !== locale;
  });
  document.querySelectorAll("[data-legal-locale]").forEach((button) => {
    button.classList.toggle("active", button.dataset.legalLocale === locale);
    button.addEventListener("click", () => {
      try { localStorage.setItem("nocturne-locale", button.dataset.legalLocale); } catch { /* storage can be unavailable */ }
      const next = new URL(window.location.href);
      next.searchParams.set("lang", button.dataset.legalLocale);
      window.location.assign(next.toString());
    });
  });
})();
