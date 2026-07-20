/* ============================================================
   NEB Archive — PYQ Page Logic
   ============================================================ */

/* ── DATA ───────────────────────────────────────────────── */

const BOARD_DATA = {
    8:  { subjects: 
            { English: ['2083','2082','2081'], 
              Mathematics: ['2083','2082','2081'],
              Nepali: ['2083','2082','2081'], 
              Science: ['2083','2082','2081'], 
              'Social Studies': ['2083','2082','2081'] } },

    9:  { subjects: 
            { English: ['2083','2082','2081'], 
              Mathematics: ['2083','2082','2081'], 
              Nepali: ['2083','2082','2081'],
              Science: ['2083','2082','2081'], 
              'Social Studies': ['2083','2082','2081'], 
              'Computer Science': ['2083','2082','2081'],
              Accounting: ['2083','2082','2081'] } },

    10: { subjects: 
            { English: ['2083','2082','2081'], 
              Mathematics: ['2083','2082','2081'], 
              Nepali: ['2083','2082','2081'],
              Science: ['2083','2082','2081'], 
              'Social Studies': ['2083','2082','2081'], 
              'Computer Science': ['2083','2082','2081'],
              Accounting: ['2083','2082','2081'] } },

    11: {
        streams: {
            Science:    { subjects: 
                            { English: ['2083','2082','2081'], 
                              Mathematics: ['2083','2082','2081'], 
                              Nepali: ['2083','2082','2081'], 
                              Physics: ['2083','2082','2081'], 
                              Chemistry: ['2083','2082','2081'], 
                              Biology: ['2083','2082','2081'],
                              'Computer Science': ['2083','2082','2081'] } },

            Management: { subjects: 
                            { English: ['2083','2082','2081'], 
                              Mathematics: ['2083','2082','2081'], 
                              Nepali: ['2083','2082','2081'], 
                              'Social Studies': ['2083','2082','2081'],
                              Economics: ['2083','2082','2081'], 
                              Accounting: ['2083','2082','2081'], 
                              'Business Studies': ['2083','2082','2081'] } }
        }
    },
    12: {
        streams: {
            Science:    { subjects: 
                            { English: ['2083','2082','2081'], 
                              Mathematics: ['2083','2082','2081'], 
                              Nepali: ['2083','2082','2081'], 
                              Physics: ['2083','2082','2081'], 
                              Chemistry: ['2083','2082','2081'], 
                              Biology: ['2083','2082','2081'],
                              'Computer Science': ['2083','2082','2081'] } },

            Management: { subjects: 
                            { English: ['2083','2082','2081'], 
                              Mathematics: ['2083','2082','2081'], 
                              Nepali: ['2083','2082','2081'], 
                              'Social Studies': ['2083','2082','2081'],
                              Economics: ['2083','2082','2081'], 
                              Accounting: ['2083','2082','2081'], 
                              'Business Studies': ['2083','2082','2081'] } }
        }
    }
};

const SCHOOL_DATA = {
    11: {
        streams: {
            Science:    { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], Physics: ['2083','2082','2081'], Chemistry: ['2083','2082','2081'], Biology: ['2083','2082','2081'], 'Computer Science': ['2083','2082','2081'] } },
            Management: { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], 'Social Studies': ['2083','2082','2081'], Economics: ['2083','2082','2081'], Accounting: ['2083','2082','2081'], 'Business Studies': ['2083','2082','2081'] } }
        }
    },
    12: {
        streams: {
            Science:    { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], Physics: ['2083','2082','2081'], Chemistry: ['2083','2082','2081'], Biology: ['2083','2082','2081'], 'Computer Science': ['2083','2082','2081'] } },
            Management: { subjects: { English: ['2083','2082','2081'], Mathematics: ['2083','2082','2081'], Nepali: ['2083','2082','2081'], 'Social Studies': ['2083','2082','2081'], Economics: ['2083','2082','2081'], Accounting: ['2083','2082','2081'], 'Business Studies': ['2083','2082','2081'] } }
        }
    }
};

/* ── SUPABASE CONFIG ────────────────────────────────────── */
// BUG FIX: was set to the dashboard URL — must be your project's API base URL
const SUPABASE_URL   = 'https://cqmqxazynzmkoahuppnu.supabase.co';
const STORAGE_BUCKET = 'pyqs';

function slug(s) {
    return s.toLowerCase().replace(/\s+/g, '-');
}

function getPaperPath(source, grade, stream, subject, year, mode) {
    // mode: 'paper' | 'solution'
    const suffix = mode === 'solution' ? '-solution' : '';
    const file   = `${year}${suffix}.pdf`;

    if (source === 'board') {
        if (['11','12'].includes(String(grade))) {
            return `board/${grade}/${slug(stream)}/${slug(subject)}/${file}`;
        }
        return `board/${grade}/${slug(subject)}/${file}`;
    }
    // school
    if (['11','12'].includes(String(grade))) {
        return `school/${grade}/${slug(stream)}/${slug(subject)}/${file}`;
    }
    return `school/${grade}/${slug(subject)}/${file}`;
}

function getPaperURL(path) {
    // BUG FIX: was double-building the path by appending /storage/v1/... onto the dashboard URL
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${path}`;
}

/* ── STATE ──────────────────────────────────────────────── */

const state = {
    source:  'board',
    grade:   '8',
    stream:  '',
    subject: 'English',
    year:    'all',
};

/* ── HELPERS ────────────────────────────────────────────── */

const $ = s => document.querySelector(s);
const icon = n => `<i data-lucide="${n}"></i>`;

const subjectIcon = s =>
    s === 'Mathematics' || s === 'Business Mathematics' ? 'sigma' :
    s === 'Physics'           ? 'atom' :
    s === 'Chemistry'         ? 'flask-conical' :
    s === 'Biology'           ? 'dna' :
    s.includes('Computer')    ? 'monitor' :
    s === 'Nepali'            ? 'book' :
    s === 'Social Studies'    ? 'globe' :
    s === 'Accounting'        ? 'calculator' :
    s === 'Economics'         ? 'trending-up' :
    s === 'Business Studies'  ? 'briefcase' :
    'book-open';

function gradeNode() {
    return state.source === 'board' ? BOARD_DATA[state.grade] : SCHOOL_DATA[state.grade];
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
    return currentSubjects()[state.subject] || [];
}

function ensureValidGrade() {
    const grades = availableGrades();
    if (!grades.includes(String(state.grade))) state.grade = grades[0];
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

/* ── NAVIGATE TO VIEWER ─────────────────────────────────── */

function openViewer(action) {
    const mode    = action === 'solution' ? 'solution' : 'paper';
    const path    = getPaperPath(state.source, state.grade, state.stream, state.subject, state.year === 'all' ? currentYears()[0] : state.year, mode);
    const fileURL = getPaperURL(path);

    // Build a human-readable title
    const streamPart = state.stream ? ` (${state.stream})` : '';
    const yearPart   = state.year === 'all' ? currentYears()[0] : state.year;
    const title      = `${state.subject}${streamPart} — Grade ${state.grade} · ${yearPart}`;
    const source     = state.source === 'board' ? 'NEB Official' : 'School Paper';

    const p = new URLSearchParams({ url: fileURL, title, source, mode });
    window.location.href = `viewer.html?${p}`;
}

// Called when a specific card's button is clicked — reads year from the card
function openViewerForCard(card, action) {
    const year    = card.dataset.year;
    const mode    = action === 'solution' ? 'solution' : 'paper';
    const path    = getPaperPath(state.source, state.grade, state.stream, state.subject, year, mode);
    const fileURL = getPaperURL(path);

    const streamPart = state.stream ? ` (${state.stream})` : '';
    const title      = `${state.subject}${streamPart} — Grade ${state.grade} · ${year}`;
    const source     = state.source === 'board' ? 'NEB Official' : 'School Paper';

    const p = new URLSearchParams({ url: fileURL, title, source, mode });
    window.location.href = `viewer.html?${p}`;
}

/* ── STATS PANEL ────────────────────────────────────────── */

function renderStats() {
    const subs     = currentSubjects();
    const subNames = Object.keys(subs);
    const streamPart = state.stream ? ` · ${state.stream}` : '';
    $('#statsLabel').textContent = `Grade ${state.grade}${streamPart} · ${state.source === 'board' ? 'Board' : 'School'}`;

    if (!subNames.length) {
        $('#statsGrid').innerHTML  = `<div class="stats-empty">No data available</div>`;
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
    $('#gradePills').innerHTML = grades.map(g =>
        `<button class="grade-pill" role="tab" aria-selected="${String(g) === String(state.grade)}" data-grade="${g}">Grade ${g}</button>`
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
    bar.id = 'streamBar';
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

/* ── LEFT PANEL ──────────────────────────────────────────── */

function renderLeftPanel() {
    $('#subjectHeading').textContent = hasStreams() ? state.stream || 'Subjects' : `Grade ${state.grade}`;
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
    const yrs = currentYears();
    if (state.year !== 'all' && !yrs.includes(state.year)) state.year = 'all';
    $('#yearFilter').innerHTML = ['all', ...yrs].map(y =>
        `<button class="year-chip" aria-pressed="${state.year === y}" data-year="${y}">${y === 'all' ? 'All years' : y}</button>`
    ).join('');
}

/* ── PAPER LIST ──────────────────────────────────────────── */

function renderPapers() {
    const yrs  = currentYears();
    const list = state.year === 'all' ? yrs : yrs.filter(y => y === state.year);

    const streamPart  = state.stream ? ` (${state.stream})` : '';
    const sourceLabel = state.source === 'board' ? 'Board Examination' : 'School Papers';
    const eyebrow     = `Grade ${state.grade}${streamPart} / ${state.subject}`;

    $('#contentEyebrow').textContent = eyebrow;
    $('#paperHeading').textContent   = state.subject;
    $('#paperCount').textContent     = `Showing ${list.length} ${list.length === 1 ? 'paper' : 'papers'}`;

    $('#paperList').innerHTML = list.length ? list.map(y => `
        <article class="paper-card reveal in" data-year="${y}">
            <div class="paper-icon">${icon('file-text')}</div>
            <div>
                <div class="paper-title">${state.subject} — ${sourceLabel}</div>
                <div class="paper-meta">
                    <span>Grade ${state.grade}${state.stream ? ' · ' + state.stream : ''}</span>
                    <span>·</span>
                    <span class="paper-year">${y}</span>
                    <span>·</span>
                    <span>${state.source === 'board' ? 'NEB Official' : 'School Paper'}</span>
                </div>
            </div>
            <div class="paper-actions">
                <button class="paper-action primary" data-action="view">${icon('eye')}<span>View</span></button>
                <button class="paper-action solution" data-action="solution">${icon('lightbulb')}<span>Solution</span></button>
            </div>
        </article>`
    ).join('') : `
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

    /* Single delegated click handler — strict priority order, always early-return */
    document.addEventListener('click', e => {

        // ── 1. Paper action buttons (View / Solution) ──────────
        // BUG FIX: changed from <a href="#viewer"> to <button data-action>
        // so there's no anchor navigation competing with our handler.
        // Also fixed: handler now returns immediately, so grade/subject/year
        // selectors below never fire when a card button is clicked.
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const card = actionBtn.closest('[data-year]');
            if (card) openViewerForCard(card, actionBtn.dataset.action);
            return; // always stop here
        }

        // ── 2. Grade pills ─────────────────────────────────────
        const gradeEl = e.target.closest('[data-grade]');
        if (gradeEl) {
            state.grade = gradeEl.dataset.grade;
            state.year  = 'all';
            ensureValidStream();
            ensureValidSubject();
            render();
            return;
        }

        // ── 3. Stream pills ────────────────────────────────────
        const streamEl = e.target.closest('[data-stream]');
        if (streamEl) {
            state.stream = streamEl.dataset.stream;
            state.year   = 'all';
            ensureValidSubject();
            render();
            return;
        }

        // ── 4. Subject buttons ─────────────────────────────────
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

        // ── 5. Year chips ──────────────────────────────────────
        const yearEl = e.target.closest('[data-year]');
        // Guard: only match year-chip buttons, not paper cards which also have data-year
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