// Initialize AOS (Animate On Scroll) - FASTER
AOS.init({
    duration: 600,
    easing: 'ease-in-out',
    once: true,
    mirror: false
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    const shapes = document.querySelectorAll('.shape');
    
    if (hero && heroContent) {
        const rate = scrolled * -0.3;
        heroContent.style.transform = `translateY(${rate}px)`;
        
        if (heroImage) {
            heroImage.style.transform = `translateY(${rate * 0.2}px)`;
        }
    }
    
    // Animate floating shapes
    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.3;
        shape.style.transform = `translateY(${scrolled * speed * 0.05}px)`;
    });
});

// Counter animation for stats - FIXED
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            if (target === 100) {
                element.textContent = '100%';
            } else {
                element.textContent = target;
            }
            clearInterval(timer);
        } else {
            if (target === 100) {
                element.textContent = Math.floor(start) + '%';
            } else {
                element.textContent = Math.floor(start);
            }
        }
    }, 16);
}

// Animate stats when they come into view - FIXED
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = stat.textContent;
                if (target === '∞') return; // Skip infinity symbol
                if (target === '100%') {
                    stat.textContent = '0%';
                    animateCounter(stat, 100, 1500);
                } else {
                    stat.textContent = '0';
                    animateCounter(stat, parseInt(target), 1500);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observe hero stats
const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// Typing animation for hero title - FIXED
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.textContent = '';
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when hero section is visible - FIXED
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const typingElement = entry.target.querySelector('.typing-text');
            if (typingElement) {
                // Устанавливаем правильный текст сразу
                typingElement.textContent = '';
                setTimeout(() => {
                    typeWriter(typingElement, 'Effortlessly', 100);
                }, 500);
            }
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.querySelector('.hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// Particle system for buttons
function createParticles(button) {
    const particles = button.querySelector('.btn-particles');
    if (!particles) return;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 50%;
            pointer-events: none;
            animation: particle-float 1s ease-out forwards;
        `;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 0.3 + 's';
        
        particles.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// Add particle effect to buttons
document.querySelectorAll('.btn-glow').forEach(button => {
    button.addEventListener('click', () => {
        createParticles(button);
    });
});

// Add CSS for particle animation
const particleCSS = `
    @keyframes particle-float {
        0% {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-50px) scale(0);
            opacity: 0;
        }
    }
`;

const style = document.createElement('style');
style.textContent = particleCSS;
document.head.appendChild(style);

// Simple hover effects for cards - REMOVED OVERLAY
document.querySelectorAll('.feature-card, .screenshot-card, .theme-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Scroll-triggered animations
const scrollAnimations = () => {
    const elements = document.querySelectorAll('.feature-card, .screenshot-card, .stat, .theme-card');
    
    elements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('animate-in');
        }
    });
};

window.addEventListener('scroll', scrollAnimations);

// Add CSS for scroll animations - FASTER
const scrollAnimationCSS = `
    .feature-card, .screenshot-card, .stat, .theme-card {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .feature-card.animate-in, .screenshot-card.animate-in, .stat.animate-in, .theme-card.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
`;

const scrollStyle = document.createElement('style');
scrollStyle.textContent = scrollAnimationCSS;
document.head.appendChild(scrollStyle);

// Ripple effect for buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect
const rippleCSS = `
    @keyframes ripple-animation {
        to {
            transform: scale(3);
            opacity: 0;
        }
    }
`;

const rippleStyle = document.createElement('style');
rippleStyle.textContent = rippleCSS;
document.head.appendChild(rippleStyle);

// Mobile menu toggle
function createMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelector('.nav-links');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (window.innerWidth <= 768 && navToggle) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Initialize mobile menu
window.addEventListener('resize', createMobileMenu);
createMobileMenu();

// Add CSS for mobile menu
const mobileMenuCSS = `
    @media (max-width: 768px) {
        .nav-links {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .nav-links.active {
            transform: translateY(0);
            opacity: 1;
        }
        
        .nav-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
    }
`;

const mobileStyle = document.createElement('style');
mobileStyle.textContent = mobileMenuCSS;
document.head.appendChild(mobileStyle);

// Smooth reveal animation for sections
const revealSections = () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const sectionVisible = 100;
        
        if (sectionTop < window.innerHeight - sectionVisible) {
            section.classList.add('revealed');
        }
    });
};

window.addEventListener('scroll', revealSections);

// Add CSS for section reveal - FASTER
const revealCSS = `
    section {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.5s ease;
    }
    
    section.revealed {
        opacity: 1;
        transform: translateY(0);
    }
`;

const revealStyle = document.createElement('style');
revealStyle.textContent = revealCSS;
document.head.appendChild(revealStyle);

// Initialize all animations
document.addEventListener('DOMContentLoaded', () => {
    // Trigger initial animations
    scrollAnimations();
    revealSections();
    
    // Add loading class to body
    document.body.classList.add('loaded');
});

// Add loading animation CSS
const loadingCSS = `
    body {
        opacity: 0;
        transition: opacity 0.5s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;

const loadingStyle = document.createElement('style');
loadingStyle.textContent = loadingCSS;
document.head.appendChild(loadingStyle);
