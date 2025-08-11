// jewelry.js - Jewelry Photography Module

class JewelryModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            productName: '',
            material: '',
            style: '',
            focus: '',
            lighting: '',
            background: '',
            reflections: '',
            modelVisibility: '',
            styling: '',
            handStyling: '',
            props: '',
            additionalDetails: '',
            variations: 1
        };
    }

    init() {
        console.log('💎 Initializing Jewelry Module...');
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

        // Category and Material selection
        document.getElementById('jewelryCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
            this.updateCategoryDefaults(e.target.value);
        });

        document.getElementById('material')?.addEventListener('change', (e) => {
            this.formData.material = e.target.value;
            this.updateMaterialSettings(e.target.value);
        });

        // Style cards
        document.querySelectorAll('.style-card[data-style]').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });

        // Model visibility change
        document.getElementById('modelVisibility')?.addEventListener('change', (e) => {
            this.updateModelOptions(e.target.value);
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
            'ring': { focus: 'gemstone', background: 'black', reflections: 'enhanced' },
            'necklace': { focus: 'overall', modelVisibility: 'neck-area', background: 'gradient' },
            'bracelet': { focus: 'overall', modelVisibility: 'hands-only', lighting: 'soft' },
            'earrings': { focus: 'detail', modelVisibility: 'partial', background: 'white' },
            'watch': { focus: 'mechanism', lighting: 'studio', reflections: 'controlled' },
            'brooch': { focus: 'craftsmanship', background: 'velvet', lighting: 'dramatic' }
        };

        const categoryDefaults = defaults[category];
        if (categoryDefaults) {
            Object.keys(categoryDefaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = categoryDefaults[key];
            });
        }
    }

    updateMaterialSettings(material) {
        const materialSettings = {
            'gold': { lighting: 'warm', reflections: 'enhanced', background: 'black' },
            'silver': { lighting: 'cool', reflections: 'controlled', background: 'gradient' },
            'platinum': { lighting: 'studio', reflections: 'minimal', background: 'white' },
            'diamond': { lighting: 'sparkle', reflections: 'enhanced', focus: 'gemstone' },
            'gemstone': { lighting: 'dramatic', background: 'black', focus: 'gemstone' },
            'pearl': { lighting: 'soft', reflections: 'minimal', background: 'gradient' }
        };

        const settings = materialSettings[material];
        if (settings) {
            Object.keys(settings).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = settings[key];
            });
        }
    }

    updateStyleDefaults(style) {
        const styleDefaults = {
            'hero': { background: 'gradient', lighting: 'studio', modelVisibility: 'none' },
            'worn': { modelVisibility: 'partial', styling: 'elegant', lighting: 'natural' },
            'macro': { focus: 'detail', background: 'black', lighting: 'dramatic' },
            'lifestyle': { modelVisibility: 'full', styling: 'formal', props: 'champagne' },
            'display': { props: 'box', background: 'velvet', lighting: 'soft' },
            'collection': { background: 'white', lighting: 'studio', props: 'none' }
        };

        const defaults = styleDefaults[style];
        if (defaults) {
            Object.keys(defaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = defaults[key];
            });
        }
    }

    updateModelOptions(visibility) {
        const handStyling = document.getElementById('handStyling');
        const styling = document.getElementById('styling');
        
        if (visibility === 'none') {
            if (handStyling) handStyling.closest('.form-group').style.display = 'none';
            if (styling) styling.closest('.form-group').style.display = 'none';
        } else {
            if (handStyling) handStyling.closest('.form-group').style.display = 'block';
            if (styling) styling.closest('.form-group').style.display = 'block';
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
                    alert('Bitte lade ein Schmuckstück hoch!');
                    return false;
                }
                this.formData.category = document.getElementById('jewelryCategory')?.value;
                this.formData.productName = document.getElementById('jewelryName')?.value;
                this.formData.material = document.getElementById('material')?.value;
                if (!this.formData.category) {
                    alert('Bitte wähle eine Schmuck-Kategorie!');
                    return false;
                }
                return true;

            case 2:
                if (!this.formData.style) {
                    alert('Bitte wähle einen Präsentationsstil!');
                    return false;
                }
                return true;

            case 3:
                this.formData.focus = document.getElementById('focus')?.value;
                this.formData.lighting = document.getElementById('lighting')?.value;
                this.formData.background = document.getElementById('background')?.value;
                this.formData.reflections = document.getElementById('reflections')?.value;
                return true;

            case 4:
                this.formData.modelVisibility = document.getElementById('modelVisibility')?.value;
                this.formData.styling = document.getElementById('styling')?.value;
                this.formData.handStyling = document.getElementById('handStyling')?.value;
                this.formData.props = document.getElementById('props')?.value;
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
                    <span class="summary-label">Schmuckstück:</span>
                    <span class="summary-value">${this.formData.productName || this.formData.category}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Material:</span>
                    <span class="summary-value">${this.formData.material}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Stil:</span>
                    <span class="summary-value">${this.formData.style}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Fokus:</span>
                    <span class="summary-value">${this.formData.focus}</span>
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
            console.log('📤 Uploading jewelry image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data
            const projectData = {
                projectType: 'jewelry',
                imageUrl: this.formData.imageUrl, // Only URL
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
            };

            // Submit to API
            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Schmuck-Bilder werden generiert und in Google Drive gespeichert.');
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
    if (document.body.dataset.page === 'jewelry') {
        window.jewelryModule = new JewelryModule();
        window.jewelryModule.init();
    }
});

// Export for global access
window.JewelryModule = JewelryModule;
