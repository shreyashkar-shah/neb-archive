/* ====================================================
   NEB Archive — PDF Viewer Logic
   Uses PDF.js to render PDFs natively in the browser
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------
       1. DARK MODE, BACK BTN, & SIDEBAR TOGGLE
       ------------------------------------------------ */
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    const backBtn = document.getElementById('viewer-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = 'index.html'; 
            }
        });
    }

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('pdf-sidebar');
    const pageIndicator = document.getElementById('page-indicator');
    
    if (window.innerWidth <= 768) {
        sidebar.classList.add('hidden');
    }

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
        });
    }

    /* ------------------------------------------------
       2. URL PARAMS & PDF.JS INITIALIZATION
       ------------------------------------------------ */
    const urlParams = new URLSearchParams(window.location.search);
    const fileUrl = urlParams.get('file');
    const fileTitle = urlParams.get('title') || "Document";

    document.getElementById('pdf-title').textContent = fileTitle;

    if (!fileUrl) {
        document.getElementById('loading-spinner').innerHTML = "<p style='color: red;'>Error: No file specified.</p>";
        return;
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const container = document.getElementById('pdf-container');
    const thumbnailList = document.getElementById('thumbnail-list');
    
    let currentScale = 1.0; 
    let pdfDoc = null;
    let currentPageNum = 1; // Track current page for keyboard navigation

    /* ------------------------------------------------
       3. INTERSECTION OBSERVER (Track active page)
       ------------------------------------------------ */
    const observerOptions = {
        root: container,
        rootMargin: '0px',
        threshold: 0.5 
    };

    const pageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const pageNum = parseInt(entry.target.dataset.pageNum);
                currentPageNum = pageNum; // Update global tracker
                
                if (pdfDoc) {
                    pageIndicator.textContent = `${pageNum} / ${pdfDoc.numPages}`;
                }
                
                document.querySelectorAll('.thumbnail-item').forEach(t => t.classList.remove('active'));
                
                const activeThumb = document.querySelector(`.thumbnail-item[data-page-num="${pageNum}"]`);
                if (activeThumb) {
                    activeThumb.classList.add('active');
                    activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        });
    }, observerOptions);

    /* ------------------------------------------------
       4. KEYBOARD NAVIGATION (Up/Down, Left/Right, PgUp/PgDn)
       ------------------------------------------------ */
    document.addEventListener('keydown', (e) => {
        if (!pdfDoc) return;

        let targetPage = currentPageNum;

        // Check which key was pressed
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
            e.preventDefault(); // Prevent default browser scroll
            if (targetPage < pdfDoc.numPages) targetPage++;
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            if (targetPage > 1) targetPage--;
        } else {
            return; // Ignore other keys
        }

        // If target page is different from current, scroll to it
        if (targetPage !== currentPageNum) {
            const targetCanvas = document.querySelector(`#pdf-container canvas[data-page-num="${targetPage}"]`);
            if (targetCanvas) {
                // Optimistic update so rapid key presses work smoothly
                currentPageNum = targetPage; 
                targetCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    });

    /* ------------------------------------------------
       5. MAIN PDF RENDERING (High-DPI Fix)
       ------------------------------------------------ */
    async function renderPDF() {
        try {
            if (!pdfDoc) {
                const loadingTask = pdfjsLib.getDocument(fileUrl);
                pdfDoc = await loadingTask.promise;
                pageIndicator.textContent = `1 / ${pdfDoc.numPages}`;
                await renderThumbnails(); 
            }
            
            container.innerHTML = ''; 
            const outputScale = window.devicePixelRatio || 1;

            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const viewport = page.getViewport({ scale: currentScale * 1.5 });
                
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');

                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + 'px';
                canvas.style.height = Math.floor(viewport.height) + 'px';
                canvas.dataset.pageNum = i; 

                container.appendChild(canvas);

                const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    transform: transform
                }).promise;

                pageObserver.observe(canvas);
            }
        } catch (error) {
            console.error("Error rendering PDF:", error);
            container.innerHTML = "<div class='loading-spinner'><p style='color: red;'>Failed to load PDF. Check CORS settings or file URL.</p></div>";
        }
    }

    /* ------------------------------------------------
       6. THUMBNAIL RENDERING
       ------------------------------------------------ */
    async function renderThumbnails() {
        thumbnailList.innerHTML = ''; 
        const thumbScale = 0.3; 

        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: thumbScale });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const thumbItem = document.createElement('div');
            thumbItem.classList.add('thumbnail-item');
            thumbItem.dataset.pageNum = i;
            thumbItem.appendChild(canvas);

            const pageNumLabel = document.createElement('div');
            pageNumLabel.classList.add('thumbnail-page-num');
            pageNumLabel.textContent = `Page ${i}`;
            thumbItem.appendChild(pageNumLabel);

            thumbItem.addEventListener('click', () => {
                const mainCanvas = document.querySelector(`#pdf-container canvas[data-page-num="${i}"]`);
                if (mainCanvas) {
                    mainCanvas.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    if (window.innerWidth <= 768) {
                        sidebar.classList.add('hidden');
                    }
                }
            });

            thumbnailList.appendChild(thumbItem);
        }
    }

    /* ------------------------------------------------
       7. ZOOM CONTROLS
       ------------------------------------------------ */
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomLevelSpan = document.getElementById('zoom-level');

    function updateZoom(newScale) {
        currentScale = newScale;
        currentScale = Math.max(0.5, Math.min(currentScale, 3.0)); 
        zoomLevelSpan.textContent = Math.round(currentScale * 100) + "%";
        renderPDF(); 
    }

    zoomInBtn.addEventListener('click', () => updateZoom(currentScale + 0.2));
    zoomOutBtn.addEventListener('click', () => updateZoom(currentScale - 0.2));

    // Initial Load
    renderPDF();

});