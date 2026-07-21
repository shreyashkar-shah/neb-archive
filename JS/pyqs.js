/* ============================================================
   NEB Archive — PYQ Page Logic
   ============================================================ */

import { PROVINCES, BOARD_DATA, SCHOOL_DATA, slug, getPaperPath, getPaperURL } from '../neb-data.mjs';

/* ── STATE ──────────────────────────────────────────────── */

const state = {
    source:   'board',
    grade:    '12',        // default to 12 — most demand
    stream:   'Science',
    subject:  'Physics',
    province: 'Bagmati',   // default province for grade 8/10
    year:     'all',
};

/* ── HELPERS ────────────────────────────────────────────── */

const $ = s => document.querySelector(s);
const icon = n => `<i data-lucide="${n}"></i>`;

const subjectIcon = s =>
    s === 'Mathematics' || s === 'Business Mathematics' ? 'sigma' :
    s === 'Physics'            ? 'atom' :
    s === 'Chemistry'          ? 'flask-conical' :
    s === 'Biology'            ? 'dna' :
    s.includes('Computer')     ? 'monitor' :
    s === 'Nepali'             ? 'book' :
    s === 'Social Studies'     ? 'globe' :
    s === 'Accounting'         ? 'calculator' :
    s === 'Economics'          ? 'trending-up' :
    s === 'Business Studies'   ? 'briefcase' :
    'book-open';

function gradeNode() {
    return state.source === 'board' ? BOARD_DATA[state.grade] : SCHOOL_DATA[state.grade];
}

function isProvinceGrade() {
    return state.source === 'board' && !!gradeNode()?.province;
}

function hasStreams() {
    return !!gradeNode()?.streams;
}

function availableStreams() {
    return hasStreams() ? Object.keys(gradeNode().streams) : [];
}

function currentSubjects() {
    const node = gradeNode();
    if (!node) return {};
    return node.streams ? (node.streams[state.stream]?.subjects || {}) : (node.subjects || {});
}

function availableGrades() {
    return Object.keys(state.source === 'board' ? BOARD_DATA : SCHOOL_DATA);
}

function currentYears() {
    // Returns raw entries (string or {value, label}) — callers extract .value as needed
    return currentSubjects()[state.subject] || [];
}

function currentYearValues() {
    return currentYears().map(y => y.value || y);
}

function ensureValidGrade() {
    const grades = availableGrades();
    if (!grades.includes(String(state.grade))) state.grade = grades[grades.length - 1]; // default to last (12)
}

function ensureValidStream() {
    if (!hasStreams()) { state.stream = ''; return; }
    const streams = availableStreams();
    if (!streams.includes(state.stream)) state.stream = streams[0];
}

function ensureValidSubject() {
    const subs = Object.keys(currentSubjects());
    if (!subs.includes(state.subject)) state.subject = subs[0] || '';
}

/* ── OPEN VIEWER ────────────────────────────────────────── */

function openViewerForCard(card, action) {
    const year    = card.dataset.year;
    const mode    = action === 'solution' ? 'solution' : 'paper';
    const path    = getPaperPath(state.source, state.grade, state.stream, state.subject, year, mode, state.province);
    const fileURL = getPaperURL(path);

    const streamPart = state.stream ? ` (${state.stream})` : '';
    const provPart   = isProvinceGrade() ? ` · ${state.province}` : '';
    const title      = `${state.subject}${streamPart} — Grade ${state.grade}${provPart} · ${year}`;
    const source     = state.source === 'board' ? 'NEB' : 'School Paper';

    const p = new URLSearchParams({ url: fileURL, title, source, mode });
    window.location.href = `viewer.html?${p}`;
}

/* ── STATS PANEL ────────────────────────────────────────── */

function renderStats() {
    const subs     = currentSubjects();
    const subNames = Object.keys(subs);
    const streamPart = state.stream ? ` · ${state.stream}` : '';
    const provPart   = isProvinceGrade() ? ` · ${state.province}` : '';
    $('#statsLabel').textContent = `Grade ${state.grade}${streamPart}${provPart}`;

    if (!subNames.length) {
        $('#statsGrid').innerHTML   = `<div class="stats-empty">No data available</div>`;
        $('#statsFooter').innerHTML = '';
        return;
    }

    const max   = Math.max(...subNames.map(s => subs[s].length));
    const total = subNames.reduce((a, s) => a + subs[s].length, 0);

    $('#statsGrid').innerHTML = subNames.map(s => {
        const count = subs[s].length;
        const pct   = Math.round((count / max) * 100);
        return `<div class="stat-row">
            <span class="stat-subject">${s}</span>
            <div class="stat-bar-wrap"><div class="stat-bar" style="--pct:${pct}%"></div></div>
            <span class="stat-count">${count}</span>
        </div>`;
    }).join('');

    $('#statsFooter').innerHTML = `<span>${subNames.length} subjects</span><span class="stats-dot">·</span><span>${total} papers</span>`;
}

/* ── GRADE PILLS ─────────────────────────────────────────── */

function renderGrades() {
    const grades = availableGrades();
    const labels  = { 8: 'Grade 8 (BLE)', 10: 'Grade 10 (SEE)', 11: 'Grade 11', 12: 'Grade 12' };
    $('#gradePills').innerHTML = grades.map(g =>
        `<button class="grade-pill" role="tab" aria-selected="${String(g) === String(state.grade)}" data-grade="${g}">${labels[g] || 'Grade ' + g}</button>`
    ).join('');

    $('#gradeCaption').textContent = state.source === 'board'
        ? 'Select your grade to view available subjects and papers.'
        : 'School papers are available for Grade 11 & 12 only.';
}

/* ── STREAM BAR ──────────────────────────────────────────── */

function renderStreamBar() {
    const existing = document.getElementById('streamBar');
    if (existing) existing.remove();
    if (!hasStreams()) return;

    const STREAM_ICONS = { Science: 'atom', Management: 'briefcase', Law: 'scale' };
    const streams = availableStreams();

    const bar = document.createElement('div');
    bar.id        = 'streamBar';
    bar.className = 'stream-bar';
    bar.innerHTML = `
        <span class="stream-bar-label">Stream</span>
        <div class="stream-pills">
            ${streams.map(s => `
                <button class="stream-pill" aria-selected="${s === state.stream}" data-stream="${s}">
                    <i data-lucide="${STREAM_ICONS[s] || 'layers'}"></i> ${s}
                </button>`).join('')}
        </div>`;

    document.querySelector('.grade-bar').after(bar);
    lucide.createIcons();
}

/* ── PROVINCE ROW (grade 8 & 10 only) ───────────────────── */

function renderProvinceRow() {
    const existing = document.getElementById('provinceRow');
    if (existing) existing.remove();
    if (!isProvinceGrade()) return;

    const row = document.createElement('div');
    row.id        = 'provinceRow';
    row.className = 'province-row';
    row.innerHTML = `
        <span class="stream-bar-label"><i data-lucide="map-pin"></i> Province</span>
        <div class="stream-pills">
            ${PROVINCES.map(pv => `
                <button class="stream-pill" aria-selected="${pv === state.province}" data-province="${pv}">${pv}</button>
            `).join('')}
        </div>`;

    // insert after stream bar if present, else after grade bar
    const after = document.getElementById('streamBar') || document.querySelector('.grade-bar');
    after.after(row);
    lucide.createIcons();
}

/* ── LEFT PANEL ──────────────────────────────────────────── */

function renderLeftPanel() {
    let heading;
    if (hasStreams())         heading = state.stream || 'Subjects';
    else if (isProvinceGrade()) heading = `Grade ${state.grade}`;
    else                      heading = `Grade ${state.grade}`;

    $('#subjectHeading').textContent = heading;
    $('#subjectNote').textContent    = state.source === 'school'
        ? 'Select a subject to filter school papers.'
        : 'Select a subject to filter papers.';

    const subs = Object.keys(currentSubjects());
    $('#subjectList').innerHTML = subs.length
        ? subs.map(s => `
            <button class="subject-btn" aria-selected="${s === state.subject}" data-subject="${s}">
                ${icon(subjectIcon(s))}<span>${s}</span>
            </button>`).join('')
        : `<div class="stats-empty">No subjects available</div>`;
}

/* ── YEAR FILTER ─────────────────────────────────────────── */

function renderYears() {
    const yrs = currentYears(); // raw entries: strings or {value, label}

    // Compute base year for a raw entry
    const baseYear = e => (e.value || e).replace(/-model|-sup|-gie|-[a-z]/gi, '').replace(/[^0-9]/g, '').slice(0, 4);

    // Reset state.year if it no longer exists
    if (state.year !== 'all' && !yrs.find(e => baseYear(e) === state.year)) state.year = 'all';

    // Deduplicate chips — GIE/Sup/model all collapse into same year chip
    const seen = new Set();
    const chips = yrs.filter(e => {
        const base = baseYear(e);
        if (seen.has(base)) return false;
        seen.add(base);
        return true;
    });

    $('#yearFilter').innerHTML = ['all', ...chips].map(e => {
        const value = e === 'all' ? 'all' : baseYear(e);
        return `<button class="year-chip" aria-pressed="${state.year === value}" data-year="${value}">${value === 'all' ? 'All years' : value}</button>`;
    }).join('');
}

/* ── PAPER LIST ──────────────────────────────────────────── */

function renderPapers() {
    const yrs  = currentYearValues(); // array of plain strings e.g. '2081', '2081-gie', '2079-model'
    const baseYear = v => v.replace(/-model|-sup|-gie|-[a-z]/gi, '').replace(/[^0-9]/g, '').slice(0, 4);
    const list = state.year === 'all' ? yrs : yrs.filter(y => baseYear(y) === state.year);

    const streamPart  = state.stream ? ` (${state.stream})` : '';
    const eyebrow     = `Grade ${state.grade}${streamPart} / ${state.subject}`;

    $('#contentEyebrow').textContent = eyebrow;
    $('#paperHeading').textContent   = state.subject;
    $('#paperCount').textContent     = `Showing ${list.length} ${list.length === 1 ? 'paper' : 'papers'}`;

    $('#paperList').innerHTML = list.length ? list.map(y => {
        // Work out a clean label for the year value
        const yl = y.toLowerCase();
        const suffix =
            yl.includes('model') ? ' (Model Question)' :
            yl.includes('sup')   ? ' (Supplementary)'  :
            yl.includes('gie')   ? ' (GIE)'             : '';
        const yearDisplay = y.replace(/-model$|-sup$|-gie$|-[a-z]+$/gi, '');

        return `
        <article class="paper-card reveal in" data-year="${y}">
            <div class="paper-icon">${icon('file-text')}</div>
            <div>
                <div class="paper-title">${state.subject}${suffix}</div>
                <div class="paper-meta">
                    <span>Grade ${state.grade}${state.stream ? ' · ' + state.stream : ''}</span>
                    <span>·</span>
                    <span class="paper-year">${yearDisplay}</span>
                    <span>·</span>
                    <span>${state.source === 'board' ? 'NEB' : 'School Paper'}</span>
                </div>
            </div>
            <div class="paper-actions">
                <button class="paper-action primary" data-action="view">${icon('eye')}<span>View</span></button>
                <button class="paper-action solution" data-action="solution">${icon('lightbulb')}<span>Solution</span></button>
            </div>
        </article>`;
    }).join('') : `
        <div class="empty-state">
            ${icon('file-search')}
            <strong>No papers found</strong>
            <span>Try a different year, subject, or grade.</span>
        </div>`;
}

/* ── FULL RENDER ─────────────────────────────────────────── */

function render() {
    renderGrades();
    renderStreamBar();
    renderProvinceRow();
    renderLeftPanel();
    renderYears();
    renderPapers();
    renderStats();
    lucide.createIcons();
}

/* ── INIT ─────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    ensureValidGrade();
    ensureValidStream();
    ensureValidSubject();
    render();
    $('#year').textContent = new Date().getFullYear();

    /* Source toggle */
    document.querySelectorAll('.source-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const src = btn.dataset.source;
            if (src === state.source) return;
            state.source = src;
            state.year   = 'all';
            document.querySelectorAll('.source-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.source === src);
                b.setAttribute('aria-selected', b.dataset.source === src);
            });
            ensureValidGrade();
            ensureValidStream();
            ensureValidSubject();
            render();
        });
    });

    /* Delegated click handler */
    document.addEventListener('click', e => {

        // 1. Paper action buttons
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const card = actionBtn.closest('[data-year]');
            if (card) openViewerForCard(card, actionBtn.dataset.action);
            return;
        }

        // 2. Grade pills
        const gradeEl = e.target.closest('[data-grade]');
        if (gradeEl) {
            state.grade = gradeEl.dataset.grade;
            state.year  = 'all';
            ensureValidStream();
            ensureValidSubject();
            render();
            return;
        }

        // 3. Stream pills
        const streamEl = e.target.closest('[data-stream]');
        if (streamEl) {
            state.stream = streamEl.dataset.stream;
            state.year   = 'all';
            ensureValidSubject();
            render();
            return;
        }

        // 4. Province pills
        const provEl = e.target.closest('[data-province]');
        if (provEl) {
            state.province = provEl.dataset.province;
            state.year     = 'all';
            renderProvinceRow();
            renderYears();
            renderPapers();
            renderStats();
            lucide.createIcons();
            return;
        }

        // 5. Subject buttons
        const subjectEl = e.target.closest('[data-subject]');
        if (subjectEl) {
            state.subject = subjectEl.dataset.subject;
            state.year    = 'all';
            renderLeftPanel();
            renderYears();
            renderPapers();
            renderStats();
            lucide.createIcons();
            return;
        }

        // 6. Year chips
        const yearEl = e.target.closest('[data-year]');
        if (yearEl && yearEl.classList.contains('year-chip')) {
            state.year = yearEl.dataset.year;
            renderYears();
            renderPapers();
            lucide.createIcons();
        }
    });

    /* Theme toggle */
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch(e) {}
    });

    /* Navbar scroll shadow */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Mobile hamburger */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open);
        });
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }));
        document.addEventListener('click', e => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* Subject panel collapse (mobile) */
    document.getElementById('subjectToggle')?.addEventListener('click', () => {
        const p         = document.querySelector('.subject-panel');
        const collapsed = p.classList.toggle('collapsed');
        document.getElementById('subjectToggle').setAttribute('aria-expanded', !collapsed);
    });

    /* Scroll reveal */
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver(entries => {
            entries.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => io.observe(el));
    } else {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    }
});