/* ==========================================================================
   Bizim Kafe Çayko - Interactivity & Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mobile Navigation Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (mobileToggle && navbar) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navbar.classList.toggle('active');
            
            if (navbar.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }
    
    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbar && navbar.classList.contains('active')) {
                mobileToggle.classList.remove('active');
                navbar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // 2. Active Section Highlighting on Scroll (Scrollspy)
    const sections = document.querySelectorAll('section');
    
    function scrollspy() {
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
        
        if (window.scrollY < 200) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLinks.length > 0) navLinks[0].classList.add('active');
        }
    }
    
    window.addEventListener('scroll', scrollspy);
    scrollspy();

    // 3. Menu Tabs Switcher
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
            
            // Reset zoom state if switching tabs
            resetZoom();
        });
    });

    // 4. Menu Lightbox and Dynamic Zoom/Pan Functionality
    const triggers = document.querySelectorAll('.zoomable-trigger');
    const lightbox = document.getElementById('menu-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    
    let currentScale = 1;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    
    // Open Lightbox
    triggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const imgSrc = trigger.getAttribute('data-img');
            lightboxImg.src = imgSrc;
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // prevent background scrolling
            resetZoom();
        });
    });
    
    // Close Lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        // keep body overflow unless mobile menu is open
        if (navbar && !navbar.classList.contains('active')) {
            document.body.style.overflow = '';
        }
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }
    
    if (lightbox) {
        // Close when clicking outside the image
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper')) {
                closeLightbox();
            }
        });
    }
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === '+') {
                zoom(0.2);
            } else if (e.key === '-') {
                zoom(-0.2);
            }
        }
    });
    
    // Zoom Logic
    function applyTransform() {
        // Constrain panning when zoomed in
        if (currentScale <= 1) {
            currentX = 0;
            currentY = 0;
        }
        lightboxImg.style.transform = `scale(${currentScale}) translate(${currentX}px, ${currentY}px)`;
    }
    
    function zoom(amount) {
        currentScale = Math.min(Math.max(currentScale + amount, 0.8), 4); // limit scale between 0.8x and 4x
        applyTransform();
    }
    
    function resetZoom() {
        currentScale = 1;
        currentX = 0;
        currentY = 0;
        applyTransform();
    }
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoom(0.25));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoom(-0.25));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);
    
    // Mouse Drag-to-Pan Event Handlers
    lightboxImg.addEventListener('mousedown', (e) => {
        if (currentScale > 1) {
            e.preventDefault();
            isDragging = true;
            lightboxImg.style.cursor = 'grabbing';
            startX = e.clientX - currentX * currentScale;
            startY = e.clientY - currentY * currentScale;
        }
    });
    
    window.addEventListener('mousemove', (e) => {
        if (isDragging && currentScale > 1) {
            currentX = (e.clientX - startX) / currentScale;
            currentY = (e.clientY - startY) / currentScale;
            applyTransform();
        }
    });
    
    window.addEventListener('mouseup', () => {
        isDragging = false;
        if (lightboxImg) {
            lightboxImg.style.cursor = currentScale > 1 ? 'grab' : 'zoom-in';
        }
    });
    
    // Touch Drag-to-Pan for Mobile Devices
    lightboxImg.addEventListener('touchstart', (e) => {
        if (currentScale > 1 && e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX - currentX * currentScale;
            startY = e.touches[0].clientY - currentY * currentScale;
        }
    }, { passive: true });
    
    lightboxImg.addEventListener('touchmove', (e) => {
        if (isDragging && currentScale > 1 && e.touches.length === 1) {
            currentX = (e.touches[0].clientX - startX) / currentScale;
            currentY = (e.touches[0].clientY - startY) / currentScale;
            applyTransform();
        }
    }, { passive: true });
    
    lightboxImg.addEventListener('touchend', () => {
        isDragging = false;
    });

    // 5. Header Visual Style shift on Scroll
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '5px 0';
            header.style.background = 'rgba(15, 12, 10, 0.96)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)';
        } else {
            header.style.padding = '0';
            header.style.background = 'rgba(15, 12, 10, 0.85)';
            header.style.boxShadow = 'none';
        }
    });
});
