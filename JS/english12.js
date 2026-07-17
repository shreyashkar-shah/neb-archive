/* ====================================================
   NEB Archive — English PYQs Logic
   Optimized for Cloudflare R2 & Future Admin Panel
   ==================================================== */

// MOCK API DATA:
// This object simulates the JSON response you will eventually get from your Admin Panel/Backend.
// To integrate later: Replace this block with `fetch('/api/english-pyqs')` and use the response data.
const mockApiData = {
    // The admin panel will be able to update this array to add/remove years.
    availableYears: ["All Years", "2083", "2082", "2081", "2080", "2079", "2078"],
    
    // The admin panel will manage these paper objects (adding titles, years, and R2 links).
    papers: [
        { 
            id: "eng_2083", 
            title: "English Board Exam 2083", 
            year: "2083", 
            description: "Official NEB Grade 12 English question paper for the year 2083.",
            // Replace with your actual Cloudflare R2 Public URL
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2083.pdf" 
        },
        { 
            id: "eng_2082", 
            title: "English Board Exam 2082", 
            year: "2082", 
            description: "Official NEB Grade 12 English question paper for the year 2082.",
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2082.pdf" 
        },
        { 
            id: "eng_2081", 
            title: "English Board Exam 2081", 
            year: "2081", 
            description: "Official NEB Grade 12 English question paper for the year 2081.",
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2081.pdf" 
        },
        { 
            id: "eng_2080", 
            title: "English Board Exam 2080", 
            year: "2080", 
            description: "Official NEB Grade 12 English question paper for the year 2080.",
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2080.pdf" 
        },
        { 
            id: "eng_2080_supp", 
            title: "English Supplementary Exam 2080", 
            year: "2080", 
            description: "Supplementary exam paper for 2080. Good for extra practice.",
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2080_supp.pdf" 
        },
        { 
            id: "eng_2079", 
            title: "English Board Exam 2079", 
            year: "2079", 
            description: "Official NEB Grade 12 English question paper for the year 2079.",
            r2Link: "https://pub-xxxxx.r2.dev/grade12/english/english_2079.pdf" 
        }
    ]
};

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------
       1. MOBILE MENU & DARK MODE (Shared Logic)
       ------------------------------------------------ */
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const themeToggle = document.getElementById('theme-toggle');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /* ------------------------------------------------
       2. DYNAMIC UI INITIALIZATION
       ------------------------------------------------ */
    const yearFilter = document.getElementById('yearFilter');
    const paperContainer = document.getElementById('paper-container');
    const emptyState = document.getElementById('empty-state');

    // Populate Year Filter dynamically from mockApiData
    mockApiData.availableYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year === "All Years" ? "All Years" : `Year ${year}`;
        yearFilter.appendChild(option);
    });

    /* ------------------------------------------------
       3. RENDER FUNCTION
       ------------------------------------------------ */
    function renderPapers(selectedYear) {
        paperContainer.innerHTML = ''; // Clear current cards

        // Filter papers based on selected year
        const filteredPapers = selectedYear === "All Years" 
            ? mockApiData.papers 
            : mockApiData.papers.filter(paper => paper.year === selectedYear);

        // Handle Empty State
        if (filteredPapers.length === 0) {
            paperContainer.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        } else {
            paperContainer.style.display = 'flex';
            emptyState.style.display = 'none';
        }

        // Generate HTML cards
        filteredPapers.forEach(paper => {
            const cardHTML = `
                <article class="pyq-card">
                    <div class="card-meta-top">
                        <span class="tag general">Year: ${paper.year}</span>
                    </div>
                    <div class="notes-icon">📄</div>
                    <h3>${paper.title}</h3>
                    <p>${paper.description}</p>
                    <div class="paper-actions">
                        <!-- View Button: Opens in new tab -->
                        <a href="${paper.r2Link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                        </a>
                        <!-- Download Button: Downloads directly (Note: cross-origin downloads may just open the link if R2 doesn't send Content-Disposition headers) -->
                        <a href="${paper.r2Link}" download class="btn btn-outline btn-sm">
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
            paperContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }

    /* ------------------------------------------------
       4. EVENT LISTENERS & INITIAL LOAD
       ------------------------------------------------ */
    // Re-render when year filter changes
    yearFilter.addEventListener('change', (e) => {
        renderPapers(e.target.value);
    });

    // Initial render on page load (Default: "All Years")
    renderPapers("All Years");

    // Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});