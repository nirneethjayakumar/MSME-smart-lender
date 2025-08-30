// Main JavaScript for Index Page
class LanguageManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.init();
    }

    init() {
        const languageSwitch = document.getElementById('languageSwitch');
        if (languageSwitch) {
            languageSwitch.checked = this.currentLanguage === 'hi';
            languageSwitch.addEventListener('change', () => this.toggleLanguage());
        }
        this.updateContent();
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'en' ? 'hi' : 'en';
        localStorage.setItem('language', this.currentLanguage);
        this.updateContent();
    }

    updateContent() {
        // Update text content based on language
        const content = {
            en: {
                title: "व्यापारी क्रेडिट जीनी",
                subtitle: "MSME Credit Solutions",
                description: "Transform your handwritten ledgers, bills and invoices into digital format.\nGet AI-powered financial analysis and become credit-ready.",
                ctaButton: "शुरू करें / Get Started",
                ctaTitle: "आज ही शुरू करें / Start Today",
                ctaDescription: "Sign up in minutes and begin your business financial journey.",
                ctaButtonFree: "मुफ्त में शुरू करें / Start Free"
            },
            hi: {
                title: "व्यापारी क्रेडिट जीनी",
                subtitle: "एमएसएमई क्रेडिट समाधान",
                description: "अपनी हस्तलिखित खाता बही, बिल और चालान को डिजिटल में बदलें।\nAI की मदद से वित्तीय विश्लेषण प्राप्त करें और क्रेडिट के लिए तैयार हों।",
                ctaButton: "शुरू करें",
                ctaTitle: "आज ही शुरू करें",
                ctaDescription: "मिनटों में साइन अप करें और अपने व्यापार की वित्तीय यात्रा शुरू करें।",
                ctaButtonFree: "मुफ्त में शुरू करें"
            }
        };

        // Note: For this static version, we keep bilingual content visible
        // In a dynamic app, you would show/hide content based on language
    }
}

// Page Loading Manager
class PageManager {
    constructor() {
        this.init();
    }

    init() {
        this.hideLoading();
        this.setupAnimations();
        this.setupScrollEffects();
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 300);
            }, 1000);
        }
    }

    setupAnimations() {
        // Add stagger animation to feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in-up');
        });
    }

    setupScrollEffects() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-visible');
                }
            });
        }, observerOptions);

        // Observe all feature cards and CTA section
        document.querySelectorAll('.feature-card, .cta-section').forEach(el => {
            observer.observe(el);
        });
    }
}

// Utility Functions
class Utils {
    static redirect(url) {
        window.location.href = url;
    }

    static isAuthenticated() {
        // Check if user is logged in (placeholder for actual auth check)
        return localStorage.getItem('userToken') !== null;
    }

    static redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            this.redirect('dashboard.html');
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
    new PageManager();
    
    // Check authentication and redirect if needed
    Utils.redirectIfAuthenticated();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in-up {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeInUp 0.6s ease-out forwards;
    }

    .animate-visible {
        opacity: 1;
        transform: translateY(0);
    }

    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Smooth scroll behavior */
    html {
        scroll-behavior: smooth;
    }

    /* Focus styles for accessibility */
    .btn:focus,
    .switch input:focus + .slider {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);
