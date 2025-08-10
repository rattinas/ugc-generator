// beauty.js - Beauty Photography Module

class BeautyPhotography {
    constructor() {
        this.agent = AI_AGENTS.beauty;
        this.scenes = SCENES.beauty;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.beautyData = {
            image: null,
            imageUrl: null,
            category: '',
            shotType: '',
            model: {},
            scene: {},
            technical: {},
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
        const steps = ['Upload', 'Shot Type', 'Model', 'Setting', 'Review']; // Consider translating to German if needed: ['Upload', 'Aufnahmetyp', 'Model', 'Setting', 'Überprüfung']
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

        // Category selection
        document.getElementById('beautyCategory')?.addEventListener('change', (e) => {
            this.beautyData.category = e.target.value;
            this.updateCategoryOptions(e.target.value);
        });

        // Shot type selection
        document.querySelectorAll('.style-card[data-shot]').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.style-card[data-shot]').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.beautyData.shotType = e.currentTarget.dataset.shot;
            });
        });

        // Variation count
        document.getElementById('variationCount')?.addEventListener('change', (e) => {
            this.beautyData.variations = parseInt(e.target.value) || 1; // Fallback to 1 if invalid
            this.updateCreditsDisplay();
        });
    }

    initializeImageUpload() {
        const uploadDiv = document.getElementById('imageUpload');
        if (uploadDiv) {
            uploadDiv.innerHTML = UIComponents.renderImageUpload('beautyImage');
            
            document.getElementById('beautyImage')?.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const validation = window.API.validateImageFile(file);
                    if (!validation.valid) {
                        UIComponents.showNotification(validation.error, 'error');
                        return;
                    }

                    // Show preview
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('beautyImageImg').src = e.target.result;
                        document.getElementById('beautyImagePlaceholder').style.display = 'none';
                        document.getElementById('beautyImagePreview').style.display = 'flex';
                        document.getElementById('beautyImageArea').classList.add('has-image');
                    };
                    reader.readAsDataURL(file);

                    this.beautyData.image = file;
                }
            });
        }
    }

    updateCategoryOptions(category) {
        const shotTypeRecommendations = {
            makeup: ['application', 'result', 'texture', 'before-after'],
            skincare: ['application', 'texture', 'before-after', 'lifestyle'],
            haircare: ['before-after', 'application', 'result', 'lifestyle'],
            nails: ['application', 'result', 'macro', 'lifestyle'],
            fragrance: ['lifestyle', 'texture', 'macro'],
            tools: ['application', 'lifestyle', 'macro']
        };

        // Highlight recommended shot types
        const recommended = shotTypeRecommendations[category] || [];
        document.querySelectorAll('.style-card[data-shot]').forEach(card => {
            const shotType = card.dataset.shot;
            if (recommended.includes(shotType)) {
                card.classList.add('recommended');
            } else {
                card.classList.remove('recommended');
            }
        });
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
        document.querySelectorAll('.form-step').forEach(s => {
            s.classList.remove('active');
        });

        document.querySelector(`[data-step="${step}"]`)?.classList.add('active');

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = step === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = step === this.totalSteps ? 'block' : 'none';

        if (step === this.totalSteps) {
            this.updateReview();
        }
    }

    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                if (!this.beautyData.image || !this.beautyData.category) {
                    UIComponents.showNotification('Bitte Bild und Kategorie wählen', 'error');
                    return false;
                }
                return true;
            case 2:
                if (!this.beautyData.shotType) {
                    UIComponents.showNotification('Bitte Aufnahmetyp wählen', 'error');
                    return false;
                }
                return true;
            case 3:
                this.collectModelData();
                if (!this.beautyData.model.focusArea) { // Added validation for required field (assuming focusArea is mandatory)
                    UIComponents.showNotification('Bitte Fokus-Bereich wählen', 'error');
                    return false;
                }
                return true;
            case 4:
                this.collectSceneData();
                if (!this.beautyData.scene.location) { // Added validation for required field (assuming location is mandatory)
                    UIComponents.showNotification('Bitte Location wählen', 'error');
                    return false;
                }
                return true;
            default:
                return true;
        }
    }

    collectModelData() {
        this.beautyData.model = {
            focusArea: document.getElementById('focusArea')?.value || '',
            skinType: document.getElementById('skinType')?.value || '',
            skinTone: document.getElementById('skinTone')?.value || '',
            makeupLevel: document.getElementById('makeupLevel')?.value || '',
            age: document.getElementById('modelAge')?.value || '',
            skinFinish: document.getElementById('skinFinish')?.value || ''
        };
    }

    collectSceneData() {
        this.beautyData.scene = {
            location: document.getElementById('location')?.value || '',
            lighting: document.getElementById('lighting')?.value || '',
            mood: document.getElementById('mood')?.value || '',
            props: document.getElementById('props')?.value || '',
            special: document.getElementById('specialRequirements')?.value || ''
        };
    }

    updateReview() {
        const review = document.getElementById('summaryReview');
        if (review) {
            review.innerHTML = `
                <h3>Zusammenfassung</h3>
                <div class="summary-item">
                    <span class="summary-label">Kategorie:</span>
                    <span class="summary-value">${this.beautyData.category || 'Nicht angegeben'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Aufnahmetyp:</span> <!-- Fixed label to German for consistency -->
                    <span class="summary-value">${this.beautyData.shotType || 'Nicht angegeben'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Fokus:</span>
                    <span class="summary-value">${this.beautyData.model.focusArea || 'Nicht angegeben'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Setting:</span>
                    <span class="summary-value">${this.beautyData.scene.location || 'Nicht angegeben'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Variationen:</span>
                    <span class="summary-value">${this.beautyData.variations}</span>
                </div>
            `;
        }
        this.updateCreditsDisplay();
    }

    updateCreditsDisplay() {
        const user = window.auth?.getUser();
        const credits = user?.profile?.credits || 0;
        const required = this.beautyData.variations * 2;

        const availableElement = document.getElementById('availableCredits');
        if (availableElement) availableElement.textContent = credits;

        const requiredElement = document.getElementById('requiredCredits');
        if (requiredElement) requiredElement.textContent = required;

        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = credits < required;
            submitBtn.textContent = credits < required ? 'Nicht genug Credits' : '🚀 Bilder generieren';
        }
    }

    async submitForm() {
        try {
            UIComponents.showLoading(true);

            const base64 = await window.API.fileToBase64(this.beautyData.image);

            const submissionData = {
                user: window.auth?.getUser()?.email,
                projectType: 'beauty',
                image: base64,
                specifications: {
                    category: this.beautyData.category,
                    shotType: this.beautyData.shotType,
                    model: this.beautyData.model,
                    scene: this.beautyData.scene,
                    variations: this.beautyData.variations
                },
                credits_needed: this.beautyData.variations * 2,
                agent: 'beauty'
            };

            const result = await window.API.submitProject(submissionData);

            if (result.success) {
                UIComponents.showNotification('Beauty-Projekt erfolgreich erstellt!', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler');
            }

        } catch (error) {
            UIComponents.showNotification(error.message, 'error');
        } finally {
            UIComponents.showLoading(false);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'beauty') {
        const beautyPhoto = new BeautyPhotography();
        beautyPhoto.init();
    }
});