// ============================================
// food.js - Food Photography Module
// ============================================

class FoodPhotography {
    constructor() {
        this.agent = AI_AGENTS.food;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            image: null,
            category: '',
            style: '',
            composition: {},
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
        const steps = ['Upload', 'Style', 'Komposition', 'Setting', 'Review'];
        const indicator = document.getElementById('stepIndicator');
        if (indicator) {
            indicator.innerHTML = UIComponents.renderStepIndicator(steps, this.currentStep);
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        // Style cards
        document.querySelectorAll('.style-card[data-style]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.formData.style = e.currentTarget.dataset.style;
            });
        });

        // Variations
        document.getElementById('variationCount')?.addEventListener('change', (e) => {
            this.formData.variations = parseInt(e.target.value);
            this.updateCreditsDisplay();
        });
    }

    initializeImageUpload() {
        const uploadDiv = document.getElementById('imageUpload');
        if (uploadDiv) {
            uploadDiv.innerHTML = UIComponents.renderImageUpload('foodImage');
            
            document.getElementById('foodImage')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const validation = window.API.validateImageFile(file);
                    if (!validation.valid) {
                        UIComponents.showNotification(validation.error, 'error');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('foodImageImg').src = e.target.result;
                        document.getElementById('foodImagePlaceholder').style.display = 'none';
                        document.getElementById('foodImagePreview').style.display = 'flex';
                        document.getElementById('foodImageArea').classList.add('has-image');
                    };
                    reader.readAsDataURL(file);
                    this.formData.image = file;
                }
            });
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
                this.renderStepIndicator();
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.renderStepIndicator();
        }
    }

    showStep(step) {
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.querySelector(`[data-step="${step}"]`)?.classList.add('active');

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = step === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = step === this.totalSteps ? 'block' : 'none';

        if (step === this.totalSteps) this.updateReview();
    }

    validateCurrentStep() {
        // Basic validation
        return true;
    }

    updateReview() {
        const review = document.getElementById('summaryReview');
        if (review) {
            review.innerHTML = `
                <h3>Zusammenfassung</h3>
                <div class="summary-item">
                    <span class="summary-label">Kategorie:</span>
                    <span class="summary-value">${this.formData.category || 'N/A'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Style:</span>
                    <span class="summary-value">${this.formData.style || 'N/A'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Variationen:</span>
                    <span class="summary-value">${this.formData.variations}</span>
                </div>
            `;
        }
        this.updateCreditsDisplay();
    }

    updateCreditsDisplay() {
        const user = window.auth?.getUser();
        const credits = user?.profile?.credits || 0;
        const required = this.formData.variations * 1;

        document.getElementById('availableCredits').textContent = credits;
        document.getElementById('requiredCredits').textContent = required;

        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = credits < required;
            submitBtn.textContent = credits < required ? 'Nicht genug Credits' : '🚀 Bilder generieren';
        }
    }

    async submitForm() {
        try {
            UIComponents.showLoading(true);
            const base64 = await window.API.fileToBase64(this.formData.image);

            const submissionData = {
                user: window.auth?.getUser()?.email,
                projectType: 'food',
                image: base64,
                specifications: this.formData,
                credits_needed: this.formData.variations * 1,
                agent: 'food'
            };

            const result = await window.API.submitProject(submissionData);
            if (result.success) {
                UIComponents.showNotification('Food-Projekt erfolgreich erstellt!', 'success');
                setTimeout(() => window.location.href = '/dashboard.html', 2000);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            UIComponents.showNotification(error.message, 'error');
        } finally {
            UIComponents.showLoading(false);
        }
    }
}