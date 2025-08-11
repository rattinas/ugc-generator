// food.js - Food Photography Module

class FoodModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            productName: '',
            style: '',
            cameraAngle: '',
            presentation: '',
            effects: '',
            props: '',
            surface: '',
            lighting: '',
            colorPalette: '',
            season: '',
            additionalDetails: '',
            variations: 1
        };
    }

    init() {
        console.log('🍔 Initializing Food Module...');
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
    }

    checkDriveConfiguration() {
        const driveFolder = localStorage.getItem('drive_folder_link');
        if (!driveFolder) {
            if (confirm('Google Drive Ordner nicht konfiguriert. Jetzt einrichten?')) {
                window.location.href = '/dashboard.html';
            }
        }
    }

    setupEventListeners() {
        // Image Upload
        const uploadArea = document.getElementById('uploadArea');
        const imageFile = document.getElementById('imageFile');
        
        if (uploadArea && imageFile) {
            uploadArea.addEventListener('click', () => imageFile.click());
            imageFile.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Category selection
        document.getElementById('foodCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
            this.updateCategoryDefaults(e.target.value);
        });

        // Style cards
        document.querySelectorAll('.style-card[data-style]').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });

        // Navigation
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = window.API?.validateImageFile(file);
        if (!validation?.valid) {
            alert(validation?.error || 'Ungültiges Bild');
            return;
        }

        this.uploadedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
            if (previewImg) {
                previewImg.src = e.target.result;
                document.getElementById('uploadPlaceholder').style.display = 'none';
                document.getElementById('imagePreview').style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    selectStyle(card) {
        document.querySelectorAll('.style-card[data-style]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.style = card.dataset.style;

        // Adjust settings based on style
        this.updateStyleDefaults(card.dataset.style);
    }

    updateCategoryDefaults(category) {
        const defaults = {
            'dish': { angle: '45-degree', presentation: 'plated', lighting: 'natural' },
            'beverage': { angle: 'eye-level', effects: 'condensation', props: 'minimal' },
            'ingredients': { angle: 'overhead', presentation: 'ingredients', surface: 'wood' },
            'packaged': { angle: 'eye-level', presentation: 'lifestyle', lighting: 'studio' },
            'baked': { angle: '45-degree', effects: 'steam', lighting: 'warm' },
            'dessert': { angle: 'close-up', presentation: 'plated', props: 'minimal' }
        };

        const categoryDefaults = defaults[category];
        if (categoryDefaults) {
            // Apply defaults to form
            if (categoryDefaults.angle) {
                const angleSelect = document.getElementById('cameraAngle');
                if (angleSelect) angleSelect.value = categoryDefaults.angle;
            }
            if (categoryDefaults.presentation) {
                const presentationSelect = document.getElementById('presentation');
                if (presentationSelect) presentationSelect.value = categoryDefaults.presentation;
            }
        }
    }

    updateStyleDefaults(style) {
        const styleDefaults = {
            'restaurant': { surface: 'marble', lighting: 'warm', props: 'utensils' },
            'homemade': { surface: 'wood', lighting: 'natural', props: 'minimal' },
            'fastfood': { surface: 'white', lighting: 'bright', effects: 'sizzle' },
            'healthy': { surface: 'white', lighting: 'natural', colorPalette: 'vibrant' },
            'packaging': { surface: 'white', lighting: 'studio', props: 'none' },
            'action': { effects: 'steam', lighting: 'dramatic', presentation: 'process' }
        };

        const defaults = styleDefaults[style];
        if (defaults) {
            // Apply style-specific defaults
            Object.keys(defaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = defaults[key];
            });
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                
                if (this.currentStep === this.totalSteps) {
                    this.updateSummary();
                }
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    validateCurrentStep() {
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Food-Produkt hoch!');
                    return false;
                }
                this.formData.category = document.getElementById('foodCategory')?.value;
                this.formData.productName = document.getElementById('foodName')?.value;
                if (!this.formData.category) {
                    alert('Bitte wähle eine Food-Kategorie!');
                    return false;
                }
                return true;

            case 2:
                if (!this.formData.style) {
                    alert('Bitte wähle einen Food Style!');
                    return false;
                }
                return true;

            case 3:
                this.formData.cameraAngle = document.getElementById('cameraAngle')?.value;
                this.formData.presentation = document.getElementById('presentation')?.value;
                this.formData.effects = document.getElementById('effects')?.value;
                this.formData.props = document.getElementById('props')?.value;
                return true;

            case 4:
                this.formData.surface = document.getElementById('surface')?.value;
                this.formData.lighting = document.getElementById('lighting')?.value;
                this.formData.colorPalette = document.getElementById('colorPalette')?.value;
                this.formData.season = document.getElementById('season')?.value;
                return true;

            case 5:
                this.formData.additionalDetails = document.getElementById('additionalDetails')?.value;
                this.formData.variations = document.getElementById('variationCount')?.value;
                return true;

            default:
                return true;
        }
    }

    updateSummary() {
        const summaryContent = document.getElementById('summaryReview');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <h3>Zusammenfassung</h3>
                <div class="summary-item">
                    <span class="summary-label">Produkt:</span>
                    <span class="summary-value">${this.formData.productName || this.formData.category}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Style:</span>
                    <span class="summary-value">${this.formData.style}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Winkel:</span>
                    <span class="summary-value">${this.formData.cameraAngle}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Präsentation:</span>
                    <span class="summary-value">${this.formData.presentation}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Variationen:</span>
                    <span class="summary-value">${this.formData.variations}</span>
                </div>
            `;
        }
    }

    async submit() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Wird verarbeitet...';
        }

        try {
            // Upload image to get URL
            console.log('📤 Uploading food image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data
            const projectData = {
                projectType: 'food',
                imageUrl: this.formData.imageUrl, // Only URL
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
            };

            // Submit to API
            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Food-Bilder werden generiert und in Google Drive gespeichert.');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler');
            }

        } catch (error) {
            console.error('❌ Submit error:', error);
            alert('Fehler: ' + error.message);
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '🚀 Bilder generieren';
            }
        }
    }

    removeImage() {
        this.uploadedFile = null;
        this.formData.imageUrl = null;
        
        const imageFile = document.getElementById('imageFile');
        if (imageFile) imageFile.value = '';
        
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        if (imagePreview) imagePreview.style.display = 'none';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'food') {
        window.foodModule = new FoodModule();
        window.foodModule.init();
    }
});

// Export for global access
window.FoodModule = FoodModule;
