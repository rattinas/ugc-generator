// sports.js - Sports Photography Module

class SportsModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.uploadedFile = null;
        this.formData = {
            imageUrl: null,
            category: '',
            productName: '',
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
            additionalDetails: '',
            variations: 1
        };
    }

    init() {
        console.log('⚽ Initializing Sports Module...');
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

        // Category and Sport Type
        document.getElementById('sportsCategory')?.addEventListener('change', (e) => {
            this.formData.category = e.target.value;
            this.updateCategoryDefaults(e.target.value);
        });

        document.getElementById('sportType')?.addEventListener('change', (e) => {
            this.formData.sportType = e.target.value;
            this.updateSportDefaults(e.target.value);
        });

        // Action type cards
        document.querySelectorAll('.style-card[data-action]').forEach(card => {
            card.addEventListener('click', () => this.selectActionType(card));
        });

        // Intensity change
        document.getElementById('intensity')?.addEventListener('change', (e) => {
            this.updateIntensityEffects(e.target.value);
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

    selectActionType(card) {
        document.querySelectorAll('.style-card[data-action]').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.actionType = card.dataset.action;

        // Adjust settings based on action type
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
                
                // For action type cards
                if (key === 'actionType' && categoryDefaults[key]) {
                    const card = document.querySelector(`[data-action="${categoryDefaults[key]}"]`);
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
                    alert('Bitte lade ein Sport-Equipment hoch!');
                    return false;
                }
                this.formData.category = document.getElementById('sportsCategory')?.value;
                this.formData.productName = document.getElementById('productName')?.value;
                this.formData.sportType = document.getElementById('sportType')?.value;
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

            case 3:
                this.formData.bodyType = document.getElementById('bodyType')?.value;
                this.formData.gender = document.getElementById('gender')?.value;
                this.formData.age = document.getElementById('age')?.value;
                this.formData.intensity = document.getElementById('intensity')?.value;
                return true;

            case 4:
                this.formData.location = document.getElementById('location')?.value;
                this.formData.timeOfDay = document.getElementById('timeOfDay')?.value;
                this.formData.weather = document.getElementById('weather')?.value;
                this.formData.mood = document.getElementById('mood')?.value;
                this.formData.specialEffects = document.getElementById('specialEffects')?.value;
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
                    <span class="summary-label">Sportart:</span>
                    <span class="summary-value">${this.formData.sportType}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Action:</span>
                    <span class="summary-value">${this.formData.actionType}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Intensität:</span>
                    <span class="summary-value">${this.formData.intensity}</span>
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
            console.log('📤 Uploading sports equipment image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Prepare project data
            const projectData = {
                projectType: 'sports',
                imageUrl: this.formData.imageUrl, // Only URL
                specifications: this.formData,
                variations: parseInt(this.formData.variations)
            };

            // Submit to API
            const result = await window.API.submitProject(projectData);
            
            if (result.success) {
                alert('✅ Erfolgreich! Sport-Bilder werden generiert und in Google Drive gespeichert.');
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
    if (document.body.dataset.page === 'sports') {
        window.sportsModule = new SportsModule();
        window.sportsModule.init();
    }
});

// Export for global access
window.SportsModule = SportsModule;
