// ============================================
// jewelry.js - Jewelry Photography Module
// ============================================

class JewelryPhotography {
    constructor() {
        this.agent = AI_AGENTS.jewelry;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            image: null,
            category: '',
            style: '',
            technical: {},
            model: {},
            variations: 1
        };
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.renderHeader();
        this.renderStepIndicator();
        this.initializeImageUpload();
    }

    async checkAuth() {
        if (!window.auth || !await window.auth.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    renderHeader() {
        const user = window.auth?.getUser();
        const header = document.getElementById('mainHeader');
        if (header) {
            header.innerHTML = UIComponents.renderHeader(user);
        }
    }

    renderStepIndicator() {
        const steps = ['Upload', 'Style', 'Technisch', 'Model', 'Review'];
        const indicator = document.getElementById('stepIndicator');
        if (indicator) {
            indicator.innerHTML = UIComponents.renderStepIndicator(steps, this.currentStep);
        }
    }

    setupEventListeners() {
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        document.querySelectorAll('.style-card[data-style]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.formData.style = e.currentTarget.dataset.style;
            });
        });

        document.getElementById('variationCount')?.addEventListener('change', (e) => {
            this.formData.variations = parseInt(e.target.value);
            this.updateCreditsDisplay();
        });
    }

    initializeImageUpload() {
        const uploadDiv = document.getElementById('imageUpload');
        if (uploadDiv) {
            uploadDiv.innerHTML = UIComponents.renderImageUpload('jewelryImage');
            
            document.getElementById('jewelryImage')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const validation = window.API.validateImageFile(file);
                    if (!validation.valid) {
                        UIComponents.showNotification(validation.error, 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('jewelryImageImg').src = e.target.result;
                        document.getElementById('jewelryImagePlaceholder').style.display = 'none';
                        document.getElementById('jewelryImagePreview').style.display = 'flex';
                        document.getElementById('jewelryImageArea').classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                    this.formData.image = file;
                }
            });
        }
    }

    // Similar methods as above...
    nextStep() { /* same logic */ }
    prevStep() { /* same logic */ }
    showStep(step) { /* same logic */ }
    validateCurrentStep() { return true; }
    updateReview() { /* same logic */ }
    updateCreditsDisplay() { /* same logic with 2 credits */ }
    async submitForm() { /* same logic */ }
}

// ============================================
// sports.js - Sports Photography Module
// ============================================

class SportsPhotography {
    constructor() {
        this.agent = AI_AGENTS.sports;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            image: null,
            category: '',
            action: '',
            athlete: {},
            environment: {},
            variations: 1
        };
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.renderHeader();
        this.renderStepIndicator();
        this.initializeImageUpload();
    }

    async checkAuth() {
        if (!window.auth || !await window.auth.isAuthenticated()) {
            window.location.href = '/';
            return false;
        }
        return true;
    }

    renderHeader() {
        const user = window.auth?.getUser();
        const header = document.getElementById('mainHeader');
        if (header) {
            header.innerHTML = UIComponents.renderHeader(user);
        }
    }

    renderStepIndicator() {
        const steps = ['Upload', 'Action', 'Athlet', 'Umgebung', 'Review'];
        const indicator = document.getElementById('stepIndicator');
        if (indicator) {
            indicator.innerHTML = UIComponents.renderStepIndicator(steps, this.currentStep);
        }
    }

    setupEventListeners() {
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        document.querySelectorAll('.style-card[data-action]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.formData.action = e.currentTarget.dataset.action;
            });
        });

        document.getElementById('variationCount')?.addEventListener('change', (e) => {
            this.formData.variations = parseInt(e.target.value);
            this.updateCreditsDisplay();
        });
    }

    initializeImageUpload() {
        const uploadDiv = document.getElementById('imageUpload');
        if (uploadDiv) {
            uploadDiv.innerHTML = UIComponents.renderImageUpload('sportsImage');
            
            document.getElementById('sportsImage')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const validation = window.API.validateImageFile(file);
                    if (!validation.valid) {
                        UIComponents.showNotification(validation.error, 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('sportsImageImg').src = e.target.result;
                        document.getElementById('sportsImagePlaceholder').style.display = 'none';
                        document.getElementById('sportsImagePreview').style.display = 'flex';
                        document.getElementById('sportsImageArea').classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                    this.formData.image = file;
                }
            });
        }
    }

    // Similar methods as above...
    nextStep() { /* same logic */ }
    prevStep() { /* same logic */ }
    showStep(step) { /* same logic */ }
    validateCurrentStep() { return true; }
    updateReview() { /* same logic */ }
    updateCreditsDisplay() { /* same logic with 2 credits */ }
    async submitForm() { /* same logic */ }
}

// Initialize modules based on page
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    
    if (page === 'food') {
        const foodModule = new FoodPhotography();
        foodModule.init();
    } else if (page === 'jewelry') {
        const jewelryModule = new JewelryPhotography();
        jewelryModule.init();
    } else if (page === 'sports') {
        const sportsModule = new SportsPhotography();
        sportsModule.init();
    }
});