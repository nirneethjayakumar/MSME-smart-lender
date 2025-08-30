// Authentication JavaScript
class AuthManager {
    constructor() {
        this.currentTab = 'signin';
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupForms();
        this.checkExistingAuth();
    }

    setupTabs() {
        const tabTriggers = document.querySelectorAll('.tab-trigger');
        const tabContents = document.querySelectorAll('.tab-content');

        tabTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const tabId = trigger.dataset.tab;
                this.switchTab(tabId);
            });
        });
    }

    switchTab(tabId) {
        // Update triggers
        document.querySelectorAll('.tab-trigger').forEach(trigger => {
            trigger.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;
    }

    setupForms() {
        const signinForm = document.getElementById('signinForm');
        const signupForm = document.getElementById('signupForm');

        if (signinForm) {
            signinForm.addEventListener('submit', (e) => this.handleSignIn(e));
        }

        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignUp(e));
        }
    }

    async handleSignIn(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!this.validateEmail(email)) {
            this.showToast('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showToast('error', 'Invalid Password', 'Password must be at least 6 characters');
            return;
        }

        this.setLoading(submitBtn, true);

        try {
            // Simulate API call
            await this.simulateApiCall(1500);
            
            // Store user data (in real app, this would come from server)
            const userData = {
                email: email,
                displayName: email.split('@')[0],
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('userToken', 'fake-jwt-token');
            localStorage.setItem('userData', JSON.stringify(userData));
            
            this.showToast('success', 'Login Successful', 'Redirecting to dashboard...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            this.showToast('error', 'Login Failed', 'Invalid email or password');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    async handleSignUp(e) {
        e.preventDefault();
        
        const form = e.target;
        const email = form.email.value;
        const displayName = form.displayName.value;
        const businessName = form.businessName.value;
        const password = form.password.value;
        const submitBtn = form.querySelector('button[type="submit"]');

        if (!this.validateEmail(email)) {
            this.showToast('error', 'Invalid Email', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            this.showToast('error', 'Invalid Password', 'Password must be at least 6 characters');
            return;
        }

        this.setLoading(submitBtn, true);

        try {
            // Simulate API call
            await this.simulateApiCall(2000);
            
            // Store user data
            const userData = {
                email: email,
                displayName: displayName || email.split('@')[0],
                businessName: businessName || '',
                signupTime: new Date().toISOString()
            };
            
            localStorage.setItem('userToken', 'fake-jwt-token');
            localStorage.setItem('userData', JSON.stringify(userData));
            
            this.showToast('success', 'Account Created', 'Welcome! Redirecting to dashboard...');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } catch (error) {
            this.showToast('error', 'Sign Up Failed', 'Email might already be in use');
        } finally {
            this.setLoading(submitBtn, false);
        }
    }

    setLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    simulateApiCall(delay = 1000) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success most of the time
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, delay);
        });
    }

    checkExistingAuth() {
        const token = localStorage.getItem('userToken');
        if (token) {
            // User is already logged in, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
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
            </svg>`
        };

        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon ${type}">${iconMap[type]}</div>
                <div class="toast-message">
                    <div class="toast-title">${title}</div>
                    <div class="toast-description">${message}</div>
                </div>
            </div>
            <button class="toast-close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        // Add close functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }
}

// Form validation and UX enhancements
class FormEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupRealTimeValidation();
        this.setupPasswordToggle();
        this.setupFormAnimation();
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input[type="email"], input[type="password"]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    this.validateInput(input);
                }
            });
        });
    }

    validateInput(input) {
        const inputGroup = input.closest('.input-group');
        const type = input.type;
        const value = input.value;

        // Remove existing error state
        input.classList.remove('error');
        inputGroup.querySelector('.error-message')?.remove();

        let isValid = true;
        let errorMessage = '';

        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        if (type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                errorMessage = 'Password must be at least 6 characters';
            }
        }

        if (!isValid) {
            input.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = errorMessage;
            inputGroup.appendChild(errorDiv);
        }

        return isValid;
    }

    setupPasswordToggle() {
        const passwordInputs = document.querySelectorAll('input[type="password"]');
        
        passwordInputs.forEach(input => {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'password-toggle';
            toggleBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                </svg>
            `;
            
            const inputGroup = input.closest('.input-group');
            inputGroup.style.position = 'relative';
            inputGroup.appendChild(toggleBtn);
            
            toggleBtn.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                
                const eyeIcon = type === 'password' ? `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                ` : `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                `;
                toggleBtn.innerHTML = eyeIcon;
            });
        });
    }

    setupFormAnimation() {
        const forms = document.querySelectorAll('.auth-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const button = form.querySelector('button[type="submit"]');
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);
            });
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
    new FormEnhancer();
});

// Add additional CSS for form validation
const style = document.createElement('style');
style.textContent = `
    .input-group input.error {
        border-color: var(--destructive);
        box-shadow: 0 0 0 2px rgba(220, 38, 127, 0.2);
    }

    .error-message {
        font-size: 0.75rem;
        color: var(--destructive);
        margin-top: 0.25rem;
    }

    .password-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--muted-foreground);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: color 0.2s ease;
    }

    .password-toggle:hover {
        color: var(--foreground);
    }

    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);