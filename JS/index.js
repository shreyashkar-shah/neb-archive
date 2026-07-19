/* ============================================================
   NEB Archive â€” Landing Page Logic
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------
       ICONS (Lucide)
    ------------------------------------------------ */
    if (window.lucide) lucide.createIcons();

    /* ------------------------------------------------
       THEME TOGGLE
       Initial theme is set in <head> to avoid a flash.
       Here we just handle clicks + persistence.
    ------------------------------------------------ */
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    /* ------------------------------------------------
       MOBILE MENU
    ------------------------------------------------ */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const open = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', open);
            hamburger.setAttribute('aria-expanded', open);
        });

        // Close the menu when a link is tapped
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }));

        // Close when tapping outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ------------------------------------------------
       NAVBAR SHADOW ON SCROLL
    ------------------------------------------------ */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* ------------------------------------------------
       SCROLL REVEAL (IntersectionObserver)
    ------------------------------------------------ */
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
        revealEls.forEach(el => io.observe(el));
    } else {
        // Fallback: show everything
        revealEls.forEach(el => el.classList.add('in'));
    }

    /* ------------------------------------------------
       AUTO-UPDATE FOOTER YEAR
    ------------------------------------------------ */
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});