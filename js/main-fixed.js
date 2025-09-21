/*===== OCERA PLATFORM JAVASCRIPT - FIXED VERSION =====*/

// ===== GLOBAL VARIABLES =====
let navMenu, navToggle, navClose, header, scrollTop;
let chartInstance = null;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌊 Initializing OCERA Platform...');
    
    // Initialize all components
    initNavigation();
    initThemeToggle();
    initScrollEffects();
    initScrollSpy();
    initScrollProgress();
    initScrollTop();
    initChart();
    initTeamTooltips();
    
    console.log('✅ OCERA Platform initialized successfully!');
});

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
    navMenu = document.getElementById('nav-menu');
    navToggle = document.getElementById('nav-toggle');
    navClose = document.getElementById('nav-close');
    header = document.getElementById('header');
    
    console.log('Navigation elements:', { navMenu, navToggle, navClose, header });
    
    // Mobile menu toggle
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
    
    // Close menu when clicking on links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    closeMenu();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else {
                closeMenu();
            }
        });
    });
    
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
}

// ===== THEME TOGGLE FUNCTIONALITY =====
function initThemeToggle() {
    console.log('Initializing theme toggle...');
    
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.error('❌ Theme toggle button not found!');
        return;
    }
    
    const themeIcon = themeToggle.querySelector('i');
    
    if (!themeIcon) {
        console.error('❌ Theme toggle icon not found!');
        return;
    }
    
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    console.log('✅ Initial theme set to:', savedTheme);
    
    // Add click event listener
    themeToggle.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('🎯 Theme toggle clicked!');
        
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        console.log('🔄 Switching theme from', currentTheme, 'to', newTheme);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
        
        console.log('✅ Theme switched successfully!');
    });
    
    console.log('✅ Theme toggle initialized successfully!');
}

function updateThemeIcon(theme, icon) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
    console.log('🎨 Icon updated for theme:', theme, '- Icon:', icon.className);
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    console.log('Initializing scroll effects...');
    
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
    
    console.log('✅ Scroll effects initialized!');
}

// ===== SCROLL SPY FUNCTIONALITY =====
function initScrollSpy() {
    console.log('Initializing scroll spy...');
    
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    
    function updateActiveNavLink() {
        let current = 'home';
        const scrollY = window.pageYOffset;
        
        if (scrollY < 100) {
            current = 'home';
        } else {
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollY >= sectionTop && scrollY < sectionBottom) {
                    current = sectionId;
                }
            });
        }
        
        navLinks.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active-link');
            }
        });
    }
    
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNavLink, 10);
    }
    
    window.addEventListener('scroll', handleScroll);
    updateActiveNavLink();
    
    console.log('✅ Scroll spy initialized!');
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
        console.log('✅ Scroll progress initialized!');
    }
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
        console.log('✅ Scroll to top initialized!');
    }
}

// ===== CHART INITIALIZATION =====
function initChart() {
    console.log('Initializing chart...');
    
    const ctx = document.getElementById('dataChart');
    if (!ctx) {
        console.log('⚠️ Chart canvas not found, skipping chart initialization');
        return;
    }
    
    // Check if Chart.js is loaded
    if (typeof Chart === 'undefined') {
        console.error('❌ Chart.js library not loaded!');
        return;
    }
    
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Ocean Temperature (°C)',
                data: [18.2, 18.8, 19.5, 20.1, 21.3, 22.0],
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Fish Population (thousands)',
                data: [2300, 2250, 2180, 2100, 2050, 1980],
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Biodiversity Index',
                data: [8.2, 8.4, 8.1, 8.6, 8.8, 8.7],
                borderColor: '#2dd4bf',
                backgroundColor: 'rgba(45, 212, 191, 0.1)',
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
                    borderColor: '#38bdf8',
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
    
    try {
        chartInstance = new Chart(ctx, chartConfig);
        console.log('✅ Chart initialized successfully!');
    } catch (error) {
        console.error('❌ Chart initialization failed:', error);
    }
}

// ===== TEAM NAME TOOLTIPS =====
function initTeamTooltips() {
    console.log('Initializing team tooltips...');
    
    const nameLetters = document.querySelectorAll('.name-letter');
    
    if (nameLetters.length === 0) {
        console.log('⚠️ No name letters found, skipping tooltip initialization');
        return;
    }
    
    nameLetters.forEach((letter, index) => {
        const name = letter.getAttribute('data-name');
        if (!name) return;
        
        letter.addEventListener('mouseenter', function() {
            console.log('👋 Showing tooltip for:', name);
            // The CSS tooltip will handle the display
        });
        
        letter.addEventListener('mouseleave', function() {
            console.log('👋 Hiding tooltip for:', name);
        });
    });
    
    console.log('✅ Team tooltips initialized for', nameLetters.length, 'letters');
}

// ===== APPLICATION PREVIEW MODAL =====
let currentAppUrl = '';

function showAppPreview(appType) {
    console.log('📱 Opening app preview for:', appType);
    
    const modal = document.getElementById('appPreviewModal');
    const previewTitle = document.getElementById('previewTitle');
    const previewFrame = document.getElementById('previewFrame');
    
    if (!modal || !previewTitle || !previewFrame) {
        console.error('❌ Modal elements not found');
        return;
    }
    
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
            console.error('❌ Unknown app type:', appType);
            return;
    }
    
    currentAppUrl = appUrl;
    previewTitle.textContent = appTitle;
    previewFrame.src = appUrl;
    modal.classList.add('active');
    
    document.body.style.overflow = 'hidden';
    console.log('✅ App preview opened');
}

function closeAppPreview() {
    console.log('❌ Closing app preview');
    
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
        console.log('🚀 Opening full app:', currentAppUrl);
        window.open(currentAppUrl, '_blank');
        closeAppPreview();
    }
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape') {
        const modal = document.getElementById('appPreviewModal');
        if (modal && modal.classList.contains('active')) {
            closeAppPreview();
        }
    }
});

// ===== MANUAL TESTING FUNCTIONS =====
window.testTheme = function() {
    console.log('🧪 Manual theme test');
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    console.log('✅ Theme manually changed to:', newTheme);
};

console.log('📜 OCERA JavaScript loaded successfully!');