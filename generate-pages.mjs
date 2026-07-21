
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import {
  BOARD_DATA, SCHOOL_DATA, PROVINCES, getPaperPath, getPaperURL, slug,
} from './neb-data.mjs';

/* ── CONFIG ─────────────────────────────────────────────── */
const CONFIG = {
  siteOrigin: 'https://neb-archive.pages.dev', // ← your real domain (no trailing slash)
  basePath: '',                              // ← subdir if not at root, e.g. '/site'
  outDir: 'papers',
  cssHref: '/CSS/style(pyqs).css',
  includeSolutionLinks: false,               // true only once -solution.pdf files exist
};

/* ── SMALL UTILS ────────────────────────────────────────── */
// AMP built from a char code so copy-pasting can never mangle the HTML entities.
const AMP = String.fromCharCode(38); // "&"
const esc = (s) => String(s)
  .replace(/&/g, AMP + 'amp;')
  .replace(/</g, AMP + 'lt;')
  .replace(/>/g, AMP + 'gt;')
  .replace(/"/g, AMP + 'quot;');
const withBase = (p) => `${CONFIG.basePath}${p}`;
const abs = (p) => `${CONFIG.siteOrigin}${withBase(p)}`;

const GRADE_LABEL = { 8: 'Grade 8 (BLE)', 10: 'Grade 10 (SEE)', 11: 'Grade 11', 12: 'Grade 12' };

const yearValue = (e) => (e && e.value) || e;
const baseYear = (v) => String(v).replace(/-model|-sup|-gie|-[a-z]/gi, '').replace(/[^0-9]/g, '').slice(0, 4);
const yearDisplay = (v) => String(v).replace(/-model$|-sup$|-gie$|-[a-z]+$/gi, '');
const yearSuffix = (v) => {
  const l = String(v).toLowerCase();
  return l.includes('model') ? ' (Model Question)' : l.includes('sup') ? ' (Supplementary)' : l.includes('gie') ? ' (GIE)' : '';
};
const yearRange = (values) => {
  const nums = values.map(baseYear).map(Number).filter(Boolean).sort((a, b) => a - b);
  if (!nums.length) return '';
  const lo = nums[0], hi = nums[nums.length - 1];
  return lo === hi ? `${lo}` : `${lo}-${hi}`;
};

/* ── COLLECT PAGES FROM DATA ────────────────────────────── */
function collectPages() {
  const pages = [];
  for (const [source, data] of [['board', BOARD_DATA], ['school', SCHOOL_DATA]]) {
    for (const grade of Object.keys(data)) {
      const node = data[grade];
      if (node.province) {
        for (const [subject, years] of Object.entries(node.subjects)) {
          if (!years.length) continue;
          pages.push({ source, grade, subject, years, kind: 'province' });
        }
      } else if (node.streams) {
        for (const [stream, sObj] of Object.entries(node.streams)) {
          for (const [subject, years] of Object.entries(sObj.subjects)) {
            if (!years.length) continue;
            pages.push({ source, grade, stream, subject, years, kind: 'stream' });
          }
        }
      }
    }
  }
  return pages;
}

/* ── VIEWER LINK (mirrors pyqs.js openViewerForCard) ────── */
function viewerHref({ source, grade, stream = '', subject, value, province = '', mode = 'paper' }) {
  const path = getPaperPath(source, grade, stream, subject, value, mode, province);
  const streamPart = stream ? ` (${stream})` : '';
  const provPart = province ? ` \u00b7 ${province}` : '';
  const title = `${subject}${streamPart} \u2014 ${GRADE_LABEL[grade] || 'Grade ' + grade}${provPart} \u00b7 ${yearDisplay(value)}`;
  const src = source === 'board' ? 'NEB' : 'School Paper';
  const q = new URLSearchParams({ url: getPaperURL(path), title, source: src, mode });
  return withBase(`/viewer.html?${q.toString()}`);
}

/* ── OUTPUT PATH + CANONICAL URL PER PAGE ───────────────── */
function pageDir(p) {
  return p.kind === 'province'
    ? join(CONFIG.outDir, p.source, String(p.grade), slug(p.subject))
    : join(CONFIG.outDir, p.source, String(p.grade), slug(p.stream), slug(p.subject));
}
const pageUrl = (p) => `/${pageDir(p).replace(/\\/g, '/')}/`;

/* ── SEO STRINGS ────────────────────────────────────────── */
function seo(p) {
  const range = yearRange(p.years.map(yearValue));
  const gLabel = GRADE_LABEL[p.grade] || `Grade ${p.grade}`;
  const org = p.source === 'board' ? 'NEB' : 'School';
  const streamBit = p.kind === 'stream' ? ` ${p.stream}` : '';
  const h1 = `${org} ${gLabel}${streamBit} ${p.subject} Question Papers${range ? ` (${range})` : ''}`;
  const title = `${h1} | NEB Archive`;
  const provNote = p.kind === 'province' ? ' Available for all 7 provinces.' : '';
  const desc = `Download & view ${org} ${gLabel}${streamBit} ${p.subject} previous year question papers${range ? ` from ${range}` : ''}. Free, no sign-up, opens instantly in-browser.${provNote}`;
  return { h1, title, desc: desc.slice(0, 158) };
}

/* ── PAPER-LINK ROWS ────────────────────────────────────── */
function paperRows(p) {
  const rows = [];
  for (const raw of p.years) {
    const value = yearValue(raw);
    const label = `${yearDisplay(value)}${yearSuffix(value)}`;
    if (p.kind === 'province') {
      for (const province of PROVINCES) {
        rows.push({
          label: `${p.subject} ${label} \u2014 ${province}`,
          href: viewerHref({ ...p, value, province }),
          solHref: CONFIG.includeSolutionLinks ? viewerHref({ ...p, value, province, mode: 'solution' }) : null,
        });
      }
    } else {
      rows.push({
        label: `${p.subject} ${label}`,
        href: viewerHref({ ...p, value }),
        solHref: CONFIG.includeSolutionLinks ? viewerHref({ ...p, value, mode: 'solution' }) : null,
      });
    }
  }
  return rows;
}

/* ── JSON-LD ────────────────────────────────────────────── */
function jsonLd(p, rows, meta) {
  const crumbs = [
    { name: 'Home', url: abs('/index.html') },
    { name: 'PYQs', url: abs('/pyqs.html') },
    { name: meta.h1, url: abs(pageUrl(p)) },
  ];
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
  };
  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList', name: meta.h1,
    itemListElement: rows.map((r, i) => ({
      '@type': 'ListItem', position: i + 1, name: r.label, url: CONFIG.siteOrigin + r.href,
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n<script type="application/ld+json">${JSON.stringify(itemList)}</script>`;
}

/* ── HTML SHELL ─────────────────────────────────────────── */
function layout({ title, desc, canonical, head = '', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${esc(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:url" content="${esc(canonical)}">
  <link rel="icon" type="image/svg+xml" href="${withBase('/favicon.svg')}">
  <script>(function(){try{document.documentElement.setAttribute('data-theme',localStorage.getItem('theme')||'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Hanken+Grotesk:wght@350;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@0.475.0"></script>
  <link rel="stylesheet" href="${withBase(CONFIG.cssHref)}">
  ${head}
</head>
<body>
  <header class="navbar" id="navbar">
    <div class="nav-container">
      <a href="${withBase('/index.html')}" class="logo"><span class="logo-mark"><i data-lucide="layers"></i></span> NEB Archive</a>
      <nav class="nav-links"><a href="${withBase('/index.html')}" class="nav-link">Home</a><a href="${withBase('/pyqs.html')}" class="nav-link">PYQs</a></nav>
    </div>
  </header>
  <main id="main-content" class="section"><div class="container">
${body}
  </div></main>
  <footer class="footer"><div class="container"><div class="footer-bottom">
    <p>\u00a9 <span id="year"></span> NEB Archive \u00b7 All Rights Reserved</p>
  </div></div></footer>
  <script>document.getElementById('year').textContent=new Date().getFullYear();if(window.lucide)lucide.createIcons();</script>
</body>
</html>`;
}

/* ── RENDER A SUBJECT PAGE ──────────────────────────────── */
function renderPage(p) {
  const meta = seo(p);
  const rows = paperRows(p);
  const canonical = abs(pageUrl(p));
  const gLabel = GRADE_LABEL[p.grade] || `Grade ${p.grade}`;
  const streamBit = p.kind === 'stream' ? ` \u00b7 ${p.stream}` : '';
  const srcLabel = p.source === 'board' ? 'NEB' : 'School Paper';

  const list = rows.map((r) => `
      <article class="paper-card" data-year>
        <div class="paper-icon"><i data-lucide="file-text"></i></div>
        <div>
          <a class="paper-title" href="${esc(r.href)}">${esc(r.label)}</a>
          <div class="paper-meta"><span>${esc(gLabel)}${esc(streamBit)}</span><span>\u00b7</span><span>${srcLabel}</span></div>
        </div>
        <div class="paper-actions">
          <a class="paper-action primary" href="${esc(r.href)}"><i data-lucide="eye"></i><span>View</span></a>
          ${r.solHref ? `<a class="paper-action" href="${esc(r.solHref)}"><i data-lucide="lightbulb"></i><span>Solution</span></a>` : ''}
        </div>
      </article>`).join('');

  const body = `
    <nav class="eyebrow" aria-label="Breadcrumb"><a href="${withBase('/index.html')}">Home</a> / <a href="${withBase('/pyqs.html')}">PYQs</a> / ${esc(gLabel)}${esc(streamBit)}</nav>
    <h1 class="hero-title" style="font-size:clamp(2rem,4vw,3rem)">${esc(meta.h1)}</h1>
    <p class="hero-subtitle" style="margin:16px 0 8px">${esc(meta.desc)}</p>
    <p><a class="btn btn-primary" href="${withBase('/pyqs.html')}">Open interactive browser <i data-lucide="arrow-right"></i></a></p>
    <div class="paper-list" style="margin-top:32px">${list}</div>
  ${jsonLd(p, rows, meta)}`;

  return { html: layout({ title: meta.title, desc: meta.desc, canonical, body }), dir: pageDir(p) };
}

/* ── HUB INDEX (/papers/) ───────────────────────────────── */
function renderHub(pages) {
  const groups = {};
  for (const p of pages) {
    const key = `${p.source === 'board' ? 'NEB' : 'School'} \u00b7 ${GRADE_LABEL[p.grade] || 'Grade ' + p.grade}${p.kind === 'stream' ? ' \u00b7 ' + p.stream : ''}`;
    (groups[key] = groups[key] || []).push(p);
  }
  const sections = Object.entries(groups).map(([g, ps]) => `
    <h2 style="margin-top:32px">${esc(g)}</h2>
    <div class="paper-list">${ps.map((p) => {
      const m = seo(p);
      return `<article class="paper-card"><div class="paper-icon"><i data-lucide="file-text"></i></div>
        <div><a class="paper-title" href="${withBase(pageUrl(p))}">${esc(m.h1)}</a></div></article>`;
    }).join('')}</div>`).join('');

  const body = `
    <span class="eyebrow">Question Bank</span>
    <h1 class="hero-title" style="font-size:clamp(2rem,4vw,3rem)">All NEB Question Paper Collections</h1>
    <p class="hero-subtitle">Every grade, stream and subject, indexed for direct search.</p>
    ${sections}`;
  return layout({
    title: 'All NEB Question Papers by Grade, Stream & Subject | NEB Archive',
    desc: 'Browse every NEB and school previous-year question paper collection, organized by grade, stream and subject. Free, no sign-up.',
    canonical: abs('/papers/'), body,
  });
}

/* ── SITEMAP + ROBOTS ───────────────────────────────────── */
function renderSitemap(pages) {
  const urls = [abs('/index.html'), abs('/pyqs.html'), abs('/papers/'), ...pages.map((p) => abs(pageUrl(p)))];
  const body = urls.map((u) => `  <url><loc>${esc(u)}</loc><changefreq>weekly</changefreq></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`;
}
function renderRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`;
}

/* ── BUILD ──────────────────────────────────────────────── */
async function build() {
  const pages = collectPages();
  await rm(CONFIG.outDir, { recursive: true, force: true });

  let count = 0;
  for (const p of pages) {
    const { html, dir } = renderPage(p);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html, 'utf8');
    count++;
  }

  await writeFile(join(CONFIG.outDir, 'index.html'), renderHub(pages), 'utf8');
  await writeFile('sitemap.xml', renderSitemap(pages), 'utf8');
  await writeFile('robots.txt', renderRobots(), 'utf8');

  console.log(`OK  ${count} subject pages -> ./${CONFIG.outDir}/`);
  console.log(`OK  hub index -> ./${CONFIG.outDir}/index.html`);
  console.log(`OK  sitemap   -> ./sitemap.xml (${count + 3} urls)`);
  console.log(`OK  robots    -> ./robots.txt`);
}

build().catch((err) => { console.error('BUILD FAILED:', err); process.exit(1); });