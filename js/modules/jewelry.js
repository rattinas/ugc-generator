// js/modules/jewelry.js

class JewelryModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5; // Standardmäßig 5 Schritte
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
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
            variations: 1
        };

        // Annahme: Globale Komponenten-Renderer existieren
        this.headerComponent = window.components?.header;
        this.stepIndicatorComponent = window.components?.stepIndicator;
    }

    init() {
        console.log('💎 Initializing Jewelry Module...');
        this.loadComponents();
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
        this.updateCreditDisplay();
    }
    
    loadComponents() {
        if (this.headerComponent) this.headerComponent.render('mainHeader');
        if (this.stepIndicatorComponent) this.stepIndicatorComponent.render('stepIndicator', this.totalSteps, this.currentStep);
    }

    checkDriveConfiguration() {
        // Diese Funktion bleibt wie in den anderen Modulen
        const driveFolder = localStorage.getItem('drive_folder_link');
        if (!driveFolder) {
            if (confirm('Google Drive Ordner nicht konfiguriert. Jetzt einrichten?')) {
                window.location.href = '/dashboard.html';
            }
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
        
        // Bild-Upload
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('imageFile')?.click());
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());

        // Stil-Auswahl
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });

        // Variationen-Änderung
        document.getElementById('variations')?.addEventListener('change', () => this.updateCreditDisplay());
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.uploadedFile = file;

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

    removeImage() {
        this.uploadedFile = null;
        this.formData.imageUrl = null;
        const imageFile = document.getElementById('imageFile');
        if (imageFile) imageFile.value = '';
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
    }

    selectStyle(card) {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Dynamische Anpassung der Schritte
        const style = card.dataset.style;
        if (style === 'worn' || style === 'lifestyle') {
            this.totalSteps = 5; // Alle Schritte anzeigen
        } else {
            this.totalSteps = 4; // Schritt 4 (Model) überspringen
        }
        if (this.stepIndicatorComponent) this.stepIndicatorComponent.render('stepIndicator', this.totalSteps, this.currentStep);
    }
    
    updateCreditDisplay() {
        const variations = parseInt(document.getElementById('variations')?.value, 10) || 1;
        const requiredCredits = variations * 2; // Annahme: 2 Credits pro Bild
        document.getElementById('requiredCredits').textContent = requiredCredits;
        
        // Annahme: Die verfügbaren Credits werden von auth.js oder api.js geladen
        const availableCredits = localStorage.getItem('available_credits') || 0;
        document.getElementById('availableCredits').textContent = availableCredits;
    }

    collectFormData() {
        this.formData = {
            ...this.formData,
            category: document.getElementById('jewelryCategory')?.value,
            material: document.getElementById('material')?.value,
            style: document.querySelector('.style-card.selected')?.dataset.style || '',
            focus: document.getElementById('focus')?.value,
            lighting: document.getElementById('lighting')?.value,
            background: document.getElementById('background')?.value,
            reflections: document.getElementById('reflections')?.value,
            modelVisibility: document.getElementById('modelVisibility')?.value,
            styling: document.getElementById('styling')?.value,
            handStyling: document.getElementById('handStyling')?.value,
            props: document.getElementById('props')?.value,
            variations: parseInt(document.getElementById('variations')?.value, 10) || 1,
        };
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                // Schritt 4 überspringen, wenn nicht benötigt
                if (this.currentStep === 4 && this.totalSteps === 4) {
                    this.currentStep = 5;
                }
                this.updateStepDisplay();
            }
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            // Schritt 4 überspringen, wenn nicht benötigt
            if (this.currentStep === 4 && this.totalSteps === 4) {
                this.currentStep = 3;
            }
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        if (this.currentStep === this.totalSteps) {
            this.updateSummary();
        }
        
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`[data-step="${this.currentStep}"]`)?.classList.add('active');
        
        if (this.stepIndicatorComponent) this.stepIndicatorComponent.update('stepIndicator', this.currentStep);

        document.getElementById('prevBtn').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    validateCurrentStep() {
        this.collectFormData();
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Bild des Schmuckstücks hoch!');
                    return false;
                }
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
            default:
                return true;
        }
    }

    updateSummary() {
        this.collectFormData();
        const summaryContent = document.getElementById('summaryReview');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <h3>Zusammenfassung</h3>
                <p><strong>Kategorie:</strong> ${this.formData.category}, ${this.formData.material}</p>
                <p><strong>Stil:</strong> ${this.formData.style}</p>
                <p><strong>Hintergrund:</strong> ${this.formData.background}</p>
                ${this.totalSteps === 5 ? `<p><strong>Model:</strong> ${this.formData.modelVisibility}</p>` : ''}
                <p><strong>Variationen:</strong> ${this.formData.variations}</p>
            `;
        }
    }

    async submit() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Bild wird hochgeladen...';

        try {
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            submitBtn.textContent = '🚀 Daten werden gesendet...';
            this.collectFormData();

            const projectData = {
                projectType: 'jewelry',
                imageUrl: this.formData.imageUrl,
                specifications: this.formData,
                variations: this.formData.variations
            };

            const result = await window.API.submitProject(projectData);

            if (result.success) {
                alert('✅ Erfolgreich! Schmuck-Bilder werden generiert.');
                setTimeout(() => { window.location.href = '/dashboard.html'; }, 2000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler beim Übermitteln des Projekts.');
            }
        } catch (error) {
            console.error('❌ Submit error:', error);
            alert('Fehler: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '🚀 Bilder generieren';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'jewelry') {
        window.jewelryModule = new JewelryModule();
        window.jewelryModule.init();
    }
});
