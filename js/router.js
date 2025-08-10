// router.js - Navigation & Routing System

class Router {
    constructor() {
        this.routes = {
            '/': 'index.html',
            '/dashboard': 'dashboard.html',
            '/fashion': 'pages/fashion.html',
            '/product': 'pages/product.html',
            '/beauty': 'pages/beauty.html',
            '/food': 'pages/food.html',
            '/jewelry': 'pages/jewelry.html',
            '/sports': 'pages/sports.html'
        };
        
        this.currentPage = null;
        this.init();
    }

    init() {
        // Get current page from URL
        this.currentPage = this.getCurrentPage();
        
        // Setup navigation event listeners
        this.setupNavigation();
        
        // Check authentication for protected routes
        this.checkRouteProtection();
    }

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    async checkRouteProtection() {
        const publicPages = ['index', 'login'];
        const currentPage = this.getCurrentPage();
        
        if (!publicPages.includes(currentPage)) {
            // Protected route - check authentication
            if (window.auth && !await window.auth.isAuthenticated()) {
                window.location.href = '/';
            }
        }
    }

    setupNavigation() {
        // Add click handlers to all navigation links
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-navigate]')) {
                e.preventDefault();
                const destination = e.target.dataset.navigate;
                this.navigate(destination);
            }
        });
    }

    navigate(destination) {
        if (destination.startsWith('http')) {
            // External link
            window.open(destination, '_blank');
        } else {
            // Internal navigation
            window.location.href = destination;
        }
    }

    // Navigation helpers
    static goToDashboard() {
        window.location.href = '/dashboard.html';
    }

    static goToLogin() {
        window.location.href = '/';
    }

    static goToModule(module) {
        window.location.href = `/pages/${module}.html`;
    }

    static goBack() {
        window.history.back();
    }
}

// Initialize router
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});