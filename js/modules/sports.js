// js/modules/sports.js

class SportsModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            sportType: '',
            actionType: '',
            bodyType: '',
            gender: '',
            age: '',
            intensity: '',
            location: '',
            timeOfDay: '',
            weather: '',
            mood: '',
            specialEffects: '',
            variations: 1
        };

        // Annahme: Globale Komponenten-Renderer existieren
        this.headerComponent = window.components?.header;
        this.stepIndicatorComponent = window.components?.stepIndicator;
    }

    init() {
        console.log('⚽ Initializing Sports Module...');
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

        // Formular-Interaktionen
        document.getElementById('sportsCategory')?.addEventListener('change', (e) => this.updateCategoryDefaults(e.target.value));
        document.getElementById('sportType')?.addEventListener('change', (e) => this.updateSportDefaults(e.target.value));
        document.getElementById('intensity')?.addEventListener('change', (e) => this.updateIntensityEffects(e.target.value));
        document.querySelectorAll('.style-card').forEach(card => card.addEventListener('click', () => this.selectActionType(card)));
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

    selectActionType(card) {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.updateActionDefaults(card.dataset.action);
    }

    updateCategoryDefaults(category) {
        const defaults = {
            'activewear': { location: 'gym', intensity: 'moderate', mood: 'focused' },
            'shoes': { location: 'track', actionType: 'action', mood: 'energetic' },
            'equipment': { location: 'gym', actionType: 'static', intensity: 'moderate' },
            'accessories': { location: 'outdoor', actionType: 'lifestyle', mood: 'fun' },
            'nutrition': { location: 'gym', actionType: 'lifestyle', intensity: 'relaxed' },
            'tech': { location: 'outdoor', actionType: 'training', mood: 'focused' }
        };
        const categoryDefaults = defaults[category];
        if (categoryDefaults) {
            Object.keys(categoryDefaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = categoryDefaults[key];
                if (key === 'actionType') {
                    const card = document.querySelector(`.style-card[data-action="${categoryDefaults[key]}"]`);
                    if (card) this.selectActionType(card);
                }
            });
        }
    }

    updateSportDefaults(sportType) {
        const sportDefaults = {
            'running': { location: 'track', timeOfDay: 'morning', intensity: 'intense' },
            'gym': { location: 'gym', mood: 'focused', intensity: 'intense' },
            'yoga': { location: 'studio', mood: 'calm', intensity: 'relaxed' },
            'cycling': { location: 'outdoor', timeOfDay: 'golden', weather: 'clear' },
            'swimming': { location: 'pool', mood: 'energetic', intensity: 'moderate' },
            'team': { location: 'field', mood: 'victorious', intensity: 'extreme' },
            'outdoor': { location: 'nature', timeOfDay: 'golden', weather: 'clear' },
            'combat': { location: 'gym', mood: 'serious', intensity: 'extreme' }
        };
        const defaults = sportDefaults[sportType];
        if (defaults) {
            Object.keys(defaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = defaults[key];
            });
        }
    }

    updateActionDefaults(actionType) {
        const actionDefaults = {
            'static': { intensity: 'relaxed', specialEffects: '' },
            'action': { intensity: 'intense', specialEffects: 'motion-blur' },
            'training': { intensity: 'moderate', specialEffects: 'sweat' },
            'lifestyle': { intensity: 'relaxed', mood: 'fun' },
            'competition': { intensity: 'extreme', mood: 'serious' },
            'results': { intensity: 'relaxed', mood: 'victorious' }
        };
        const defaults = actionDefaults[actionType];
        if (defaults) {
            Object.keys(defaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = defaults[key];
            });
        }
    }

    updateIntensityEffects(intensity) {
        const specialEffects = document.getElementById('specialEffects');
        if (!specialEffects) return;
        const effectSuggestions = {
            'relaxed': 'Keine besonderen Effekte',
            'moderate': 'Leichter Schweiß, natürliche Bewegung',
            'intense': 'Schweiß sichtbar, Anstrengung erkennbar',
            'extreme': 'Starker Schweiß, Staub/Wasser spritzt, maximale Anstrengung'
        };
        specialEffects.placeholder = effectSuggestions[intensity] || '';
    }
    
    updateCreditDisplay() {
        const variations = parseInt(document.getElementById('variations')?.value, 10) || 1;
        const requiredCredits = variations * 2;
        document.getElementById('requiredCredits').textContent = requiredCredits;
        const availableCredits = localStorage.getItem('available_credits') || 0;
        document.getElementById('availableCredits').textContent = availableCredits;
    }

    collectFormData() {
        this.formData = {
            ...this.formData,
            category: document.getElementById('sportsCategory')?.value,
            sportType: document.getElementById('sportType')?.value,
            actionType: document.querySelector('.style-card.selected')?.dataset.action || '',
            bodyType: document.getElementById('bodyType')?.value,
            gender: document.getElementById('gender')?.value,
            age: document.getElementById('age')?.value,
            intensity: document.getElementById('intensity')?.value,
            location: document.getElementById('location')?.value,
            timeOfDay: document.getElementById('timeOfDay')?.value,
            weather: document.getElementById('weather')?.value,
            mood: document.getElementById('mood')?.value,
            specialEffects: document.getElementById('specialEffects')?.value,
            variations: parseInt(document.getElementById('variations')?.value, 10) || 1,
        };
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
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
                    alert('Bitte lade ein Bild deines Produkts hoch!');
                    return false;
                }
                if (!this.formData.category) {
                    alert('Bitte wähle eine Sport-Kategorie!');
                    return false;
                }
                return true;
            case 2:
                if (!this.formData.actionType) {
                    alert('Bitte wähle einen Action-Typ!');
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
                <p><strong>Kategorie:</strong> ${this.formData.category}, ${this.formData.sportType}</p>
                <p><strong>Action:</strong> ${this.formData.actionType}</p>
                <p><strong>Athlet:</strong> ${this.formData.gender}, ${this.formData.bodyType}</p>
                <p><strong>Location:</strong> ${this.formData.location}</p>
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
                projectType: 'sports',
                imageUrl: this.formData.imageUrl,
                specifications: this.formData,
                variations: this.formData.variations
            };

            const result = await window.API.submitProject(projectData);

            if (result.success) {
                alert('✅ Erfolgreich! Sport-Bilder werden generiert.');
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
    if (document.body.dataset.page === 'sports') {
        window.sportsModule = new SportsModule();
        window.sportsModule.init();
    }
});
