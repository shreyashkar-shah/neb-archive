/* ====================================================
   NEB Archive — Notes Page Logic
   Vanilla JS, no dependencies
   ==================================================== */

// Mock Data Array
const notesData = [
    { subject: "Physics", chapter: "Mechanics", faculty: "Science", viewLink: "#", downloadLink: "#" },
    { subject: "Physics", chapter: "Optics and Waves", faculty: "Science", viewLink: "#", downloadLink: "#" },
    { subject: "Chemistry", chapter: "Chemical Bonding", faculty: "Science", viewLink: "#", downloadLink: "#" },
    { subject: "Biology", chapter: "Genetics and Evolution", faculty: "Science", viewLink: "#", downloadLink: "#" },
    { subject: "Economics", chapter: "Microeconomics", faculty: "Management", viewLink: "#", downloadLink: "#" },
    { subject: "Accounting", chapter: "Final Accounts", faculty: "Management", viewLink: "#", downloadLink: "#" },
    { subject: "English", chapter: "Grammar and Tenses", faculty: "General", viewLink: "#", downloadLink: "#" },
    { subject: "Sociology", chapter: "Social Institutions", faculty: "Humanities", viewLink: "#", downloadLink: "#" }
];

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------
       1. MOBILE MENU TOGGLE (Shared Logic)
       ------------------------------------------------ */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    /* ------------------------------------------------
       2. NOTES SEARCH & FILTER LOGIC
       ------------------------------------------------ */
    const searchInput = document.getElementById('searchInput');
    const facultyFilter = document.getElementById('facultyFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const notesContainer = document.getElementById('notes-container');
    const emptyState = document.getElementById('empty-state');

    // Function to render cards based on provided data array
    function renderNotes(data) {
        // Clear current container
        notesContainer.innerHTML = '';

        // Handle empty state
        if (data.length === 0) {
            notesContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        } else {
            notesContainer.style.display = 'grid';
            emptyState.style.display = 'none';
        }

        // Loop through data and create cards
        data.forEach(item => {
            // Determine emoji based on subject for a subtle dynamic touch
            let icon = "📘"; // Default book
            if (item.subject === "Physics") icon = "⚛️";
            else if (item.subject === "Chemistry") icon = "🧪";
            else if (item.subject === "Biology") icon = "🧬";
            else if (item.subject === "Economics" || item.subject === "Accounting") icon = "📈";
            else if (item.subject === "English") icon = "📖";
            else if (item.subject === "Sociology") icon = "👥";

            const cardHTML = `
                <article class="notes-card">
                    <div class="notes-icon">${icon}</div>
                    <h3>${item.subject}</h3>
                    <p class="chapter">Chapter: ${item.chapter}</p>
                    <div class="notes-actions">
                        <a href="${item.viewLink}" class="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View PDF
                        </a>
                        <a href="${item.downloadLink}" class="btn btn-outline btn-sm" download>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </a>
                    </div>
                </article>
            `;
            notesContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    // Master filter function
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedFaculty = facultyFilter.value;
        const selectedSubject = subjectFilter.value;

        // Filter the mock data based on all criteria
        const filteredData = notesData.filter(item => {
            // Match search term (subject OR chapter)
            const matchesSearch = 
                item.subject.toLowerCase().includes(searchTerm) || 
                item.chapter.toLowerCase().includes(searchTerm);
            
            // Match faculty (if not "All")
            const matchesFaculty = selectedFaculty === 'All' || item.faculty === selectedFaculty;
            
            // Match subject (if not "All")
            const matchesSubject = selectedSubject === 'All' || item.subject === selectedSubject;

            // Return true only if ALL conditions are met
            return matchesSearch && matchesFaculty && matchesSubject;
        });

        // Re-render the grid with filtered data
        renderNotes(filteredData);
    }

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    facultyFilter.addEventListener('change', applyFilters);
    subjectFilter.addEventListener('change', applyFilters);

    // Initial render on page load
    renderNotes(notesData);

    /* ------------------------------------------------
       3. AUTO-UPDATE FOOTER YEAR
       ------------------------------------------------ */
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

        /* ------------------------------------------------
       DARK MODE TOGGLE LOGIC
       ------------------------------------------------ */
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Get current theme from <html> attribute
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            // Switch theme
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // Apply new theme to <html>
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Save preference to localStorage
            localStorage.setItem('theme', newTheme);
        });
    }

});