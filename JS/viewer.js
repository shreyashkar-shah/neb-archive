/* ============================================================
   NEB Archive — PDF Viewer
   viewer.js is loaded as type="module" so ES imports work.
   lucide is loaded as a UMD global in viewer.html before this.
   ============================================================ */

import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs';
import { getPaperPath, getPaperURL, getSubjectYearValues } from '../neb-data.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';

/* ── URL PARAMS ─────────────────────────────────────────── */

const p       = new URLSearchParams(location.search);
const PDF_URL = p.get('url')    || '';
const TITLE   = p.get('title')  || 'Question Paper';
const GRADE   = p.get('grade')  || '';
const SOURCE  = p.get('source') || 'NEB Official';
const MODE    = p.get('mode')   || 'paper';

// Identity params — present on links generated from the PYQs page, absent
// on older/bare links. Everything below degrades gracefully when they're
// missing: swipe navigation just has nothing to navigate to.
const SRC      = p.get('src')      || '';
const STREAM   = p.get('stream')   || '';
const SUBJECT  = p.get('subject')  || '';
const PROVINCE = p.get('province') || '';

let activeYear = p.get('year') || '';
let activeMode = MODE;
let activeUrl  = PDF_URL;

const YEAR_LIST = (SRC && GRADE && SUBJECT)
    ? getSubjectYearValues(SRC, GRADE, STREAM, SUBJECT, PROVINCE)
    : [];

/* ── DOM ────────────────────────────────────────────────── */

const navbar        = document.getElementById('navbar');
const paperTitleNav = document.getElementById('paperTitleNav');
const sourceBadge   = document.getElementById('sourceBadge');
const loaderShell   = document.getElementById('loaderShell');
const errorShell    = document.getElementById('errorShell');
const canvasScroll  = document.getElementById('canvasScroll');
const pagesWrap     = document.getElementById('pagesWrap');
const progressBar   = document.getElementById('progressBar');
const prevBtn       = document.getElementById('prevPage');
const nextBtn       = document.getElementById('nextPage');
const pageInput     = document.getElementById('pageInput');
const totalPagesEl  = document.getElementById('totalPages');
const zoomOutBtn    = document.getElementById('zoomOut');
const zoomInBtn     = document.getElementById('zoomIn');
const zoomDisplay   = document.getElementById('zoomDisplay');
const fitPageBtn    = document.getElementById('fitPage');
const fitWidthBtn   = document.getElementById('fitWidth');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const themeToggle   = document.getElementById('themeToggle');

/* ── STATE ──────────────────────────────────────────────── */

let pdfDoc        = null;
let currentPage   = 1;
let totalPages    = 0;
let scale         = 1.0;
function detectDefaultFitMode() {
    // Touch-primary devices (phones, tablets) — 'pointer: coarse' is the
    // standard, reliable signal, not fragile user-agent sniffing.
    try {
        if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return 'width';
    } catch (e) {}
    // Fallback for anything matchMedia can't classify.
    return window.innerWidth < 900 ? 'width' : 'page';
}

let fitMode       = detectDefaultFitMode();  // phone/tablet → fit-width, laptop/desktop → fit-page
let pageElements  = new Map();
let renderPending = new Set();
let intersectObs  = null;
let loadSuccess   = false;  // guard: once canvas shown, never show error

const ZOOM_MIN     = 0.4;
const ZOOM_MAX     = 4.0;
const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

/* ── META ───────────────────────────────────────────────── */

function initMeta() {
    sourceBadge.textContent   = MODE === 'solution' ? 'Solution' : SOURCE;
    paperTitleNav.textContent = TITLE;
    document.title            = `${TITLE} — NEB Archive`;
    // reflect the actual default fitMode in the toolbar
    fitPageBtn.classList.toggle('active',  fitMode === 'page');
    fitWidthBtn.classList.toggle('active', fitMode === 'width');
    lucide.createIcons();
}

/* ── PROGRESS ───────────────────────────────────────────── */

function setProgress(pct) {
    progressBar.style.width = pct + '%';
    progressBar.setAttribute('aria-valuenow', pct);
    if (pct >= 100) setTimeout(() => progressBar.classList.add('done'), 400);
}

/* ── LOAD ───────────────────────────────────────────────── */

async function loadPDF(url) {
    if (!url) {
        showPlaceholder('No paper selected', 'Open this viewer from the PYQs page by clicking "View" on a paper.');
        return;
    }

    // Reset — this function now also runs when swiping to a different year.
    if (intersectObs) { intersectObs.disconnect(); intersectObs = null; }
    pdfDoc        = null;
    currentPage   = 1;
    totalPages    = 0;
    pageElements  = new Map();
    renderPending = new Set();
    loadSuccess   = false;
    pagesWrap.innerHTML = '';
    progressBar.classList.remove('done');
    setProgress(0);
    loaderShell.hidden        = false;
    loaderShell.style.display = '';
    errorShell.hidden         = true;
    errorShell.style.display  = 'none';
    canvasScroll.hidden       = true;
    canvasScroll.style.display = 'none';

    try {
        const task = pdfjsLib.getDocument({
            url,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/cmaps/',
            cMapPacked: true,
            withCredentials: false,
        });

        task.onProgress = ({ loaded, total }) => {
            if (total) setProgress(Math.round(loaded / total * 85));
        };

        pdfDoc     = await task.promise;
        totalPages = pdfDoc.numPages;
        setProgress(90);

        totalPagesEl.textContent = totalPages;
        pageInput.max            = totalPages;

        showCanvas();           // must be visible before buildSkeleton reads clientWidth
        await buildSkeleton();
        setProgress(100);
        renderVisiblePages();
        setupObserver();

    } catch (err) {
        console.error('[viewer] load error:', err);
        showError();
    }
}

/* ── SKELETON ───────────────────────────────────────────── */

async function buildSkeleton() {
    const first  = await pdfDoc.getPage(1);
    const baseVp = first.getViewport({ scale: 1 });
    scale        = computeFitScale(baseVp, fitMode);
    updateZoomDisplay();

    for (let i = 1; i <= totalPages; i++) {
        const page = await pdfDoc.getPage(i);
        const vp   = page.getViewport({ scale });

        const wrap         = document.createElement('div');
        wrap.className     = 'pdf-page';
        wrap.dataset.page  = i;
        wrap.style.width   = vp.width  + 'px';
        wrap.style.height  = vp.height + 'px';

        const canvas         = document.createElement('canvas');
        canvas.width         = Math.floor(vp.width  * devicePixelRatio);
        canvas.height        = Math.floor(vp.height * devicePixelRatio);
        canvas.style.width   = vp.width  + 'px';
        canvas.style.height  = vp.height + 'px';

        const lbl         = document.createElement('span');
        lbl.className     = 'page-label';
        lbl.textContent   = `${i} / ${totalPages}`;

        wrap.append(canvas, lbl);
        pagesWrap.appendChild(wrap);
        pageElements.set(i, { wrap, canvas, page, rendered: false });
    }
}

/* ── RENDER ─────────────────────────────────────────────── */

async function renderPage(n) {
    const e = pageElements.get(n);
    if (!e || e.rendered || renderPending.has(n)) return;
    renderPending.add(n);
    try {
        const vp  = e.page.getViewport({ scale });
        const ctx = e.canvas.getContext('2d');
        e.canvas.width        = Math.floor(vp.width  * devicePixelRatio);
        e.canvas.height       = Math.floor(vp.height * devicePixelRatio);
        e.canvas.style.width  = vp.width  + 'px';
        e.canvas.style.height = vp.height + 'px';
        e.wrap.style.width    = vp.width  + 'px';
        e.wrap.style.height   = vp.height + 'px';
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
        await e.page.render({ canvasContext: ctx, viewport: vp }).promise;
        e.rendered = true;
    } catch (_) {
        // cancelled — will retry on next scroll/zoom
    } finally {
        renderPending.delete(n);
    }
}

function renderVisiblePages() {
    const buf   = 2;
    const start = Math.max(1, currentPage - buf);
    const end   = Math.min(totalPages, currentPage + buf);
    for (let i = start; i <= end; i++) renderPage(i);
}

async function reRenderAll() {
    for (const [, e] of pageElements) e.rendered = false;
    renderPending.clear();
    renderVisiblePages();
}

/* ── INTERSECTION OBSERVER ──────────────────────────────── */

function setupObserver() {
    if (intersectObs) intersectObs.disconnect();
    intersectObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const n = parseInt(entry.target.dataset.page, 10);
            renderPage(n);
            if (entry.intersectionRatio > 0.5) { currentPage = n; syncUI(); }
        });
    }, { root: canvasScroll, threshold: [0, 0.5, 1], rootMargin: '120px 0px 120px 0px' });

    for (const [, { wrap }] of pageElements) intersectObs.observe(wrap);
}

/* ── NAVIGATION ─────────────────────────────────────────── */

function goToPage(n, smooth = true) {
    currentPage = Math.max(1, Math.min(totalPages, n));
    syncUI();
    pageElements.get(currentPage)?.wrap.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant', block: 'start' });
    renderVisiblePages();
}

function syncUI() {
    pageInput.value  = currentPage;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

/* ── ZOOM ───────────────────────────────────────────────── */

function computeFitScale(vp, mode) {
    // fall back to window dimensions if container not yet visible
    const W = (canvasScroll.clientWidth  || window.innerWidth)  - 48;
    const H = (canvasScroll.clientHeight || window.innerHeight) - 64;
    if (mode === 'width') return Math.max(0.4, W / vp.width);
    if (mode === 'page')  return Math.max(0.4, Math.min(W / vp.width, H / vp.height));
    return scale;
}

async function applyZoom(newScale, newFitMode = 'custom') {
    scale   = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newScale));
    fitMode = newFitMode;
    updateZoomDisplay();
    fitPageBtn.classList.toggle('active',  fitMode === 'page');
    fitWidthBtn.classList.toggle('active', fitMode === 'width');
    await reRenderAll();
}

async function applyFitMode(mode) {
    if (!pdfDoc) return;
    const pg = pageElements.get(1)?.page || await pdfDoc.getPage(1);
    const vp = pg.getViewport({ scale: 1 });
    await applyZoom(computeFitScale(vp, mode), mode);
}

function updateZoomDisplay() {
    zoomDisplay.textContent = Math.round(scale * 100) + '%';
}

function snapToPreset(dir) {
    if (dir > 0) return ZOOM_PRESETS.find(z => z > scale + 0.01) ?? Math.min(ZOOM_MAX, scale + 0.25);
    return [...ZOOM_PRESETS].reverse().find(z => z < scale - 0.01) ?? Math.max(ZOOM_MIN, scale - 0.25);
}

/* ── UI STATES ──────────────────────────────────────────── */

function showCanvas() {
    loadSuccess               = true;
    loaderShell.hidden        = true;
    loaderShell.style.display = 'none';
    errorShell.hidden         = true;
    errorShell.style.display  = 'none';
    canvasScroll.hidden       = false;
    canvasScroll.style.display = 'block';
    syncUI();
}

function showError() {
    if (loadSuccess) return;   // PDF already rendered — don't cover it
    loaderShell.hidden = true;
    errorShell.hidden  = false;
    lucide.createIcons();
}

function showPlaceholder(heading, body) {
    loaderShell.hidden = true;
    errorShell.hidden  = false;
    errorShell.querySelector('strong').textContent = heading;
    errorShell.querySelector('p').textContent      = body;
    lucide.createIcons();
}

/* ── FULLSCREEN ─────────────────────────────────────────── */

function toggleFullscreen() {
    document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen?.();
}

document.addEventListener('fullscreenchange', () => {
    const isFS = !!document.fullscreenElement;
    const ic   = fullscreenBtn.querySelector('i');
    if (ic) { ic.setAttribute('data-lucide', isFS ? 'minimize-2' : 'maximize-2'); lucide.createIcons(); }
    if (fitMode !== 'custom') applyFitMode(fitMode);
});

/* ── TOAST ──────────────────────────────────────────────── */

let toastTimer;
function showToast(msg) {
    let t = document.querySelector('.shortcut-toast');
    if (!t) { t = Object.assign(document.createElement('div'), { className: 'shortcut-toast' }); document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1600);
}

/* ── SWIPE-TO-CHANGE-YEAR ───────────────────────────────── */

function buildTitleForYear(yearValue) {
    const displayYear = String(yearValue).replace(/-model$/i, '').replace(/-sup(plementary)?$/i, '').replace(/-gie$/i, '');
    const streamPart  = STREAM ? ` (${STREAM})` : '';
    const provPart    = PROVINCE && !STREAM ? ` · ${PROVINCE}` : '';
    return `${SUBJECT}${streamPart} — Grade ${GRADE}${provPart} · ${displayYear}`;
}

function goToYear(newYear) {
    const path = getPaperPath(SRC, GRADE, STREAM, SUBJECT, newYear, activeMode, PROVINCE);
    const url  = getPaperURL(path);
    const title = buildTitleForYear(newYear);

    activeYear = newYear;
    activeUrl  = url;

    paperTitleNav.textContent = title;
    document.title            = `${title} — NEB Archive`;

    // keep the URL in sync so refresh/share/back lands on the right paper
    const params = new URLSearchParams(location.search);
    params.set('year', newYear);
    params.set('url', url);
    params.set('title', title);
    history.replaceState(null, '', `${location.pathname}?${params}`);

    showToast(title.split('·').pop().trim());
    loadPDF(url);
}

function navigateYear(indexDelta) {
    if (!YEAR_LIST.length || !activeYear) return; // no identity params → nothing to navigate to
    const idx = YEAR_LIST.indexOf(activeYear);
    if (idx === -1) return;
    const newIdx = idx + indexDelta;
    if (newIdx < 0)                 { showToast('Already at the newest paper'); return; }
    if (newIdx >= YEAR_LIST.length) { showToast('Already at the oldest paper'); return; }
    goToYear(YEAR_LIST[newIdx]);
}

let swipeStartX = null, swipeStartY = null, swipeStartT = 0, swipeMulti = false;

canvasScroll.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) { swipeMulti = true; return; }
    swipeMulti  = false;
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
    swipeStartT = Date.now();
}, { passive: true });

canvasScroll.addEventListener('touchmove', e => {
    if (e.touches.length !== 1) swipeMulti = true;
}, { passive: true });

canvasScroll.addEventListener('touchend', e => {
    if (swipeMulti || swipeStartX === null) { swipeStartX = null; return; }
    // Page is wider than the viewport (zoomed in) → horizontal drag is panning, not swiping.
    if (canvasScroll.scrollWidth > canvasScroll.clientWidth + 2) { swipeStartX = null; return; }

    const t  = e.changedTouches[0];
    const dx = t.clientX - swipeStartX;
    const dy = t.clientY - swipeStartY;
    const dt = Date.now() - swipeStartT;
    swipeStartX = null;

    if (Math.abs(dx) < 70) return;                  // too short to be intentional
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;   // mostly vertical → page scroll, ignore
    if (dt > 700) return;                            // too slow to be a flick

    if (dx > 0) navigateYear(-1); // swiped right → newer year
    else        navigateYear(1);  // swiped left  → older year
}, { passive: true });

/* ── TOUCH PINCH ────────────────────────────────────────── */

let lastDist = null;
canvasScroll.addEventListener('touchstart', e => {
    if (e.touches.length === 2) lastDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
}, { passive: true });
canvasScroll.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !lastDist) return;
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    applyZoom(scale * (d / lastDist));
    lastDist = d;
}, { passive: true });
canvasScroll.addEventListener('touchend', () => lastDist = null, { passive: true });

/* ── CTRL+WHEEL ─────────────────────────────────────────── */

canvasScroll.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    applyZoom(snapToPreset(e.deltaY < 0 ? 1 : -1));
}, { passive: false });

/* ── KEYBOARD ───────────────────────────────────────────── */

document.addEventListener('keydown', e => {
    if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
    const ctrl = e.ctrlKey || e.metaKey;
    switch (e.key) {
        case 'ArrowRight': case 'ArrowDown': case 'PageDown': e.preventDefault(); goToPage(currentPage + 1); break;
        case 'ArrowLeft':  case 'ArrowUp':   case 'PageUp':   e.preventDefault(); goToPage(currentPage - 1); break;
        case 'Home': e.preventDefault(); goToPage(1); break;
        case 'End':  e.preventDefault(); goToPage(totalPages); break;
        case '+': case '=': if (ctrl) { e.preventDefault(); applyZoom(snapToPreset(1)); } break;
        case '-':           if (ctrl) { e.preventDefault(); applyZoom(snapToPreset(-1)); } break;
        case '0': if (ctrl) { e.preventDefault(); applyFitMode('page'); showToast('Fit page'); } break;
        case 'f': case 'F': if (!ctrl) { toggleFullscreen(); showToast('Fullscreen'); } break;
        case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
    }
});

/* ── RESIZE ─────────────────────────────────────────────── */

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { if (fitMode !== 'custom') applyFitMode(fitMode); }, 180);
});

/* ── EVENTS ─────────────────────────────────────────────── */

prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
pageInput.addEventListener('change', () => { const n = +pageInput.value; if (!isNaN(n)) goToPage(n); });
pageInput.addEventListener('keydown', e => { if (e.key === 'Enter') { const n = +pageInput.value; if (!isNaN(n)) goToPage(n); } });
zoomOutBtn.addEventListener('click',  () => applyZoom(snapToPreset(-1)));
zoomInBtn.addEventListener('click',   () => applyZoom(snapToPreset(1)));
zoomDisplay.addEventListener('click', () => applyFitMode('page'));
fitPageBtn.addEventListener('click',  () => { applyFitMode('page');  showToast('Fit page'); });
fitWidthBtn.addEventListener('click', () => { applyFitMode('width'); showToast('Fit width'); });
fullscreenBtn.addEventListener('click', toggleFullscreen);

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch(_) {}
});

window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 4), { passive: true });
pagesWrap.addEventListener('contextmenu', e => { if (e.target.tagName === 'CANVAS') e.preventDefault(); });

/* ── START ──────────────────────────────────────────────── */

initMeta();
loadPDF(activeUrl);