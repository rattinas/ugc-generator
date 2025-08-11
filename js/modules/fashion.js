// fashion.js - Fashion Photography Module
// js/modules/fashion.js

class FashionModule {
    constructor() {
@@ -9,7 +9,7 @@ class FashionModule {
            imageUrl: null,
            category: '',
            style: '',
            iphoneModel: null,
            iphoneModel: '',
            modelAction: '',
            modelType: '',
            bodyType: '',
@@ -24,7 +24,7 @@ class FashionModule {
    }

    init() {
        console.log('🎨 Initializing Fashion Module...');
        console.log('👗 Initializing Fashion Module...');
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
@@ -40,46 +40,36 @@ class FashionModule {
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
        // Navigation & Globale Elemente
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
        document.querySelector('.logo')?.addEventListener('click', () => window.location.href = '/dashboard.html');

        // Form Inputs
        document.getElementById('productCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
        // Bild-Upload
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('imageFile')?.click());
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());

        // Stil-Auswahl
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file
        const validation = window.API?.validateImageFile(file);
        if (!validation?.valid) {
            alert(validation?.error || 'Ungültiges Bild');
        // Annahme: window.API.validateImageFile existiert, wie im product.js Beispiel
        const validation = window.API?.validateImageFile ? window.API.validateImageFile(file) : { valid: true };
        if (!validation.valid) {
            alert(validation.error || 'Ungültiges Bild');
            return;
        }

        this.uploadedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
@@ -92,27 +82,54 @@ class FashionModule {
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
        // Remove previous selection
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection
        card.classList.add('selected');
        this.formData.style = card.dataset.style;

        // Show iPhone options if needed
        
        const style = card.dataset.style;
        const iphoneOptions = document.getElementById('iphoneOptions');
        if (iphoneOptions) {
            iphoneOptions.style.display = this.formData.style === 'iphone' ? 'block' : 'none';
            iphoneOptions.style.display = style === 'iphone' ? 'block' : 'none';
        }
    }

    collectFormData() {
        // Diese Methode sammelt die Daten aus dem Formular.
        // Sie wird vor der Validierung und der Zusammenfassung aufgerufen.
        this.formData = {
            ...this.formData, // Behält imageUrl, falls bereits vorhanden
            category: document.getElementById('productCategory')?.value,
            style: document.querySelector('.style-card.selected')?.dataset.style || '',
            iphoneModel: document.getElementById('iphoneModel')?.value,
            modelAction: document.getElementById('modelAction')?.value,
            modelType: document.getElementById('modelType')?.value,
            bodyType: document.getElementById('bodyType')?.value,
            ethnicity: document.getElementById('ethnicity')?.value,
            location: document.getElementById('location')?.value,
            lighting: document.getElementById('lighting')?.value,
            mood: document.getElementById('mood')?.value,
            socialStyle: document.getElementById('socialStyle')?.value,
            instructions: document.getElementById('additionalInstructions')?.value,
            variations: parseInt(document.getElementById('variations')?.value, 10) || 1,
        };
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
                
                if (this.currentStep === this.totalSteps) {
                    this.updateSummary();
                }
@@ -128,84 +145,49 @@ class FashionModule {
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
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`[data-step="${this.currentStep}"]`)?.classList.add('active');

        // Update navigation buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
        document.getElementById('prevBtn').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    validateCurrentStep() {
        this.collectFormData(); // Immer die neusten Daten holen
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Bild hoch!');
                    alert('Bitte lade ein Produktbild hoch!');
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
                // Keine strikte Validierung für die übrigen Schritte
                return true;
        }
    }

    updateSummary() {
        this.collectFormData();
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <p><strong>Kategorie:</strong> ${this.formData.category}</p>
                <p><strong>Stil:</strong> ${this.formData.style}${this.formData.iphoneModel ? ' (' + this.formData.iphoneModel + ')' : ''}</p>
                <p><strong>Stil:</strong> ${this.formData.style}${this.formData.style === 'iphone' ? ' (' + this.formData.iphoneModel + ')' : ''}</p>
                <p><strong>Model:</strong> ${this.formData.modelType}, ${this.formData.bodyType}, ${this.formData.ethnicity}</p>
                <p><strong>Aktion:</strong> ${this.formData.modelAction}</p>
                <p><strong>Model:</strong> ${this.formData.modelType}</p>
                <p><strong>Location:</strong> ${this.formData.location}</p>
                <p><strong>Location:</strong> ${this.formData.location} bei ${this.formData.lighting}</p>
                <p><strong>Variationen:</strong> ${this.formData.variations}</p>
            `;
        }
@@ -215,40 +197,44 @@ class FashionModule {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Wird verarbeitet...';
            submitBtn.textContent = '⏳ Bild wird hochgeladen...';
        }

        try {
            // First upload image to get URL
            console.log('📤 Uploading image...');
            // Schritt 1: Bild hochladen, um URL zu erhalten
            console.log('📤 Uploading fashion image...');
            // Annahme: window.API.fileToBase64 und window.API.uploadImage existieren
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);

            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
                throw new Error(uploadResult.error || 'Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data - NO base64, only URL
            // Schritt 2: Finale Daten mit der Bild-URL an den Server/Webhook senden
            if (submitBtn) submitBtn.textContent = '🚀 Daten werden gesendet...';
            this.collectFormData(); // Alle finalen Daten sammeln

            const projectData = {
                projectType: 'fashion',
                imageUrl: this.formData.imageUrl, // Only send URL
                imageUrl: this.formData.imageUrl, // Nur die URL wird gesendet
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
                variations: this.formData.variations
            };

            // Submit to API
            // Annahme: window.API.submitProject existiert
            const result = await window.API.submitProject(projectData);

            if (result.success) {
                alert('✅ Erfolgreich! Bilder werden generiert und in Google Drive gespeichert.');
                alert('✅ Erfolgreich! Fashion-Bilder werden generiert und in Google Drive gespeichert.');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler');
                throw new Error(result.error || 'Unbekannter Fehler beim Übermitteln des Projekts.');
            }

        } catch (error) {
@@ -261,29 +247,12 @@ class FashionModule {
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
// Initialisierung bei Laden der Seite
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'fashion') {
        window.fashionModule = new FashionModule();
        window.fashionModule.init();
    }
});

// Export for global access
window.FashionModule = FashionModule;
