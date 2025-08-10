// main.js - Main Application Logic

class Application {
    constructor() {
        this.initialized = false;
        this.modules = {};
        this.currentModule = null;
    }

    async init() {
        if (this.initialized) return;
        
        try {
            // Initialize core services
            await this.initializeServices();
            
            // Setup global event handlers
            this.setupGlobalHandlers();
            
            // Load current module if on module page
            this.loadCurrentModule();
            
            this.initialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.handleInitError(error);
        }
    }

    async initializeServices() {
        // Services are initialized in their respective files
        // This is just for coordination
        if (!window.auth) {
            throw new Error('Auth service not initialized');
        }
        
        if (!window.API) {
            throw new Error('API service not initialized');
        }
        
        if (!window.UIComponents) {
            throw new Error('UI Components not initialized');
        }
    }

    setupGlobalHandlers() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.handleError(e.error);
        });

        // Handle network status
        window.addEventListener('online', () => {
            UIComponents.showNotification('Verbindung wiederhergestellt', 'success');
        });

        window.addEventListener('offline', () => {
            UIComponents.showNotification('Keine Internetverbindung', 'error');
        });

        // Handle file uploads globally
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                this.handleFileSelect(e);
            }
        });

        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = window.API.validateImageFile(file);
        if (!validation.valid) {
            UIComponents.showNotification(validation.error, 'error');
            event.target.value = '';
            return;
        }

        // Show preview if preview element exists
        const inputId = event.target.id;
        const previewId = `${inputId}Preview`;
        const imgId = `${inputId}Img`;
        const placeholderId = `${inputId}Placeholder`;
        const areaId = `${inputId}Area`;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.getElementById(imgId);
            const preview = document.getElementById(previewId);
            const placeholder = document.getElementById(placeholderId);
            const area = document.getElementById(areaId);

            if (img && preview && placeholder && area) {
                img.src = e.target.result;
                placeholder.style.display = 'none';
                preview.style.display = 'flex';
                area.classList.add('has-image');
            }
        };
        reader.readAsDataURL(file);
    }

    loadCurrentModule() {
        const page = document.body.dataset.page;
        if (!page) return;

        // Module-specific initialization is handled by module files
        console.log(`Loading module: ${page}`);
        this.currentModule = page;
    }

    hasUnsavedChanges() {
        // Check if any form has unsaved changes
        const forms = document.querySelectorAll('form');
        for (let form of forms) {
            if (form.dataset.hasChanges === 'true') {
                return true;
            }
        }
        return false;
    }

    handleError(error) {
        // Log to console
        console.error('Application error:', error);

        // Show user-friendly message
        let message = 'Ein Fehler ist aufgetreten';
        
        if (error.message) {
            if (error.message.includes('network')) {
                message = 'Netzwerkfehler. Bitte überprüfe deine Verbindung.';
            } else if (error.message.includes('auth')) {
                message = 'Authentifizierungsfehler. Bitte melde dich erneut an.';
            } else if (error.message.includes('credits')) {
                message = 'Nicht genügend Credits verfügbar.';
            }
        }

        UIComponents.showNotification(message, 'error');
    }

    handleInitError(error) {
        // Critical initialization error
        const errorContainer = document.createElement('div');
        errorContainer.className = 'init-error';
        errorContainer.innerHTML = `
            <div class="error-content">
                <h2>Initialisierungsfehler</h2>
                <p>Die Anwendung konnte nicht geladen werden.</p>
                <p class="error-detail">${error.message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Neu laden
                </button>
            </div>
        `;
        document.body.appendChild(errorContainer);
    }

    // Utility methods
    static async checkCredits(required = 1) {
        const user = window.auth?.getUser();
        const credits = user?.profile?.credits || 0;
        
        if (credits < required) {
            const proceed = confirm(`Du benötigst ${required} Credits. Du hast nur ${credits}. Möchtest du Credits kaufen?`);
            if (proceed) {
                window.location.href = '/pages/billing.html';
            }
            return false;
        }
        return true;
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static debounce(func, wait) {
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

    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            UIComponents.showNotification('In Zwischenablage kopiert', 'success');
        } catch (err) {
            UIComponents.showNotification('Kopieren fehlgeschlagen', 'error');
        }
    }

    static generateProjectName(type, style) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `${type}-${style}-${timestamp}`;
    }

    static async downloadImage(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename || 'image.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            UIComponents.showNotification('Download fehlgeschlagen', 'error');
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    window.app = new Application();
    await window.app.init();
});

// Export utilities
window.AppUtils = {
    checkCredits: Application.checkCredits,
    formatDate: Application.formatDate,
    debounce: Application.debounce,
    copyToClipboard: Application.copyToClipboard,
    generateProjectName: Application.generateProjectName,
    downloadImage: Application.downloadImage
};