// fashion.js - Fashion Photography Module

class FashionModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            style: '',
            iphoneModel: null,
            modelAction: '',
            modelType: '',
            bodyType: '',
            ethnicity: '',
            location: '',
            lighting: '',
            mood: '',
            socialStyle: '',
            instructions: '',
            variations: 1
        };
    }

    init() {
        console.log('🎨 Initializing Fashion Module...');
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

        // Navigation
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());

        // Form Inputs
        document.getElementById('productCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
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
        // Remove previous selection
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection
        card.classList.add('selected');
        this.formData.style = card.dataset.style;

        // Show iPhone options if needed
        const iphoneOptions = document.getElementById('iphoneOptions');
        if (iphoneOptions) {
            iphoneOptions.style.display = this.formData.style === 'iphone' ? 'block' : 'none';
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
                    alert('Bitte lade ein Bild hoch!');
                    return false;
                }
                this.formData.category = document.getElementById('productCategory')?.value;
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
                if (this.formData.style === 'iphone') {
                    this.formData.iphoneModel = document.getElementById('iphoneModel')?.value;
                }
                return true;

            case 3:
                this.formData.modelAction = document.getElementById('modelAction')?.value;
                this.formData.modelType = document.getElementById('modelType')?.value;
                this.formData.bodyType = document.getElementById('bodyType')?.value;
                this.formData.ethnicity = document.getElementById('ethnicity')?.value;
                return true;

            case 4:
                this.formData.location = document.getElementById('location')?.value;
                this.formData.lighting = document.getElementById('lighting')?.value;
                this.formData.mood = document.getElementById('mood')?.value;
                this.formData.socialStyle = document.getElementById('socialStyle')?.value;
                return true;

            case 5:
                this.formData.instructions = document.getElementById('additionalInstructions')?.value;
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
                <p><strong>Kategorie:</strong> ${this.formData.category}</p>
                <p><strong>Stil:</strong> ${this.formData.style}${this.formData.iphoneModel ? ' (' + this.formData.iphoneModel + ')' : ''}</p>
                <p><strong>Aktion:</strong> ${this.formData.modelAction}</p>
                <p><strong>Model:</strong> ${this.formData.modelType}</p>
                <p><strong>Location:</strong> ${this.formData.location}</p>
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
            // First upload image to get URL
            console.log('📤 Uploading image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data - NO base64, only URL
            const projectData = {
                projectType: 'fashion',
                imageUrl: this.formData.imageUrl, // Only send URL
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
            };

            // Submit to API
            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Bilder werden generiert und in Google Drive gespeichert.');
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
    if (document.body.dataset.page === 'fashion') {
        window.fashionModule = new FashionModule();
        window.fashionModule.init();
    }
});

// Export for global access
window.FashionModule = FashionModule;
