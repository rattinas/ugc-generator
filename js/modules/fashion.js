// fashion.js - Fashion Photography Module

class FashionModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.formData = {
            image: null,
            imageUrl: null,
            style: '',
            scene: '',
            model: {},
            styling: {},
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
        const steps = ['Upload', 'Style', 'Scene', 'Model', 'Review'];
        const indicator = document.getElementById('stepIndicator');
        if (indicator) {
            indicator.innerHTML = UIComponents.renderStepIndicator(steps, this.currentStep);
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitForm());

        // Style selection
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.formData.style = e.currentTarget.dataset.style;
            });
        });

        // Scene selection
        document.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', (e) => {
                document.querySelectorAll('.scene-card').forEach(c => c.classList.remove('selected'));
                e.currentTarget.classList.add('selected');
                this.formData.scene = e.currentTarget.dataset.scene;
            });
        });

        // Variation count
        document.getElementById('variationCount')?.addEventListener('change', (e) => {
            this.formData.variations = parseInt(e.target.value);
            this.updateCreditsDisplay();
        });
    }

    initializeImageUpload() {
        const uploadDiv = document.getElementById('imageUpload');
        if (uploadDiv) {
            uploadDiv.innerHTML = UIComponents.renderImageUpload('fashionImage');
            
            document.getElementById('fashionImage')?.addEventListener('change', async (e) => {
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
                        document.getElementById('fashionImageImg').src = e.target.result;
                        document.getElementById('fashionImagePlaceholder').style.display = 'none';
                        document.getElementById('fashionImagePreview').style.display = 'flex';
                        document.getElementById('fashionImageArea').classList.add('has-image');
                    };
                    reader.readAsDataURL(file);

                    // Store file
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
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(s => {
            s.classList.remove('active');
        });

        // Show current step
        document.querySelector(`[data-step="${step}"]`)?.classList.add('active');

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = step === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = step === this.totalSteps ? 'block' : 'none';

        // Update review if on last step
        if (step === this.totalSteps) {
            this.updateReview();
        }
    }

    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                if (!this.formData.image) {
                    UIComponents.showNotification('Bitte lade ein Bild hoch', 'error');
                    return false;
                }
                return true;
            case 2:
                if (!this.formData.style) {
                    UIComponents.showNotification('Bitte wähle einen Style', 'error');
                    return false;
                }
                return true;
            case 3:
                if (!this.formData.scene) {
                    UIComponents.showNotification('Bitte wähle eine Szene', 'error');
                    return false;
                }
                return true;
            case 4:
                // Collect model data
                this.formData.model = {
                    age: document.getElementById('modelAge')?.value,
                    gender: document.getElementById('modelGender')?.value,
                    ethnicity: document.getElementById('modelEthnicity')?.value,
                    body: document.getElementById('modelBody')?.value,
                    hair: document.getElementById('modelHair')?.value,
                    makeup: document.getElementById('modelMakeup')?.value,
                    expression: document.getElementById('modelExpression')?.value,
                    pose: document.getElementById('modelPose')?.value
                };
                return true;
            default:
                return true;
        }
    }

    updateReview() {
        const review = document.getElementById('summaryReview');
        if (review) {
            review.innerHTML = `
                <h3>Zusammenfassung</h3>
                <div class="summary-item">
                    <span class="summary-label">Style:</span>
                    <span class="summary-value">${this.formData.style || 'Nicht gewählt'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Szene:</span>
                    <span class="summary-value">${this.formData.scene || 'Nicht gewählt'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Model:</span>
                    <span class="summary-value">${this.formData.model.age || 'Standard'} / ${this.formData.model.gender || 'Diverse'}</span>
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
        const availableCredits = user?.profile?.credits || 0;
        const requiredCredits = this.formData.variations * 2; // Fashion uses 2 credits

        document.getElementById('availableCredits').textContent = availableCredits;
        document.getElementById('requiredCredits').textContent = requiredCredits;

        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = availableCredits < requiredCredits;
            if (availableCredits < requiredCredits) {
                submitBtn.textContent = 'Nicht genug Credits';
            } else {
                submitBtn.textContent = '🚀 Bilder generieren';
            }
        }
    }

    async submitForm() {
        try {
            UIComponents.showLoading(true);

            // Convert image to base64
            const base64 = await window.API.fileToBase64(this.formData.image);

            // Prepare submission data
            const submissionData = {
                user: window.auth?.getUser()?.email,
                projectType: 'fashion',
                image: base64,
                specifications: {
                    style: this.formData.style,
                    scene: this.formData.scene,
                    model: this.formData.model,
                    variations: this.formData.variations
                },
                credits_needed: this.formData.variations * 2
            };

            // Submit via API
            const result = await window.API.submitProject(submissionData);

            if (result.success) {
                // Save to database
                await window.db?.createProject({
                    name: `Fashion - ${this.formData.style}`,
                    type: 'fashion',
                    specifications: submissionData.specifications,
                    imageUrl: result.imageUrl,
                    credits_needed: submissionData.credits_needed
                });

                UIComponents.showNotification('Projekt erfolgreich erstellt! Bilder werden generiert...', 'success');
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('Submit error:', error);
            UIComponents.showNotification(error.message, 'error');
        } finally {
            UIComponents.showLoading(false);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const fashionModule = new FashionModule();
    fashionModule.init();
});