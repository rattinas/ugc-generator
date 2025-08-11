// js/modules/beauty.js

class BeautyModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null, category: '', shotType: '', focusArea: '', skinType: '',
            skinTone: '', makeupLevel: '', modelAge: '', skinFinish: '', location: '',
            lighting: '', mood: '', props: '', specialRequirements: '', variations: 1
        };
    }

    init() {
        console.log('💄 Initializing Beauty Module...');
        // KORREKTUR: Zuerst das HTML für den Uploader rendern
        this.renderUploaderComponent();
        // Erst DANACH die Event-Listener initialisieren
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
    }

    renderUploaderComponent() {
        const target = document.getElementById('imageUpload');
        if (!target) {
            console.error('Uploader target element #imageUpload not found!');
            return;
        }

        const uploaderHTML = `
            <div class="upload-area" id="uploadArea">
                <input type="file" id="imageFile" accept="image/*" style="display: none;">
                <div id="uploadPlaceholder">
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">Klicken zum Hochladen</div>
                    <div class="upload-subtext">PNG, JPG oder WebP • Max. 10MB</div>
                </div>
                <div id="imagePreview" style="display: none;">
                    <img id="previewImg" style="max-width: 100%; max-height: 300px; border-radius: 8px;" alt="Vorschaubild">
                    <button type="button" id="removeImageBtn" class="btn btn-small" style="margin-top: 10px;">Entfernen</button>
                </div>
            </div>
        `;
        target.innerHTML = uploaderHTML;
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
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('imageFile')?.click());
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());
        document.getElementById('beautyCategory')?.addEventListener('change', () => this.collectFormData());
        document.querySelectorAll('.style-card[data-shot]').forEach(card => {
            card.addEventListener('click', () => this.selectShotType(card));
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const validation = window.API?.validateImageFile ? window.API.validateImageFile(file) : { valid: true };
        if (!validation.valid) {
            alert(validation.error || 'Ungültiges Bild');
            return;
        }

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

    selectShotType(card) {
        document.querySelectorAll('.style-card[data-shot]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
    }

    collectFormData() {
        this.formData = {
            ...this.formData,
            category: document.getElementById('beautyCategory')?.value,
            shotType: document.querySelector('.style-card.selected')?.dataset.shot || '',
            focusArea: document.getElementById('focusArea')?.value,
            skinType: document.getElementById('skinType')?.value,
            skinTone: document.getElementById('skinTone')?.value,
            makeupLevel: document.getElementById('makeupLevel')?.value,
            modelAge: document.getElementById('modelAge')?.value,
            skinFinish: document.getElementById('skinFinish')?.value,
            location: document.getElementById('location')?.value,
            lighting: document.getElementById('lighting')?.value,
            mood: document.getElementById('mood')?.value,
            props: document.getElementById('props')?.value,
            specialRequirements: document.getElementById('specialRequirements')?.value,
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
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`[data-step="${this.currentStep}"]`)?.classList.add('active');
        
        document.getElementById('prevBtn').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    validateCurrentStep() {
        this.collectFormData();
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Produktbild hoch!');
                    return false;
                }
                if (!this.formData.category) {
                    alert('Bitte wähle eine Kategorie!');
                    return false;
                }
                return true;
            case 2:
                if (!this.formData.shotType) {
                    alert('Bitte wähle einen Aufnahmetyp!');
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
                <p><strong>Produkt:</strong> ${this.formData.category}</p>
                <p><strong>Aufnahmetyp:</strong> ${this.formData.shotType}</p>
                <p><strong>Fokus:</strong> ${this.formData.focusArea} auf ${this.formData.skinTone} Haut</p>
                <p><strong>Setting:</strong> ${this.formData.location} mit ${this.formData.lighting} Beleuchtung</p>
                <p><strong>Variationen:</strong> ${this.formData.variations}</p>
            `;
        }
    }

    async submit() {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Bild wird hochgeladen...';
        }

        try {
            if (!this.uploadedFile) throw new Error('Kein Bild zum Hochladen ausgewählt.');
            
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Bild-Upload fehlgeschlagen');
            }
            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            if (submitBtn) submitBtn.textContent = '🚀 Daten werden gesendet...';
            this.collectFormData();

            const projectData = {
                projectType: 'beauty',
                imageUrl: this.formData.imageUrl,
                specifications: this.formData,
                variations: this.formData.variations
            };

            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Beauty-Bilder werden generiert und in Google Drive gespeichert.');
                setTimeout(() => window.location.href = '/dashboard.html', 2000);
            } else {
                throw new Error(result.error || 'Unbekannter Fehler beim Übermitteln des Projekts.');
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
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'beauty') {
        window.beautyModule = new BeautyModule();
        window.beautyModule.init();
    }
});
