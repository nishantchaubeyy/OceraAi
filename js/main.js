/*===== OCEANAI PLATFORM JAVASCRIPT =====*/

// ===== GLOBAL VARIABLES =====
let navMenu, navToggle, navClose, header, scrollTop;
let chartInstance = null;

// ===== DOM CONTENT LOADED =====
document.addEventListener('DOMContentLoaded', function () {
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

    console.log('🌊 OceanAI Platform initialized successfully!');

    // Additional hamburger button check
    setTimeout(() => {
        const hamburger = document.getElementById('nav-toggle');
        if (hamburger) {
            console.log('Hamburger button element found:', hamburger);
            console.log('Hamburger button styles:', window.getComputedStyle(hamburger).display);
        } else {
            console.error('Hamburger button element NOT found!');
        }
    }, 1000);
});

// ===== NAVIGATION FUNCTIONALITY =====
function initNavigation() {
    navMenu = document.getElementById('nav-menu');
    navToggle = document.getElementById('nav-toggle');
    navClose = document.getElementById('nav-close');
    header = document.getElementById('header');

    // Mobile menu toggle with hamburger animation
    if (navToggle) {
        console.log('Hamburger button found and event listener added');
        navToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger button clicked');

            const isMenuOpen = navMenu.classList.contains('show-menu');
            console.log('Menu is currently:', isMenuOpen ? 'open' : 'closed');

            if (isMenuOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    } else {
        console.log('Hamburger button not found!');
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
        console.log('Opening menu');
        navMenu.classList.add('show-menu');
        navToggle.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        console.log('Closing menu');
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
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');

    // Check for saved theme preference or default to dark mode
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);

    // Update icon based on current theme
    updateThemeIcon(currentTheme, themeIcon);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);

        // Add smooth transition effect
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    });
}

function updateThemeIcon(theme, icon) {
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ===== SCROLL SPY FUNCTIONALITY =====
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
    let isScrolling = false;

    function updateActiveNavLink() {
        if (isScrolling) return; // Don't update during programmatic scrolling

        let current = 'home'; // Default to home
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;

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
    window.setScrollSpyActive = function (active) {
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
    document.addEventListener('touchmove', function (e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// ===== SCROLL EFFECTS =====
function initScrollEffects() {
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        // Header background change
        if (scrollY >= 50) {
            header.classList.add('scroll-header');
        } else {
            header.classList.remove('scroll-header');
        }

        // Show/hide scroll top button
        if (scrollTop) {
            if (scrollY >= 400) {
                scrollTop.classList.add('show-scroll');
            } else {
                scrollTop.classList.remove('show-scroll');
            }
        }

        // Parallax effect for hero section
        const hero = document.querySelector('.hero');
        if (hero) {
            const heroOffset = scrollY * 0.5;
            hero.style.transform = `translateY(${heroOffset}px)`;
        }

        // Update active navigation links
        updateActiveNavLink();
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
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNavLink() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 50;
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector('.nav__menu a[href*=' + sectionId + ']');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                if (navLink) {
                    document.querySelector('.nav__menu .active-link')?.classList.remove('active-link');
                    navLink.classList.add('active-link');
                }
            }
        });
    }

    // Make function globally accessible
    window.updateActiveNavLink = updateActiveNavLink;
}

// ===== ANIMATIONS AND INTERACTIONS =====
function initAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
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

    // Floating cards animation enhancement
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach((card, index) => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.05)';
            card.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.zIndex = '';
        });
    });

    // Platform cards hover effects
    const platformCards = document.querySelectorAll('.platform__card');
    platformCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
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

    contactForm.addEventListener('submit', function (e) {
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

    // Real-time validation
    const inputs = contactForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
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

function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type || field.tagName.toLowerCase();

    switch (fieldType) {
        case 'text':
            if (value.length < 2) {
                showFieldError(field, 'Name must be at least 2 characters');
                return false;
            }
            break;
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Please enter a valid email address');
                return false;
            }
            break;
        case 'select':
            if (!value) {
                showFieldError(field, 'Please select an option');
                return false;
            }
            break;
        case 'textarea':
            if (value.length < 10) {
                showFieldError(field, 'Message must be at least 10 characters');
                return false;
            }
            break;
    }

    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    const fieldElement = typeof field === 'string'
        ? document.querySelector(`input[type="${field}"], select, textarea`)
        : field;

    if (!fieldElement) return;

    clearFieldError(fieldElement);

    fieldElement.style.borderColor = '#ef4444';

    const errorDiv = document.createElement('div');
    errorDiv.className = 'form__error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ef4444;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    `;

    fieldElement.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    const fieldElement = typeof field === 'string'
        ? document.querySelector(`input[type="${field}"], select, textarea`)
        : field;

    if (!fieldElement) return;

    fieldElement.style.borderColor = '';
    const errorMsg = fieldElement.parentNode.querySelector('.form__error');
    if (errorMsg) {
        errorMsg.remove();
    }
}

function submitForm(formData) {
    const submitButton = document.querySelector('.contact__form button[type="submit"]');
    const originalText = submitButton.innerHTML;

    // Show loading state
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
        submitButton.style.background = '#10b981';

        // Show success message
        showNotification('Thank you! Your message has been sent successfully.', 'success');

        // Reset form
        setTimeout(() => {
            document.getElementById('contact-form').reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            submitButton.style.background = '';
        }, 2000);

    }, 2000);
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification__close">
            <i class="fas fa-times"></i>
        </button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: 'Inter', sans-serif;
    `;

    const closeBtn = notification.querySelector('.notification__close');
    closeBtn.style.cssText = `
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        margin-left: auto;
    `;

    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    });

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Add animation keyframes
    if (!document.querySelector('#notification-animations')) {
        const style = document.createElement('style');
        style.id = 'notification-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// ===== SMOOTH SCROLLING =====
document.addEventListener('click', function (e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 70;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }
});

// ===== PERFORMANCE OPTIMIZATION =====
// Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply throttling to scroll events
if (window.addEventListener) {
    const throttledScroll = throttle(() => {
        if (typeof updateActiveNavLink === 'function') {
            updateActiveNavLink();
        }
    }, 100);

    window.addEventListener('scroll', throttledScroll);
}

// ===== KEYBOARD ACCESSIBILITY =====
document.addEventListener('keydown', function (e) {
    // Close mobile menu with Escape key
    if (e.key === 'Escape' && navMenu && navMenu.classList.contains('show-menu')) {
        navMenu.classList.remove('show-menu');
        document.body.style.overflow = 'visible';
    }

    // Navigate with arrow keys in cards
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const focusedCard = document.activeElement;
        if (focusedCard && focusedCard.classList.contains('platform__card')) {
            const cards = [...document.querySelectorAll('.platform__card')];
            const currentIndex = cards.indexOf(focusedCard);

            let nextIndex;
            if (e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % cards.length;
            } else {
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
            }

            cards[nextIndex].focus();
            e.preventDefault();
        }
    }
});

// ===== LAZY LOADING =====
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function (e) {
    console.error('OceanAI Platform Error:', e.error);
    // You could send this to an error tracking service
});

// ===== SERVICE WORKER REGISTRATION =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js')
            .then(function (registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function (err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// ===== ANALYTICS =====
function trackEvent(category, action, label) {
    // Placeholder for analytics tracking
    console.log('Event tracked:', { category, action, label });

    // Example: Google Analytics
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', action, {
    //         event_category: category,
    //         event_label: label
    //     });
    // }
}

// Track button clicks
document.addEventListener('click', function (e) {
    if (e.target.matches('.btn, .card__link')) {
        const buttonText = e.target.textContent.trim();
        trackEvent('Button', 'Click', buttonText);
    }
});

// ===== EXPORT FOR TESTING =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initNavigation,
        initChart,
        validateForm,
        showNotification,
        throttle
    };
}/
    / ===== ENHANCED NAVIGATION MANAGEMENT =====
        function initActiveLinks() {
            // Handle all navigation links (both desktop and mobile)
            const allNavLinks = document.querySelectorAll('.nav__link[href^="#"]');

            allNavLinks.forEach(link => {
                // Remove existing event listeners to avoid duplicates
                link.removeEventListener('click', handleNavClick);
                link.addEventListener('click', handleNavClick);
            });

            function handleNavClick(e) {
                const link = e.currentTarget;
                const href = link.getAttribute('href');

                if (href.startsWith('#')) {
                    e.preventDefault();
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        // Update active state immediately for all matching links
                        updateAllActiveLinks(href);

                        // Disable scroll spy during programmatic scrolling
                        if (window.setScrollSpyActive) {
                            window.setScrollSpyActive(false);
                        }

                        // Smooth scroll to target
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
                    }
                }
            }

            function updateAllActiveLinks(activeHref) {
                allNavLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === activeHref) {
                        link.classList.add('active-link');
                    }
                });
            }
        }

// Initialize enhanced navigation on load
document.addEventListener('DOMContentLoaded', function () {
    // Small delay to ensure all elements are loaded
    setTimeout(initActiveLinks, 100);
});