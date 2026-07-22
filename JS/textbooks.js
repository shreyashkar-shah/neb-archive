/* ============================================================
   NEB Archive — Textbooks Page Logic
   ============================================================ */

/* ── DATA ────────────────────────────────────────────────── */
// available: true  = PDF is in Supabase, ready to open
// available: false = coming soon, show placeholder card

const SUPABASE_URL    = 'https://cqmqxazynzmkoahuppnu.supabase.co';
const STORAGE_BUCKET  = 'textbooks';

const TEXTBOOK_DATA = {
    10: {
        subjects: {
            English:            { available: true },
            Mathematics:        { available: true },
            Nepali:             { available: true },
            Science:            { available: true },
            'Social Studies':   { available: true },
            'Computer Science': { available: true },
            Accounting:         { available: true },
        }
    },
    11: {
        streams: {
            Science: { subjects: {
                English:           { available: true },
                Mathematics:       { available: false, recommended: [
                    { title: 'Basic Mathematics', author: 'Dr. B.C. Bajracharya et al.', publisher: 'Sukunda Publication', available: false },
                    { title: 'Fundamental Mathematics', author: 'P.M. Bajracharya et al.', publisher: 'Buddha Publication', available: false },
                ]},
                Nepali:            { available: true },
                Physics:           { available: false, recommended: [
                    { title: 'Pioneer Physics', author: 'K.B. Rayamajhi et al.', publisher: 'Dreamland Publication', available: false },
                    { title: 'Concepts of Physics', author: 'H.C. Verma', publisher: 'Bharati Bhawan', available: false },
                    { title: 'Numerical Problem in Physics — Part I', author: 'V.K. Jha', publisher: 'Heritage Publisher & Distributors', available: false },
                ]},
                Chemistry:         { available: false, recommended: [
                    { title: 'Pioneer Chemistry', author: 'A.D. Mishra et al.', publisher: 'Dreamland Publication', available: false },
                    { title: 'Pioneer Practical Chemistry', author: 'A.D. Mishra et al.', publisher: 'Dreamland Publication', available: false },
                ]},
                Biology:           { available: false, recommended: [
                    { title: 'Secondary Level Biology', author: 'Shubha Ratna Shakya et al.', publisher: 'Sukunda Publication', available: false },
                    { title: 'Practical Biology for Grade XI', author: 'Dr. Narayan Prasad Ghimire et al.', publisher: 'Heritage Publisher & Distributors', available: false },
                ]},
                'Computer Science':{ available: false, recommended: [
                    { title: 'Computer Science', publisher: 'Buddha Publication', available: false },
                    { title: 'Fundamentals of Information Technology', author: 'Alexis Leon & Mathews Leon', publisher: 'Vikash Publishing House', available: false },
                ]},
            }},
            Management: { subjects: {
                English:           { available: true },
                Mathematics:       { available: false, recommended: [
                    { title: 'Basic Mathematics', author: 'Dr. B.C. Bajracharya et al.', publisher: 'Sukunda Publication', available: false },
                    { title: 'Fundamental Mathematics', author: 'P.M. Bajracharya et al.', publisher: 'Buddha Publication', available: false },
                ]},
                Nepali:            { available: true },
                'Social Studies':  { available: true },
                Economics:         { available: true },
                Accounting:        { available: true },
                'Business Studies':{ available: true },
            }}
        }
    },
    12: {
        streams: {
            Science: { subjects: {
                English:           { available: true },
                Mathematics:       { available: false, recommended: [
                    { title: 'Basic Mathematics', author: 'Dr. B.C. Bajracharya et al.', publisher: 'Sukunda Publication', available: false },
                    { title: 'Fundamental Mathematics', author: 'P.M. Bajracharya et al.', publisher: 'Buddha Publication', available: false },
                ]},
                Nepali:            { available: true },
                Physics:           { available: false, recommended: [
                    { title: 'Pioneer Physics', author: 'K.B. Rayamajhi et al.', publisher: 'Dreamland Publication', available: false },
                    { title: 'Concepts of Physics', author: 'H.C. Verma', publisher: 'Bharati Bhawan', available: false },
                    { title: 'Numerical Problems in Physics', author: 'V.K. Jha', publisher: 'Heritage Publisher & Distributors', available: false },
                ]},
                Chemistry:         { available: false, recommended: [
                    { title: 'Pioneer Chemistry', author: 'A.D. Mishra et al.', publisher: 'Dreamland Publication', available: false },
                    { title: 'Pioneer Practical Chemistry', author: 'A.D. Mishra et al.', publisher: 'Dreamland Publication', available: false },
                ]},
                Biology:           { available: false, recommended: [
                    { title: 'A Text Book of Biology', author: 'A. Keshari & K. Ghimire', publisher: 'Vidyarthi Publication', available: false },
                    { title: 'College Biology', author: 'Rup B. Sah et al.', publisher: 'Advance Ayam Publication', available: false },
                ]},
                'Computer Science':{ available: false, recommended: [
                    { title: 'Computer Science', publisher: 'Buddha Publication', available: false },
                    { title: 'Fundamentals of Information Technology', author: 'Alexis Leon & Mathews Leon', publisher: 'Vikash Publishing House', available: false },
                ]},
            }},
            Management: { subjects: {
                English:           { available: true },
                Mathematics:       { available: false, recommended: [
                    { title: 'Basic Mathematics', author: 'Dr. B.C. Bajracharya et al.', publisher: 'Sukunda Publication', available: false },
                    { title: 'Fundamental Mathematics', author: 'P.M. Bajracharya et al.', publisher: 'Buddha Publication', available: false },
                ]},
                Nepali:            { available: true },
                'Social Studies':  { available: true },
                Economics:         { available: true },
                Accounting:        { available: true },
                'Business Studies':{ available: true },
            }}
        }
    }
};

/* ── HELPERS ─────────────────────────────────────────────── */

const $ = s => document.querySelector(s);
const icon = n => `<i data-lucide="${n}"></i>`;

function slug(s) {
    return s.toLowerCase().replace(/\s+/g, '-');
}

function getBookURL(grade, stream, subject, bookTitle) {
    const segs = [grade];
    if (stream) segs.push(slug(stream));
    segs.push(slug(subject));
    if (bookTitle) segs.push(slug(bookTitle));
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${segs.join('/')}.pdf`;
}

function getViewerURL(grade, stream, subject, book) {
    const streamPart = stream ? ` (${stream})` : '';
    const title  = book
        ? `${book.title} — ${subject}${streamPart}, Grade ${grade}`
        : `${subject}${streamPart} — Grade ${grade} Textbook`;
    const url    = getBookURL(grade, stream, subject, book?.title);
    const source = book ? (book.author || book.publisher || 'Reference') : 'CDC Textbook';
    const p      = new URLSearchParams({ url, title, source, mode: 'paper', return: 'textbooks.html' });
    return `viewer.html?${p}`;
}

const subjectIcon = s =>
    s === 'Mathematics' || s === 'Optional Mathematics' ? 'sigma' :
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

/* ── STATE ───────────────────────────────────────────────── */

const state = {
    grade:   '12',
    stream:  'Science',
    subject: 'Physics',
};

/* ── CURRENT DATA HELPERS ────────────────────────────────── */

function gradeNode() { return TEXTBOOK_DATA[state.grade]; }
function hasStreams() { return !!gradeNode()?.streams; }
function availableStreams() { return hasStreams() ? Object.keys(gradeNode().streams) : []; }

function currentSubjects() {
    const node = gradeNode();
    if (!node) return {};
    return node.streams ? (node.streams[state.stream]?.subjects || {}) : (node.subjects || {});
}

function ensureValidStream() {
    if (!hasStreams()) { state.stream = ''; return; }
    if (!availableStreams().includes(state.stream)) state.stream = availableStreams()[0];
}

function ensureValidSubject() {
    const subs = Object.keys(currentSubjects());
    if (!subs.includes(state.subject)) state.subject = subs[0] || '';
}

/* ── RENDER: STATS PANEL ─────────────────────────────────── */

function renderStats() {
    const subs      = currentSubjects();
    const subNames  = Object.keys(subs);
    const available = subNames.filter(s => subs[s].available).length;
    const streamPart = state.stream ? ` · ${state.stream}` : '';

    $('#statsLabel').textContent = `Grade ${state.grade}${streamPart}`;

    $('#statsGrid').innerHTML = subNames.map(s => {
        const avail = subs[s].available;
        return `
            <div class="stat-row">
                <span class="stat-subject">${s}</span>
                <div class="stat-bar-wrap">
                    <div class="stat-bar" style="--pct:${avail ? 100 : 0}%"></div>
                </div>
                <span class="stat-count" style="color:${avail ? 'var(--accent)' : 'var(--faint)'}">
                    ${avail ? icon('check') : icon('clock')}
                </span>
            </div>`;
    }).join('');

    $('#statsFooter').innerHTML = `
        <span>${available} available</span>
        <span class="stats-dot">·</span>
        <span>${subNames.length - available} coming soon</span>`;
}

/* ── RENDER: GRADE PILLS ─────────────────────────────────── */

function renderGrades() {
    const labels = { 10: 'Grade 10 (SEE)', 11: 'Grade 11', 12: 'Grade 12' };
    $('#gradePills').innerHTML = Object.keys(TEXTBOOK_DATA).map(g =>
        `<button class="grade-pill" role="tab" aria-selected="${g === state.grade}" data-grade="${g}">
            ${labels[g] || 'Grade ' + g}
        </button>`
    ).join('');
}

/* ── RENDER: STREAM BAR ──────────────────────────────────── */

function renderStreamBar() {
    const existing = document.getElementById('streamBar');
    if (existing) existing.remove();
    if (!hasStreams()) return;

    const STREAM_ICONS = { Science: 'atom', Management: 'briefcase' };
    const bar = document.createElement('div');
    bar.id        = 'streamBar';
    bar.className = 'stream-bar';
    bar.innerHTML = `
        <span class="stream-bar-label">Stream</span>
        <div class="stream-pills">
            ${availableStreams().map(s => `
                <button class="stream-pill" aria-selected="${s === state.stream}" data-stream="${s}">
                    <i data-lucide="${STREAM_ICONS[s] || 'layers'}"></i> ${s}
                </button>`).join('')}
        </div>`;
    document.querySelector('.grade-bar').after(bar);
    window.lucide?.createIcons();
}

/* ── RENDER: LEFT PANEL ──────────────────────────────────── */

function renderLeftPanel() {
    $('#subjectHeading').textContent = hasStreams() ? state.stream : `Grade ${state.grade}`;
    $('#subjectNote').textContent    = 'Select a subject to view its textbook.';

    const subs = Object.keys(currentSubjects());
    $('#subjectList').innerHTML = subs.map(s => `
        <button class="subject-btn" aria-selected="${s === state.subject}" data-subject="${s}">
            ${icon(subjectIcon(s))}<span>${s}</span>
        </button>`
    ).join('');
}

/* ── RENDER: BOOK DISPLAY ────────────────────────────────── */

function renderBook() {
    const subs       = currentSubjects();
    const data       = subs[state.subject];
    const streamPart = state.stream ? ` (${state.stream})` : '';
    const eyebrow    = `Grade ${state.grade}${streamPart} / ${state.subject}`;

    $('#contentEyebrow').textContent = eyebrow;
    $('#bookHeading').textContent    = state.subject;
    $('#bookMeta').textContent       = data?.available
        ? 'Official CDC Textbook · Available'
        : (data?.recommended?.length ? 'No official CDC PDF · Recommended references below' : 'Official CDC Textbook · Coming soon');

    if (!data?.available) {
        const recs = data?.recommended || [];
        if (recs.length) {
            $('#bookDisplay').innerHTML = `
                <div class="recommend-wrap">
                    <div class="recommend-note">
                        ${icon('info')}
                        <span>No official CDC PDF for ${state.subject} yet. Here are the reference books we're adding for NEB ${state.grade}${streamPart}.</span>
                    </div>
                    <div class="alt-book-list">
                        ${recs.map(b => {
                            const metaLine = [b.author, b.publisher].filter(Boolean).join(' · ');
                            if (b.available) {
                                const url = getViewerURL(state.grade, state.stream, state.subject, b);
                                return `
                                <a href="${url}" class="book-card alt-book-card">
                                    <div class="book-card-icon">${icon('book-open')}</div>
                                    <div class="book-card-body">
                                        <div class="book-card-title">${b.title}</div>
                                        <div class="book-card-sub">${metaLine}</div>
                                        <div class="book-card-badge available">Available</div>
                                    </div>
                                    <div class="book-card-action">${icon('eye')} <span>Open</span></div>
                                </a>`;
                            }
                            return `
                                <div class="book-card alt-book-card coming-soon">
                                    <div class="book-card-icon">${icon('clock')}</div>
                                    <div class="book-card-body">
                                        <div class="book-card-title">${b.title}</div>
                                        <div class="book-card-sub">${metaLine}</div>
                                        <div class="book-card-badge coming">Coming soon</div>
                                    </div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>`;
            window.lucide?.createIcons();
            return;
        }

        $('#bookDisplay').innerHTML = `
            <div class="book-card coming-soon">
                <div class="book-card-icon">${icon('clock')}</div>
                <div class="book-card-body">
                    <div class="book-card-title">${state.subject} Textbook</div>
                    <div class="book-card-sub">Grade ${state.grade}${streamPart} · CDC Official</div>
                    <div class="book-card-badge coming">Coming soon</div>
                </div>
            </div>`;
        window.lucide?.createIcons();
        return;
    }

    const viewerURL = getViewerURL(state.grade, state.stream, state.subject);

    $('#bookDisplay').innerHTML = `
        <a href="${viewerURL}" class="book-card">
            <div class="book-card-icon">${icon('book-open')}</div>
            <div class="book-card-body">
                <div class="book-card-title">${state.subject} Textbook</div>
                <div class="book-card-sub">Grade ${state.grade}${streamPart} · CDC Official</div>
                <div class="book-card-badge available">Available</div>
            </div>
            <div class="book-card-action">
                ${icon('eye')} <span>Open Textbook</span>
            </div>
        </a>`;
    window.lucide?.createIcons();
}

/* ── FULL RENDER ─────────────────────────────────────────── */

function render() {
    renderGrades();
    renderStreamBar();
    renderLeftPanel();
    renderBook();
    renderStats();
    window.lucide?.createIcons();
}

/* ── INIT ────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
    window.lucide?.createIcons();
    ensureValidStream();
    ensureValidSubject();
    render();
    $('#year').textContent = new Date().getFullYear();

    /* Delegated clicks */
    document.addEventListener('click', e => {
        const gradeEl   = e.target.closest('[data-grade]');
        const streamEl  = e.target.closest('[data-stream]');
        const subjectEl = e.target.closest('[data-subject]');

        if (gradeEl) {
            state.grade = gradeEl.dataset.grade;
            ensureValidStream();
            ensureValidSubject();
            render();
            return;
        }

        if (streamEl) {
            state.stream = streamEl.dataset.stream;
            ensureValidSubject();
            renderStreamBar();
            renderLeftPanel();
            renderBook();
            renderStats();
            window.lucide?.createIcons();
            return;
        }

        if (subjectEl) {
            state.subject = subjectEl.dataset.subject;
            renderLeftPanel();
            renderBook();
            renderStats();
            window.lucide?.createIcons();
        }
    });

    /* Theme toggle */
    document.getElementById('themeToggle')?.addEventListener('click', () => {
        const cur  = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch(e) {}
    });

    /* Navbar scroll */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Hamburger */
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open);
        });
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