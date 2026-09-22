import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.crystalsteps.net";
const data = JSON.parse(await readFile(path.join(root, "content/copy.json"), "utf8"));
const privacyClariguiz = await readFile(path.join(root, "content/privacy-clariguiz.html"), "utf8");
const privacyMonumente = await readFile(path.join(root, "content/privacy-monumente.html"), "utf8");

const langCodes = ["en", "it", "fr", "es"];

const files = {
  home: "index.html",
  clariguiz: "clariguiz.html",
  monumente: "monumente.html",
  privacyClariguiz: "privacy_clariguiz.html",
  privacyMonumente: "privacy.html",
};

const playIcon = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M8.2 5.4v13.2L19 12 8.2 5.4z"/></svg>`;
const appleIcon = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="7" y="3.5" width="10" height="17" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M10 7.2h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function publicPath(code, page) {
  const dir = data.languages[code].dir;
  const file = files[page];
  if (page === "home") return dir ? `/${dir}/` : "/";
  return dir ? `/${dir}/${file}` : `/${file}`;
}

function href(fromCode, toCode, page) {
  const fromDir = data.languages[fromCode].dir;
  const toDir = data.languages[toCode].dir;
  const file = files[page];
  if (fromDir === toDir) return file;
  if (!fromDir) return `${toDir}/${file}`;
  if (!toDir) return `../${file}`;
  return `../${toDir}/${file}`;
}

function asset(code, file) {
  return `${data.languages[code].dir ? "../" : ""}${file}`;
}

function canonical(code, page) {
  return origin + publicPath(code, page);
}

function alternates(page) {
  return langCodes
    .map((code) => `<link rel="alternate" hreflang="${code}" href="${esc(canonical(code, page))}">`)
    .join("\n  ");
}

function langSwitcher(fromCode, page) {
  const label = data.copy[fromCode].ui.langLabel;
  const links = langCodes
    .map((code) => {
      const current = code === fromCode ? ` aria-current="true"` : "";
      return `<a href="${esc(href(fromCode, code, page))}" hreflang="${code}" lang="${code}"${current}>${data.languages[code].label}</a>`;
    })
    .join("");
  return `<nav class="langs" aria-label="${esc(label)}">${links}</nav>`;
}

function footer(code, pageContext) {
  const home = data.copy[code].home;
  const from = pageContext;
  return `<footer class="site-footer">
  <div class="wrap">
    <p class="footer-line">
      <span>© CrystalSteps Studio</span>
      <a href="${esc(href(from, code, "privacyClariguiz"))}">Clariguiz · ${esc(home.privacyWord)}</a>
      <a href="${esc(href(from, code, "privacyMonumente"))}">Monumente · ${esc(home.privacyWord)}</a>
      <a href="mailto:${esc(data.email)}">${esc(home.contactLabel)} ${esc(data.email)}</a>
    </p>
  </div>
</footer>`;
}

function shell({ code, page, title, description, bodyClass, main, image, canonicalUrl, robots, switchPage }) {
  const prefix = data.languages[code].dir ? "../" : "";
  const navCurrent = (name) => (page === name ? ` aria-current="page"` : "");
  const clariguizCurrent = page === "clariguiz" || page === "privacyClariguiz" ? ` aria-current="page"` : navCurrent("clariguiz");
  const monumenteCurrent = page === "monumente" || page === "privacyMonumente" ? ` aria-current="page"` : navCurrent("monumente");
  const homeCurrent = page === "home" ? ` aria-current="page"` : "";
  const canon = canonicalUrl || canonical(code, page);
  const robotsTag = robots ? `\n  <meta name="robots" content="${esc(robots)}">` : "";
  const altLinks = switchPage ? "" : `${alternates(page)}\n  <link rel="alternate" hreflang="x-default" href="${esc(canonical("en", page))}">`;
  const switchTarget = switchPage || page;
  return `<!DOCTYPE html>
<html lang="${code}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="${esc(canon)}">${robotsTag}
  ${altLinks}
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(canon)}">
  <meta property="og:image" content="${esc(image)}">
  <meta property="og:locale" content="${data.languages[code].locale}">
  <meta name="theme-color" content="#f3efe7">
  <link rel="icon" href="${prefix}assets/images/logo.png" type="image/png">
  <link rel="apple-touch-icon" href="${prefix}assets/images/logo.png">
  <link rel="stylesheet" href="${prefix}assets/css/site.css">
</head>
<body class="${bodyClass}">
  <a class="skip" href="#content">${esc(data.copy[code].ui.skip)}</a>
  <header class="site-header">
    <div class="wrap header-bar">
      <a class="brand" href="${esc(href(code, code, "home"))}"${homeCurrent}>
        <img src="${prefix}assets/images/logo.png" alt="" width="128" height="128">
        <span>CrystalSteps</span>
      </a>
      <nav class="nav" aria-label="CrystalSteps">
        <a href="${esc(href(code, code, "clariguiz"))}"${clariguizCurrent}>Clariguiz</a>
        <a href="${esc(href(code, code, "monumente"))}"${monumenteCurrent}>Monumente</a>
      </nav>
      ${langSwitcher(code, switchTarget)}
    </div>
  </header>
  <main id="content">
${main}
  </main>
  ${footer(code, code)}
</body>
</html>
`;
}

function stores(app, copy) {
  const urls = data.stores[app];
  const attrs = `target="_blank" rel="noopener noreferrer"`;
  return `<div class="stores">
        <a class="store" href="${esc(urls.play)}" ${attrs}>${playIcon}${esc(copy.playLabel)}</a>
        <a class="store" href="${esc(urls.apple)}" ${attrs}>${appleIcon}${esc(copy.appleLabel)}</a>
      </div>`;
}

function homePage(code) {
  const copy = data.copy[code].home;
  const ui = data.copy[code].ui;
  const prefix = data.languages[code].dir ? "../" : "";
  const main = `    <section class="hero">
      <div class="wrap">
        <h1>${esc(copy.heroTitle)}</h1>
        <div class="rule" aria-hidden="true"></div>
        <p class="lede">${esc(copy.heroSubtitle)}</p>
        <p class="body">${esc(copy.heroBody)}</p>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <h2 class="section-title">${esc(copy.section)}</h2>
        <div class="app-grid">
          <article class="app-card card-clariguiz">
            <img class="app-icon" src="${prefix}assets/images/clariguiz-icon.jpg" alt="${esc(ui.iconAlt.replace("{app}", "Clariguiz"))}" width="512" height="512">
            <h3><a href="${esc(href(code, code, "clariguiz"))}">Clariguiz</a></h3>
            <p>${esc(copy.clariguizCard)}</p>
            <a class="cta" href="${esc(href(code, code, "clariguiz"))}">${esc(copy.clariguizCta)} <span aria-hidden="true">→</span></a>
          </article>
          <article class="app-card card-monumente">
            <img class="app-icon" src="${prefix}assets/images/monumente-icon.jpg" alt="${esc(ui.iconAlt.replace("{app}", "Monumente"))}" width="512" height="512">
            <h3><a href="${esc(href(code, code, "monumente"))}">Monumente</a></h3>
            <p>${esc(copy.monumenteCard)}</p>
            <a class="cta" href="${esc(href(code, code, "monumente"))}">${esc(copy.monumenteCta)} <span aria-hidden="true">→</span></a>
          </article>
        </div>
      </div>
    </section>`;
  return shell({
    code,
    page: "home",
    title: copy.title,
    description: copy.description,
    bodyClass: "page-home",
    main,
    image: `${origin}/assets/images/logo.png`,
  });
}

function appPage(code, app) {
  const copy = data.copy[code][app];
  const ui = data.copy[code].ui;
  const prefix = data.languages[code].dir ? "../" : "";
  const privacyPage = app === "clariguiz" ? "privacyClariguiz" : "privacyMonumente";
  const what = copy.what.map((item) => `<li>${esc(item)}</li>`).join("\n          ");
  const why = copy.why.map((item) => `<li>${esc(item)}</li>`).join("\n          ");
  const main = `    <section class="page-intro">
      <div class="wrap product-hero">
        <div>
          <img class="product-icon" src="${prefix}assets/images/${app}-icon.jpg" alt="${esc(ui.iconAlt.replace("{app}", copy.heroTitle))}" width="512" height="512">
          <h1>${esc(copy.heroTitle)}</h1>
          <div class="rule" aria-hidden="true"></div>
          <p class="lede">${esc(copy.heroSubtitle)}</p>
          <p class="body">${esc(copy.heroBody)}</p>
          ${stores(app, copy)}
        </div>
        <figure class="shot">
          <img src="${prefix}assets/images/${app}-screen.jpg" alt="${esc(ui.screenAlt.replace("{app}", copy.heroTitle))}" width="390" height="844">
        </figure>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <h2 class="section-title">${esc(copy.whatTitle)}</h2>
        <ul class="points">
          ${what}
        </ul>
      </div>
    </section>
    <section class="section">
      <div class="wrap">
        <h2 class="section-title">${esc(copy.whyTitle)}</h2>
        <ul class="why">
          ${why}
        </ul>
        <p class="privacy-jump"><a href="${esc(href(code, code, privacyPage))}">${esc(copy.privacyLabel)}</a></p>
      </div>
    </section>`;
  return shell({
    code,
    page: app,
    title: copy.title,
    description: copy.description,
    bodyClass: app === "clariguiz" ? "page-clariguiz" : "page-monumente",
    main,
    image: `${origin}/assets/images/${app}-icon.jpg`,
  });
}

function privacyPage(code, app) {
  const ui = data.copy[code].ui;
  const product = data.copy[code][app];
  const isClariguiz = app === "clariguiz";
  const page = isClariguiz ? "privacyClariguiz" : "privacyMonumente";
  const title = isClariguiz ? ui.privacyClariguizTitle : ui.privacyMonumenteTitle;
  const description = isClariguiz ? ui.privacyClariguizDescription : ui.privacyMonumenteDescription;
  const legal = isClariguiz ? privacyClariguiz : privacyMonumente;
  const note = ui.legalNote ? `<p class="legal-note">${esc(ui.legalNote)}</p>` : "";
  const main = `    <section class="page-intro">
      <div class="wrap">
        <p class="kicker"><a href="${esc(href(code, code, app))}">${esc(product.heroTitle)}</a></p>
        <h1>${esc(product.privacyLabel)}</h1>
        <div class="rule" aria-hidden="true"></div>
        ${note}
      </div>
    </section>
    <section class="section">
      <div class="wrap legal">
        ${legal.trim()}
      </div>
    </section>`;
  return shell({
    code,
    page,
    title,
    description,
    bodyClass: isClariguiz ? "page-clariguiz" : "page-monumente",
    main,
    image: `${origin}/assets/images/${app}-icon.jpg`,
  });
}

function notFound() {
  const code = "en";
  const ui = data.copy.en.ui;
  const links = langCodes
    .map((lang) => {
      const label = data.languages[lang].label;
      const title = data.copy[lang].ui.notFoundTitle;
      return `<li><a href="${esc(href("en", lang, "home"))}" hreflang="${lang}" lang="${lang}">${label} — ${esc(title)}</a></li>`;
    })
    .join("\n        ");
  const main = `    <section class="not-found">
      <div class="wrap">
        <h1>${esc(ui.notFoundTitle)}</h1>
        <div class="rule" aria-hidden="true"></div>
        <p>${esc(ui.notFoundBody)}</p>
        <ul class="points">
        ${links}
        </ul>
      </div>
    </section>`;
  return shell({
    code,
    page: "missing",
    switchPage: "home",
    canonicalUrl: `${origin}/404.html`,
    robots: "noindex",
    title: `${ui.notFoundTitle} — CrystalSteps Studio`,
    description: ui.notFoundBody,
    bodyClass: "page-home",
    main,
    image: `${origin}/assets/images/logo.png`,
  });
}

const rendered = [];

for (const code of langCodes) {
  const jobs = [
    ["home", homePage(code)],
    ["clariguiz", appPage(code, "clariguiz")],
    ["monumente", appPage(code, "monumente")],
    ["privacyClariguiz", privacyPage(code, "clariguiz")],
    ["privacyMonumente", privacyPage(code, "monumente")],
  ];
  for (const [page, html] of jobs) {
    const dir = data.languages[code].dir;
    const destDir = dir ? path.join(root, dir) : root;
    await mkdir(destDir, { recursive: true });
    const dest = path.join(destDir, files[page]);
    await writeFile(dest, html);
    rendered.push({ dest, html, code, page });
  }
}

await writeFile(path.join(root, "404.html"), notFound());

const banned = [/TrippaTrip/i, /TrainOn/i, /Mobirise/i, /emrld/i, /MonuMente/, /nisrulz/i];
const requiredStores = Object.values(data.stores).flatMap((entry) => [entry.play, entry.apple]);

for (const item of rendered) {
  if (item.html.length > 80000) {
    throw new Error(`${item.dest} is ${item.html.length} bytes`);
  }
  for (const pattern of banned) {
    if (pattern.test(item.html)) throw new Error(`${item.dest} contains ${pattern}`);
  }
  const copy = data.copy[item.code];
  const strings = [];
  if (item.page === "home") strings.push(...Object.values(copy.home));
  if (item.page === "clariguiz" || item.page === "monumente") {
    const block = copy[item.page];
    strings.push(block.title, block.description, block.heroTitle, block.heroSubtitle, block.heroBody, block.whatTitle, block.whyTitle, block.privacyLabel, ...block.what, ...block.why);
    for (const url of [data.stores[item.page].play, data.stores[item.page].apple]) {
      if (!item.html.includes(url)) throw new Error(`${item.dest} missing ${url}`);
    }
  }
  if (item.page === "privacyClariguiz" || item.page === "privacyMonumente") {
    const app = item.page === "privacyClariguiz" ? "clariguiz" : "monumente";
    strings.push(copy[app].privacyLabel);
    if (!item.html.includes("info@crystalsteps.net")) throw new Error(`${item.dest} missing contact`);
  }
  for (const value of strings) {
    if (typeof value === "string" && !item.html.includes(esc(value))) {
      throw new Error(`${item.dest} missing copy: ${value}`);
    }
  }
}

for (const url of requiredStores) {
  const hits = rendered.filter((item) => item.html.includes(url));
  if (!hits.length) throw new Error(`store URL never rendered: ${url}`);
}

console.log(`Built ${rendered.length + 1} HTML files.`);
