/*===== OCEANAI PLATFORM JAVASCRIPT =====*/

// ===== GLOBAL VARIABLES =====
let navMenu, navToggle, navClose, header, scrollTop;
let chartInstance = null;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initScrollEffects();
    initScrollSpy();
    initScrollProgress();
    initScrollTop();
    initMobileViewport();
    initAnimations();
    initChart();
    initContactForm();
    initActiveLinks();
    
    console.log('🌊 OCERA Platform initialized successfully!');
    
    // Initialize team name tooltips with delay to ensure DOM is ready
    setTimeout(() => {
        console.log('Initializing team tooltips after delay...');
        initTeamTooltips();
    }, 1000);
    
    // Add a simple theme test
    setTimeout(() => {
        console.log('Testing theme system...');
        const currentTheme = document.documentElement.getAttribute('data-theme');
        console.log('Current theme attribute:', currentTheme);
        
        // Add a visual indicator for testing
        const indicator = document.createElement('div');
        indicator.id = 'theme-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 10px;
            background: var(--surface-color);
            color: var(--text-color);
            border: 1px solid var(--border-color);
            border-radius: 5px;
            z-index: 9999;
            font-size: 12px;
        `;
        indicator.textContent = `Theme: ${currentTheme || 'none'}`;
        document.body.appendChild(indicator);
    }, 2000);
});

// ===== TEAM NAME TOOLTIPS =====
function initTeamTooltips() {
    console.log('Initializing team tooltips...');
    
    const nameLetters = document.querySelectorAll('.name-letter');
    const tooltip = document.getElementById('nameTooltip');
    
    console.log('Found name letters:', nameLetters.length);
    console.log('Found tooltip:', tooltip);
    
    if (!tooltip) {
        console.error('Tooltip element not found!');
        return;
    }
    
    nameLetters.forEach((letter, index) => {
        console.log(`Setting up letter ${index}:`, letter);
        
        const showTooltip = (name, targetElement) => {
            console.log('Showing tooltip for:', name);
            tooltip.textContent = name;
            tooltip.classList.add('show');
            
            // Simple positioning
            const rect = targetElement.getBoundingClientRect();
            const container = targetElement.closest('.about__team-motto');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const leftPosition = rect.left - containerRect.left + (rect.width / 2);
                tooltip.style.left = `${leftPosition}px`;
            }
        };
        
        const hideTooltip = () => {
            console.log('Hiding tooltip');
            tooltip.classList.remove('show');
        };
        
        // Add event listeners with better event handling
        letter.addEventListener('mouseenter', (e) => {
            const name = letter.getAttribute('data-name');
            console.log('Mouse enter on letter, name:', name);
            if (name) {
                showTooltip(name, letter);
            }
        });
        
        letter.addEventListener('mouseleave', () => {
            console.log('Mouse leave on letter');
            hideTooltip();
        });
        
        // Also handle the strong element
        const strongElement = letter.querySelector('strong');
        if (strongElement) {
            strongElement.addEventListener('mouseenter', (e) => {
                const name = letter.getAttribute('data-name');
                console.log('Mouse enter on strong, name:', name);
                if (name) {
                    showTooltip(name, letter);
                }
            });
        }
    });
}

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
    navMenu = document.getElementById('nav-menu');
    navToggle = document.getElementById('nav-toggle');
    navClose = document.getElementById('nav-close');
    header = document.getElementById('header');
    
    // Mobile menu toggle with hamburger animation
    if (navToggle) {
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isMenuOpen = navMenu.classList.contains('show-menu');
            
            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }
    
    // Mobile menu close
    if (navClose) {
        navClose.addEventListener('click', () => {
            closeMenu();
        });
    }
    
    // Close menu when clicking on links with smooth scroll
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Handle smooth scrolling for anchor links
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Update active link immediately
                    updateActiveLink(link, navLinks);
                    closeMenu();
                    
                    // Disable scroll spy during programmatic scrolling
                    if (window.setScrollSpyActive) {
                        window.setScrollSpyActive(false);
                    }
                    
                    // Smooth scroll to target
                    setTimeout(() => {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                        
                        // Re-enable scroll spy after scrolling completes
                        setTimeout(() => {
                            if (window.setScrollSpyActive) {
                                window.setScrollSpyActive(true);
                            }
                        }, 1000);
                    }, 300);
                }
            } else {
                closeMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('show-menu') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            closeMenu();
        }
    });
    
    // Helper functions for menu control
    function openMenu() {
        navMenu.classList.add('show-menu');
        navToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        navMenu.classList.remove('show-menu');
        navToggle.classList.remove('active');
        document.body.style.overflow = 'visible';
    }
    
    function updateActiveLink(activeLink, allNavLinks) {
        allNavLinks.forEach(link => link.classList.remove('active-link'));
        activeLink.classList.add('active-link');
    }
}

// ===== THEME TOGGLE FUNCTIONALITY =====
function initThemeToggle() {
    console.log('initThemeToggle called');
    
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        const themeToggle = document.getElementById('theme-toggle');
        console.log('Theme toggle element:', themeToggle);
        
        if (!themeToggle) {
            console.error('Theme toggle button not found!');
            return;
        }
        
        const themeIcon = themeToggle.querySelector('i');
        console.log('Theme icon element:', themeIcon);
        
        if (!themeIcon) {
            console.error('Theme toggle icon not found!');
            return;
        }
        
        // Check for saved theme preference or default to light mode
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        
        console.log('Theme initialized:', currentTheme);
        console.log('Document theme attribute:', document.documentElement.getAttribute('data-theme'));
        
        // Update icon based on current theme
        updateThemeIcon(currentTheme, themeIcon);
        
        // Remove any existing event listeners
        const newThemeToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newThemeToggle, themeToggle);
        
        // Add event listener to the new element
        newThemeToggle.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Theme toggle clicked!');
            
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            console.log('Theme toggle clicked. Current:', currentTheme, 'New:', newTheme);
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            
            const newIcon = newThemeToggle.querySelector('i');
            if (newIcon) {
                updateThemeIcon(newTheme, newIcon);
            }
            
            // Add smooth transition effect
            document.body.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        });
        
        console.log('Theme toggle event listener added');
    }, 500);
}

function updateThemeIcon(theme, icon) {
    console.log('Updating theme icon for theme:', theme);
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
    console.log('Icon updated to:', icon.className);
}

// Manual theme toggle function for testing
window.toggleThemeManually = function() {
    console.log('Manual theme toggle called');
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log('Manual toggle - Current:', currentTheme, 'New:', newTheme);
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        updateThemeIcon(newTheme, themeIcon);
    }
    
    console.log('Manual theme toggle completed');
};

// ===== SCROLL SPY FUNCTIONALITY =====
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    let isScrolling = false;
    
    function updateActiveNavLink() {
        if (isScrolling) return; // Don't update during programmatic scrolling
        
        let current = 'home'; // Default to home
        const scrollY = window.pageYOffset;
        
        // Check if we're at the top of the page
        if (scrollY < 100) {
            current = 'home';
        } else {
            // Find the section that's most visible in the viewport
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150; // Account for header
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                // Check if section is in viewport
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    current = sectionId;
                }
            });
        }
        
        // Update navigation links
        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active-link');
            }
        });
    }
    
    // Throttled scroll handler for better performance
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavLink, 10);
    }
    
    // Update on scroll
    window.addEventListener('scroll', handleScroll);
    
    // Update on load
    updateActiveNavLink();
    
    // Expose function to disable during programmatic scrolling
    window.setScrollSpyActive = function(active) {
        isScrolling = !active;
    };
}

// ===== SCROLL PROGRESS INDICATOR =====
function initScrollProgress() {
    const scrollIndicator = document.getElementById('scroll-indicator');
    
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / scrollHeight) * 100;
            
            scrollIndicator.style.width = scrollPercent + '%';
        });
    }
}

// ===== MOBILE VIEWPORT FIXES =====
function initMobileViewport() {
    // Prevent zoom on double tap for iOS
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function (event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Fix viewport height for mobile browsers
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', () => {
        setTimeout(setViewportHeight, 100);
    });
    
    // Prevent horizontal scroll
    document.addEventListener('touchmove', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    // Ensure header is available
    if (!header) {
        header = document.getElementById('header');
    }
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        
        // Header background change
        if (header) {
            if (scrollY >= 50) {
                header.classList.add('scroll-header');
            } else {
                header.classList.remove('scroll-header');
            }
        }
        
        // Show/hide scroll top button
        if (scrollTop) {
            if (scrollY >= 400) {
                scrollTop.classList.add('show-scroll');
            } else {
                scrollTop.classList.remove('show-scroll');
            }
        }
    });
}

// ===== SCROLL TO TOP =====
function initScrollTop() {
    scrollTop = document.getElementById('scroll-top');
    
    if (scrollTop) {
        scrollTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// ===== ACTIVE NAVIGATION LINKS =====
function initActiveLinks() {
    // This function is kept for compatibility but main logic is in initScrollSpy
}

// ===== ANIMATIONS =====
function initAnimations() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.platform__card, .feature, .data__source, .about__stat, .insight-card'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);
}

// ===== DATA VISUALIZATION CHART =====
function initChart() {
    const ctx = document.getElementById('dataChart');
    if (!ctx) return;
    
    // Sample oceanographic data
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Ocean Temperature (°C)',
                data: [18.2, 18.8, 19.5, 20.1, 21.3, 22.0],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Fish Population (thousands)',
                data: [2300, 2250, 2180, 2100, 2050, 1980],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Biodiversity Index',
                data: [8.2, 8.4, 8.1, 8.6, 8.8, 8.7],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            }
        ]
    };
    
    const chartConfig = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            elements: {
                point: {
                    radius: 4,
                    hoverRadius: 8,
                    backgroundColor: '#ffffff',
                    borderWidth: 2
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            }
        }
    };
    
    chartInstance = new Chart(ctx, chartConfig);
    
    // Update chart data periodically (simulation)
    setTimeout(() => {
        animateChartData();
    }, 3000);
}

function animateChartData() {
    if (!chartInstance) return;
    
    // Simulate real-time data updates
    setInterval(() => {
        const datasets = chartInstance.data.datasets;
        
        datasets.forEach(dataset => {
            dataset.data = dataset.data.map(value => {
                const variation = (Math.random() - 0.5) * 0.2;
                return Number((value + variation).toFixed(1));
            });
        });
        
        chartInstance.update('none');
    }, 5000);
}

// ===== CONTACT FORM =====
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const formFields = {
            name: contactForm.querySelector('input[type="text"]').value,
            email: contactForm.querySelector('input[type="email"]').value,
            interest: contactForm.querySelector('select').value,
            message: contactForm.querySelector('textarea').value
        };
        
        // Validate form
        if (validateForm(formFields)) {
            // Simulate form submission
            submitForm(formFields);
        }
    });
}

function validateForm(fields) {
    let isValid = true;
    
    // Validate name
    if (!fields.name || fields.name.trim().length < 2) {
        showFieldError('name', 'Please enter a valid name (minimum 2 characters)');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!fields.email || !emailRegex.test(fields.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate interest
    if (!fields.interest) {
        showFieldError('select', 'Please select your area of interest');
        isValid = false;
    }
    
    // Validate message
    if (!fields.message || fields.message.trim().length < 10) {
        showFieldError('message', 'Please enter a message (minimum 10 characters)');
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(fieldName, message) {
    // Implementation for showing field errors
    console.log(`Error in ${fieldName}: ${message}`);
}

function submitForm(fields) {
    // Implementation for form submission
    console.log('Form submitted:', fields);
}
// ===
== APPLICATION PREVIEW MODAL =====
let currentAppUrl = '';

function showAppPreview(appType) {
    const modal = document.getElementById('appPreviewModal');
    const previewTitle = document.getElementById('previewTitle');
    const previewFrame = document.getElementById('previewFrame');
    
    if (!modal || !previewTitle || !previewFrame) return;
    
    let appUrl = '';
    let appTitle = '';
    
    switch(appType) {
        case 'data-ingestion':
            appUrl = 'oceanai.backend/data-ingestion-portal.html';
            appTitle = 'Data Ingestion Portal - Preview';
            break;
        case 'marine-prototype':
            appUrl = 'oceanai.backend/marine_prototype_updated.html';
            appTitle = 'OceraMarine - Preview';
            break;
        default:
            return;
    }
    
    currentAppUrl = appUrl;
    previewTitle.textContent = appTitle;
    previewFrame.src = appUrl;
    modal.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

function closeAppPreview() {
    const modal = document.getElementById('appPreviewModal');
    const previewFrame = document.getElementById('previewFrame');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'visible';
    }
    
    if (previewFrame) {
        previewFrame.src = '';
    }
    
    currentAppUrl = '';
}

function openFullApp() {
    if (currentAppUrl) {
        window.open(currentAppUrl, '_blank');
        closeAppPreview();
    }
}

// Close modal with Escape key for app preview
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('appPreviewModal');
        if (modal && modal.classList.contains('active')) {
            closeAppPreview();
        }
    }
});

// Backup theme toggle initialization
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        console.log('Backup theme toggle initialization...');
        const themeButton = document.getElementById('theme-toggle');
        if (themeButton) {
            console.log('Found theme button, adding backup listener');
            themeButton.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Backup theme toggle clicked!');
                
                const html = document.documentElement;
                const currentTheme = html.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                console.log('Backup toggle - switching from', currentTheme, 'to', newTheme);
                
                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                
                // Update icon
                const icon = themeButton.querySelector('i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
                
                // Update indicator if it exists
                const indicator = document.getElementById('theme-indicator');
                if (indicator) {
                    indicator.textContent = `Theme: ${newTheme}`;
                }
                
                console.log('Backup theme toggle completed');
            });
        } else {
            console.error('Theme button not found in backup initialization');
        }
    }, 3000);
});