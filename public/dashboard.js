// Dashboard JavaScript
class DashboardManager {
    constructor() {
        this.userData = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.setupUserMenu();
        this.setupEventListeners();
        this.hideLoading();
        this.updateKPIs();
    }

    checkAuthentication() {
        const token = localStorage.getItem('userToken');
        if (!token) {
            window.location.href = 'auth.html';
            return;
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            this.userData = JSON.parse(userData);
            this.updateUserInterface();
        }
    }

    updateUserInterface() {
        if (this.userData) {
            const userNameElement = document.getElementById('userName');
            const userEmailElement = document.getElementById('userEmail');
            
            if (userNameElement) {
                userNameElement.textContent = this.userData.displayName || this.userData.email?.split('@')[0] || 'User';
            }
            
            if (userEmailElement) {
                userEmailElement.textContent = this.userData.email || 'user@example.com';
            }
        }
    }

    setupUserMenu() {
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        const logoutButton = document.getElementById('logoutButton');

        if (userMenuButton && userDropdown) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const userMenu = userMenuButton.closest('.user-menu');
                userMenu.classList.toggle('open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const userMenu = userMenuButton.closest('.user-menu');
                if (!userMenu.contains(e.target)) {
                    userMenu.classList.remove('open');
                }
            });
        }

        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
    }

    setupEventListeners() {
        // Add click handlers for action cards
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Add click animation
                card.style.transform = 'translateY(-4px) scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            });
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const userMenu = document.querySelector('.user-menu');
                if (userMenu) {
                    userMenu.classList.remove('open');
                }
            }
        });
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

    updateKPIs() {
        // Simulate real-time data updates
        const kpiValues = document.querySelectorAll('.kpi-value');
        kpiValues.forEach((value, index) => {
            // Add subtle animation on load
            value.style.opacity = '0';
            value.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                value.style.transition = 'all 0.5s ease';
                value.style.opacity = '1';
                value.style.transform = 'translateY(0)';
            }, index * 100);
        });

        // Simulate periodic updates (in a real app, this would come from an API)
        this.simulateRealTimeUpdates();
    }

    simulateRealTimeUpdates() {
        setInterval(() => {
            // Randomly update one of the KPI changes
            const changes = document.querySelectorAll('.kpi-change');
            if (changes.length > 0) {
                const randomIndex = Math.floor(Math.random() * changes.length);
                const change = changes[randomIndex];
                
                // Add pulse animation
                change.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    change.style.animation = '';
                }, 500);
            }
        }, 30000); // Update every 30 seconds
    }

    handleLogout() {
        this.showToast('info', 'Logging out...', 'Please wait while we log you out');
        
        setTimeout(() => {
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            window.location.href = 'auth.html';
        }, 1000);
    }

    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
            </svg>`,
            error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>`,
            info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>`
        };

        toast.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <div style="flex-shrink: 0; margin-top: 0.125rem; color: var(--${type === 'info' ? 'primary' : type});">
                    ${iconMap[type]}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 0.25rem;">${title}</div>
                    <div style="font-size: 0.875rem; color: var(--muted-foreground);">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--muted-foreground); cursor: pointer; padding: 0.25rem; border-radius: 0.25rem;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => {
                    toast.remove();
                }, 300);
            }
        }, 5000);
    }
}

// Analytics and Performance Tracking
class AnalyticsManager {
    constructor() {
        this.sessionStartTime = Date.now();
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupUserInteractionTracking();
        this.setupPerformanceTracking();
    }

    trackPageView() {
        console.log('Dashboard page viewed', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        });
    }

    setupUserInteractionTracking() {
        // Track clicks on action cards
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const actionType = card.classList[1]; // e.g., 'upload', 'documents'
                console.log('Action card clicked', {
                    action: actionType,
                    timestamp: new Date().toISOString()
                });
            });
        });

        // Track KPI card interactions
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                console.log('KPI card hovered', {
                    kpi: card.querySelector('.kpi-title')?.textContent,
                    timestamp: new Date().toISOString()
                });
            });
        });
    }

    setupPerformanceTracking() {
        // Track page load performance
        window.addEventListener('load', () => {
            const loadTime = Date.now() - this.sessionStartTime;
            console.log('Dashboard load time', { loadTime: `${loadTime}ms` });
        });

        // Track time spent on page
        window.addEventListener('beforeunload', () => {
            const sessionDuration = Date.now() - this.sessionStartTime;
            console.log('Session duration', { duration: `${sessionDuration}ms` });
        });
    }
}

// Accessibility Enhancements
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Add keyboard navigation for action cards
        const actionCards = document.querySelectorAll('.action-card');
        actionCards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
            });
        });

        // Add keyboard navigation for user menu
        const userButton = document.getElementById('userMenuButton');
        if (userButton) {
            userButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    userButton.click();
                }
            });
        }
    }

    setupAriaLabels() {
        // Add ARIA labels to interactive elements
        const userButton = document.getElementById('userMenuButton');
        if (userButton) {
            userButton.setAttribute('aria-label', 'User menu');
            userButton.setAttribute('aria-expanded', 'false');
        }

        // Add ARIA labels to KPI cards
        document.querySelectorAll('.kpi-card').forEach(card => {
            const title = card.querySelector('.kpi-title')?.textContent;
            const value = card.querySelector('.kpi-value')?.textContent;
            if (title && value) {
                card.setAttribute('aria-label', `${title}: ${value}`);
            }
        });
    }

    setupFocusManagement() {
        // Manage focus for dropdown menu
        const userButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userButton && userDropdown) {
            userButton.addEventListener('click', () => {
                const isOpen = userButton.closest('.user-menu').classList.contains('open');
                userButton.setAttribute('aria-expanded', isOpen.toString());
                
                if (isOpen) {
                    // Focus first item in dropdown
                    const firstItem = userDropdown.querySelector('.dropdown-item');
                    if (firstItem) {
                        setTimeout(() => firstItem.focus(), 100);
                    }
                }
            });
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
    new AnalyticsManager();
    new AccessibilityManager();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }

    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* Focus styles for accessibility */
    .action-card:focus,
    .user-button:focus,
    .dropdown-item:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }

    /* Smooth transitions */
    .kpi-card,
    .action-card,
    .activity-item {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
        .kpi-card,
        .action-card,
        .activity-item,
        .loading-spinner {
            animation: none !important;
            transition: none !important;
        }
    }
`;
document.head.appendChild(style);