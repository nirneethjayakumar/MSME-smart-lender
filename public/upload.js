// Upload Page JavaScript
class UploadManager {
    constructor() {
        this.files = [];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.loadUserData();
        this.setupUserMenu();
        this.setupUploadZone();
        this.setupEventListeners();
        this.hideLoading();
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
            const userEmailElement = document.getElementById('userEmail');
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

    setupUploadZone() {
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const uploadButton = document.getElementById('uploadButton');

        if (uploadZone && fileInput && uploadButton) {
            // Click to upload
            uploadZone.addEventListener('click', () => fileInput.click());
            uploadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            // File input change
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(Array.from(e.target.files));
            });

            // Drag and drop
            uploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadZone.classList.add('dragover');
            });

            uploadZone.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
            });

            uploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadZone.classList.remove('dragover');
                this.handleFiles(Array.from(e.dataTransfer.files));
            });
        }
    }

    setupEventListeners() {
        const processButton = document.getElementById('processButton');
        const clearButton = document.getElementById('clearButton');
        const uploadMoreButton = document.getElementById('uploadMoreButton');

        if (processButton) {
            processButton.addEventListener('click', () => this.processFiles());
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => this.clearFiles());
        }

        if (uploadMoreButton) {
            uploadMoreButton.addEventListener('click', () => this.resetUpload());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const userMenu = document.querySelector('.user-menu');
                if (userMenu) {
                    userMenu.classList.remove('open');
                }
            }
        });
    }

    handleFiles(newFiles) {
        const validFiles = [];
        const errors = [];

        newFiles.forEach(file => {
            // Check file type
            if (!this.allowedTypes.includes(file.type)) {
                errors.push(`${file.name}: Unsupported file type`);
                return;
            }

            // Check file size
            if (file.size > this.maxFileSize) {
                errors.push(`${file.name}: File too large (max 10MB)`);
                return;
            }

            // Check if file already exists
            const exists = this.files.find(f => f.name === file.name && f.size === file.size);
            if (exists) {
                errors.push(`${file.name}: File already added`);
                return;
            }

            validFiles.push(file);
        });

        // Show errors
        if (errors.length > 0) {
            this.showToast('error', 'Upload Errors', errors.join('\\n'));
        }

        // Add valid files
        if (validFiles.length > 0) {
            this.files.push(...validFiles);
            this.updateFileList();
            this.showToast('success', 'Files Added', `${validFiles.length} file(s) added successfully`);
        }
    }

    updateFileList() {
        const fileListSection = document.getElementById('fileListSection');
        const fileList = document.getElementById('fileList');
        const processButton = document.getElementById('processButton');

        if (this.files.length === 0) {
            fileListSection.style.display = 'none';
            return;
        }

        fileListSection.style.display = 'block';
        fileList.innerHTML = '';

        this.files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">
                        ${this.getFileIcon(file)}
                    </div>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-remove" onclick="uploadManager.removeFile(${index})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="m19,6 v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
                        </svg>
                    </button>
                </div>
            `;
            fileList.appendChild(fileItem);
        });

        // Update process button state
        if (processButton) {
            processButton.disabled = this.files.length === 0;
        }
    }

    getFileIcon(file) {
        if (file.type === 'application/pdf') {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
            </svg>`;
        } else {
            return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>`;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeFile(index) {
        this.files.splice(index, 1);
        this.updateFileList();
        this.showToast('info', 'File Removed', 'File removed from upload queue');
    }

    clearFiles() {
        this.files = [];
        this.updateFileList();
        this.showToast('info', 'Files Cleared', 'All files removed from upload queue');
    }

    async processFiles() {
        if (this.files.length === 0) return;

        this.showProcessingSection();
        
        try {
            await this.simulateProcessing();
            this.showResults();
        } catch (error) {
            this.showToast('error', 'Processing Failed', 'An error occurred while processing your files');
            this.hideProcessingSection();
        }
    }

    showProcessingSection() {
        const fileListSection = document.getElementById('fileListSection');
        const processingSection = document.getElementById('processingSection');
        
        fileListSection.style.display = 'none';
        processingSection.style.display = 'block';
    }

    hideProcessingSection() {
        const processingSection = document.getElementById('processingSection');
        processingSection.style.display = 'none';
    }

    async simulateProcessing() {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const processingDescription = document.getElementById('processingDescription');

        const steps = [
            'फ़ाइलें अपलोड की जा रही हैं... / Uploading files...',
            'दस्तावेज़ों को स्कैन किया जा रहा है... / Scanning documents...',
            'टेक्स्ट निकाला जा रहा है... / Extracting text...',
            'डेटा का विश्लेषण किया जा रहा है... / Analyzing data...',
            'परिणाम तैयार किए जा रहे हैं... / Preparing results...'
        ];

        for (let i = 0; i <= 100; i += 2) {
            const stepIndex = Math.floor((i / 100) * steps.length);
            const step = steps[Math.min(stepIndex, steps.length - 1)];

            progressFill.style.width = `${i}%`;
            progressText.textContent = `${i}%`;
            processingDescription.textContent = step;

            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    showResults() {
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        const resultsContent = document.getElementById('resultsContent');

        processingSection.style.display = 'none';
        resultsSection.style.display = 'block';

        // Generate mock results
        const results = this.generateMockResults();
        resultsContent.innerHTML = results;

        this.showToast('success', 'Processing Complete', 'Your documents have been analyzed successfully');
    }

    generateMockResults() {
        const processedFiles = this.files.length;
        const extractedPages = this.files.length * 3; // Assume 3 pages per file on average
        
        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--muted); padding: 1rem; border-radius: var(--radius); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">${processedFiles}</div>
                    <div style="font-size: 0.875rem; color: var(--muted-foreground);">फ़ाइलें प्रोसेस की गईं</div>
                </div>
                <div style="background: var(--muted); padding: 1rem; border-radius: var(--radius); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--success); margin-bottom: 0.5rem;">${extractedPages}</div>
                    <div style="font-size: 0.875rem; color: var(--muted-foreground);">पेज स्कैन किए गए</div>
                </div>
                <div style="background: var(--muted); padding: 1rem; border-radius: var(--radius); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--warning); margin-bottom: 0.5rem;">95%</div>
                    <div style="font-size: 0.875rem; color: var(--muted-foreground);">सटीकता दर</div>
                </div>
            </div>
            <div style="background: var(--muted); padding: 1.5rem; border-radius: var(--radius);">
                <h4 style="margin: 0 0 1rem 0; color: var(--foreground);">निकाले गए डेटा का सारांश / Extracted Data Summary</h4>
                <ul style="margin: 0; padding-left: 1.5rem; color: var(--muted-foreground);">
                    <li>कुल लेनदेन / Total Transactions: ${Math.floor(Math.random() * 50 + 20)}</li>
                    <li>राजस्व प्रविष्टियां / Revenue Entries: ${Math.floor(Math.random() * 30 + 10)}</li>
                    <li>व्यय प्रविष्टियां / Expense Entries: ${Math.floor(Math.random() * 25 + 8)}</li>
                    <li>पहचाने गए ग्राहक / Identified Customers: ${Math.floor(Math.random() * 15 + 5)}</li>
                </ul>
            </div>
        `;
    }

    resetUpload() {
        const fileListSection = document.getElementById('fileListSection');
        const processingSection = document.getElementById('processingSection');
        const resultsSection = document.getElementById('resultsSection');
        const fileInput = document.getElementById('fileInput');

        this.files = [];
        fileListSection.style.display = 'none';
        processingSection.style.display = 'none';
        resultsSection.style.display = 'none';
        
        if (fileInput) {
            fileInput.value = '';
        }

        this.showToast('info', 'Upload Reset', 'Ready for new file upload');
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            setTimeout(() => {
                loading.classList.add('hidden');
                setTimeout(() => {
                    loading.style.display = 'none';
                }, 300);
            }, 500);
        }
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
                    <div style="font-size: 0.875rem; color: var(--muted-foreground); white-space: pre-line;">${message}</div>
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

// Global variable for access from HTML
let uploadManager;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    uploadManager = new UploadManager();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    /* Focus styles for accessibility */
    .upload-zone:focus,
    .upload-button:focus,
    .btn:focus,
    .file-remove:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }

    /* Smooth transitions */
    .upload-zone,
    .document-type,
    .file-item {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* File drop animation */
    .upload-zone.dragover {
        transform: scale(1.02);
    }

    /* Reduced motion for accessibility */
    @media (prefers-reduced-motion: reduce) {
        .upload-zone,
        .document-type,
        .file-item,
        .processing-spinner {
            animation: none !important;
            transition: none !important;
        }
    }
`;
document.head.appendChild(style);