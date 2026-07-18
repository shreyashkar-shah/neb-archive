/* ====================================================
   NEB Archive — English PYQs Logic (Accordion List)
   Optimized for Supabase / Cloudflare R2
   ==================================================== */

// MOCK API DATA
// Simulates data fetched from your backend.
const mockApiData = {
    boardPapers: [
        { id: "b1", year: "2083", title: "English Question Paper 2083", description: "Conducted by NEB in 2083 BS.", questionR2: "https://cqmqxazynzmkoahuppnu.supabase.co/storage/v1/object/public/papers/grade12/science/2083/English%202083.pdf", solutionR2: "#" },
        { id: "b2", year: "2082", title: "English Question Paper 2082", description: "Conducted by NEB in 2082 BS.", questionR2: "https://cqmqxazynzmkoahuppnu.supabase.co/storage/v1/object/public/papers/grade12/science/2082/English%202082.pdf", solutionR2: "#" }, 
        { id: "b3", year: "2081", title: "English Question Paper 2081", description: "Conducted by NEB in 2081 BS.", questionR2: "https://cqmqxazynzmkoahuppnu.supabase.co/storage/v1/object/public/papers/grade12/science/2081/English%202081.pdf", solutionR2: "#" } 
    ],
    supplementaryPapers: [
        { id: "s1", year: "2080", title: "Supplementary Exam 2080", description: "Makeup exam for 2080 batch.", questionR2: "https://pub-xxxxx.r2.dev/eng_supp_2080_q.pdf", solutionR2: "https://pub-xxxxx.r2.dev/eng_supp_2080_s.pdf" }
    ],
    practicePapers: [
        { id: "p1", year: "2081", title: "Practice Set 1 - Full Mock", description: "Curated by NEB Archive team.", questionR2: "https://pub-xxxxx.r2.dev/eng_practice_1_q.pdf", solutionR2: "https://pub-xxxxx.r2.dev/eng_practice_1_s.pdf" },
        { id: "p2", year: "2080", title: "Practice Set 2 - Grammar Focus", description: "Curated by NEB Archive team.", questionR2: "https://pub-xxxxx.r2.dev/eng_practice_2_q.pdf", solutionR2: "https://pub-xxxxx.r2.dev/eng_practice_2_s.pdf" }
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
       2. ACCORDION LIST RENDERING & LOGIC
       ------------------------------------------------ */
    const boardContainer = document.getElementById('board-papers-container');
    const suppContainer = document.getElementById('supplementary-papers-container');
    const pracContainer = document.getElementById('practice-papers-container');
    const emptyState = document.getElementById('empty-state');
    const yearPills = document.querySelectorAll('.year-pill');
    
    // Helper to generate HTML for a single accordion item
    function createAccordionHTML(item) {
        const hasSolution = item.solutionR2 && item.solutionR2 !== "#";
        
        // Encode the URL and Title so they pass safely through the browser URL to viewer.html
        const questionViewerUrl = `viewer.html?file=${encodeURIComponent(item.questionR2)}&title=${encodeURIComponent(item.title + " - Question")}`;
        const solutionViewerUrl = `viewer.html?file=${encodeURIComponent(item.solutionR2)}&title=${encodeURIComponent(item.title + " - Solution")}`;
        
        return `
            <div class="accordion-item" data-id="${item.id}">
                <button class="accordion-header">
                    <div class="header-left">
                        <div class="header-icon">📄</div>
                        <div class="header-title">
                            <h3>${item.title}</h3>
                            <span>${item.description}</span>
                        </div>
                    </div>
                    <div class="header-right">
                        <span class="header-tag">${item.year}</span>
                        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                </button>
                <div class="accordion-body">
                    <div class="body-content">
                        <!-- Question Paper Sub-Card -->
                        <div class="sub-card">
                            <div class="sub-card-header">
                                <div class="sub-card-icon q-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                </div>
                                <h4>Question Paper</h4>
                            </div>
                            <div class="sub-card-actions">
                                <!-- Points to custom viewer.html -->
                                <a href="${questionViewerUrl}" class="btn btn-primary btn-sm">View PDF</a>
                            </div>
                        </div>

                        <!-- Solution Sub-Card -->
                        <div class="sub-card">
                            <div class="sub-card-header">
                                <div class="sub-card-icon s-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <h4>Solution</h4>
                            </div>
                            <div class="sub-card-actions">
                                ${hasSolution ? `
                                    <a href="${solutionViewerUrl}" class="btn btn-primary btn-sm">View PDF</a>
                                ` : `
                                    <span style="font-size: 13px; color: var(--text-muted); width: 100%; text-align: center; padding: 8px 0;">Solution not available yet.</span>
                                `}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Master render function
    function renderContent(selectedYear) {
        let totalItemsShown = 0;

        // Filter Board Papers
        const filteredBoard = selectedYear === "All" ? mockApiData.boardPapers : mockApiData.boardPapers.filter(p => p.year === selectedYear);
        boardContainer.innerHTML = filteredBoard.map(createAccordionHTML).join('') || `<p style="color: var(--text-muted); font-size: 14px; padding: 12px 0;">No board papers for this year.</p>`;
        totalItemsShown += filteredBoard.length;

        // Filter Supplementary Papers
        const filteredSupp = selectedYear === "All" ? mockApiData.supplementaryPapers : mockApiData.supplementaryPapers.filter(p => p.year === selectedYear);
        suppContainer.innerHTML = filteredSupp.map(createAccordionHTML).join('') || `<p style="color: var(--text-muted); font-size: 14px; padding: 12px 0;">No supplementary papers for this year.</p>`;
        totalItemsShown += filteredSupp.length;

        // Filter Practice Papers
        const filteredPrac = selectedYear === "All" ? mockApiData.practicePapers : mockApiData.practicePapers.filter(p => p.year === selectedYear);
        pracContainer.innerHTML = filteredPrac.map(createAccordionHTML).join('') || `<p style="color: var(--text-muted); font-size: 14px; padding: 12px 0;">No practice sets for this year.</p>`;
        totalItemsShown += filteredPrac.length;

        // Handle global empty state
        if (totalItemsShown === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }

        // Attach event listeners to newly created accordion headers
        attachAccordionListeners();
    }

    // Accordion Click Logic
    function attachAccordionListeners() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                e.currentTarget.parentElement.classList.toggle('active');
            });
        });
    }

    /* ------------------------------------------------
       3. EVENT LISTENERS (Year Pills) & INITIAL LOAD
       ------------------------------------------------ */
    yearPills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills
            yearPills.forEach(p => p.classList.remove('active'));
            // Add active class to clicked pill
            pill.classList.add('active');
            // Render content based on pill's data-year attribute
            renderContent(pill.dataset.year);
        });
    });

    // Initial render
    renderContent("All Years");

    // Footer Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

});