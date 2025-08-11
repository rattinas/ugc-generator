// product.js - Product Photography Module

class ProductModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            productName: '',
            style: '',
            mainAction: '',
            specificAction: '',
            handType: '',
            handStyling: '',
            setting: '',
            background: '',
            lighting: '',
            props: '',
            cameraAngle: '',
            additionalDetails: '',
            variations: 1
        };
    }

    init() {
        console.log('📦 Initializing Product Module...');
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
        
        uploadArea?.addEventListener('click', () => {
            imageFile?.click();
        });

        imageFile?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Style Cards
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });

        // Category change
        document.getElementById('productCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
            this.updateActionOptions(e.target.value);
        });

        // Main action change
        document.getElementById('mainAction')?.addEventListener('change', (e) => {
            this.updateHandOptions(e.target.value);
        });
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
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.style = card.dataset.style;

        // Adjust form based on style
        if (this.formData.style === 'ugc') {
            this.setUGCDefaults();
        } else if (this.formData.style === 'unboxing') {
            this.setUnboxingDefaults();
        }
    }

    setUGCDefaults() {
        // Set UGC appropriate defaults
        const lighting = document.getElementById('lighting');
        if (lighting) lighting.value = 'phone-flash';
        
        const background = document.getElementById('background');
        if (background) background.value = 'natural';
    }

    setUnboxingDefaults() {
        const mainAction = document.getElementById('mainAction');
        if (mainAction) mainAction.value = 'opening';
    }

    updateActionOptions(category) {
        const specificAction = document.getElementById('specificAction');
        if (!specificAction) return;

        // Category-specific action suggestions
        const suggestions = {
            'cosmetics': 'Creme auftragen, Spray benutzen, Textur zeigen',
            'electronics': 'Gerät bedienen, Kabel anschließen, Display zeigen',
            'food-beverage': 'Ausgießen, Öffnen, Servieren, Probieren',
            'tools': 'In Aktion zeigen, Griff demonstrieren, Funktion zeigen',
            'household': 'Reinigen, Organisieren, Benutzen',
            'sports': 'Training, Equipment halten, In Bewegung'
        };

        specificAction.placeholder = suggestions[category] || 'Beschreibe die spezifische Aktion...';
    }

    updateHandOptions(action) {
        const handType = document.getElementById('handType');
        if (!handType) return;

        // Show/hide hand options based on action
        const handSection = handType.closest('.form-group');
        if (action === 'static') {
            if (handSection) handSection.style.display = 'none';
            const handStylingSection = document.getElementById('handStyling')?.closest('.form-group');
            if (handStylingSection) handStylingSection.style.display = 'none';
        } else {
            if (handSection) handSection.style.display = 'block';
            const handStylingSection = document.getElementById('handStyling')?.closest('.form-group');
            if (handStylingSection) handStylingSection.style.display = 'block';
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
                    alert('Bitte lade ein Produktbild hoch!');
                    return false;
                }
                this.formData.category = document.getElementById('productCategory')?.value;
                this.formData.productName = document.getElementById('productName')?.value;
                if (!this.formData.category) {
                    alert('Bitte wähle eine Produktkategorie!');
                    return false;
                }
                return true;

            case 2:
                if (!this.formData.style) {
                    alert('Bitte wähle einen Fotografie-Stil!');
                    return false;
                }
                return true;

            case 3:
                this.formData.mainAction = document.getElementById('mainAction')?.value;
                this.formData.specificAction = document.getElementById('specificAction')?.value;
                this.formData.handType = document.getElementById('handType')?.value;
                this.formData.handStyling = document.getElementById('handStyling')?.value;
                return true;

            case 4:
                this.formData.setting = document.getElementById('setting')?.value;
                this.formData.background = document.getElementById('background')?.value;
                this.formData.lighting = document.getElementById('lighting')?.value;
                this.formData.props = document.getElementById('props')?.value;
                return true;

            case 5:
                this.formData.cameraAngle = document.getElementById('cameraAngle')?.value;
                this.formData.additionalDetails = document.getElementById('additionalDetails')?.value;
                this.formData.variations = document.getElementById('variations')?.value;
                return true;

            default:
                return true;
        }
    }

    updateSummary() {
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <p><strong>Produkt:</strong> ${this.formData.productName || this.formData.category}</p>
                <p><strong>Stil:</strong> ${this.formData.style}</p>
                <p><strong>Aktion:</strong> ${this.formData.mainAction} ${this.formData.specificAction ? '- ' + this.formData.specificAction : ''}</p>
                <p><strong>Setting:</strong> ${this.formData.setting}</p>
                <p><strong>Hintergrund:</strong> ${this.formData.background}</p>
                <p><strong>Variationen:</strong> ${this.formData.variations}</p>
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
            console.log('📤 Uploading product image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data
            const projectData = {
                projectType: 'product',
                imageUrl: this.formData.imageUrl, // Only URL
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
            };

            // Submit to API
            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Produktbilder werden generiert und in Google Drive gespeichert.');
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
    if (document.body.dataset.page === 'product') {
        window.productModule = new ProductModule();
        window.productModule.init();
    }
});

// Export for global access
window.ProductModule = ProductModule;
