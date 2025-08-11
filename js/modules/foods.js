// js/modules/food.js

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
        // Navigation Buttons
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        const logo = document.querySelector('.logo');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submit());
        }
        
        if (logo) {
            logo.addEventListener('click', () => window.location.href = '/dashboard.html');
        }

        // Bild-Upload Setup
        const uploadArea = document.getElementById('uploadArea');
        const imageFile = document.getElementById('imageFile');
        const removeImageBtn = document.getElementById('removeImageBtn');

        // Upload Area Click Handler
        if (uploadArea) {
            uploadArea.addEventListener('click', function(e) {
                // Prüfe ob das Remove Button geklickt wurde
                if (e.target && (e.target.id === 'removeImageBtn' || e.target.closest('#removeImageBtn'))) {
                    return; // Nicht das File Input triggern
                }
                
                // Trigger File Input
                if (imageFile) {
                    imageFile.click();
                }
            });
        }

        // File Input Change Handler
        if (imageFile) {
            imageFile.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Remove Image Button
        if (removeImageBtn) {
            removeImageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Verhindert dass der Upload Area Click getriggert wird
                this.removeImage();
            });
        }

        // Food Category Change
        const foodCategory = document.getElementById('foodCategory');
        if (foodCategory) {
            foodCategory.addEventListener('change', (e) => this.updateCategoryDefaults(e.target.value));
        }

        // Style Cards Click Handler
        const styleCards = document.querySelectorAll('.style-card');
        styleCards.forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validierung
        if (window.API && window.API.validateImageFile) {
            const validation = window.API.validateImageFile(file);
            if (!validation.valid) {
                alert(validation.error || 'Ungültiges Bild');
                return;
            }
        }

        this.uploadedFile = file;

        // Vorschau anzeigen
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('previewImg');
            const uploadPlaceholder = document.getElementById('uploadPlaceholder');
            const imagePreview = document.getElementById('imagePreview');
            
            if (previewImg && uploadPlaceholder && imagePreview) {
                previewImg.src = e.target.result;
                uploadPlaceholder.style.display = 'none';
                imagePreview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.uploadedFile = null;
        this.formData.imageUrl = null;
        
        const imageFile = document.getElementById('imageFile');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');
        const imagePreview = document.getElementById('imagePreview');
        
        if (imageFile) imageFile.value = '';
        if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
        if (imagePreview) imagePreview.style.display = 'none';
    }

    selectStyle(card) {
        // Entferne selected von allen Cards
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        // Füge selected zur geklickten Card hinzu
        card.classList.add('selected');
        // Speichere den Style
        this.formData.style = card.dataset.style;
        // Update Defaults basierend auf Style
        this.updateStyleDefaults(card.dataset.style);
    }

    updateCategoryDefaults(category) {
        const defaults = {
            'dish': { cameraAngle: '45-degree', presentation: 'plated', lighting: 'natural' },
            'beverage': { cameraAngle: 'eye-level', effects: 'condensation', props: 'minimal' },
            'ingredients': { cameraAngle: 'overhead', presentation: 'ingredients', surface: 'wood' },
            'packaged': { cameraAngle: 'eye-level', presentation: 'lifestyle', lighting: 'studio' },
            'baked': { cameraAngle: '45-degree', effects: 'steam', lighting: 'warm' },
            'dessert': { cameraAngle: 'close-up', presentation: 'plated', props: 'minimal' }
        };
        
        const categoryDefaults = defaults[category];
        if (categoryDefaults) {
            Object.keys(categoryDefaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = categoryDefaults[key];
            });
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
            Object.keys(defaults).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = defaults[key];
            });
        }
    }

    collectFormData() {
        this.formData = {
            ...this.formData,
            category: document.getElementById('foodCategory')?.value || '',
            productName: document.getElementById('foodName')?.value || '',
            style: document.querySelector('.style-card.selected')?.dataset.style || '',
            cameraAngle: document.getElementById('cameraAngle')?.value || '',
            presentation: document.getElementById('presentation')?.value || '',
            effects: document.getElementById('effects')?.value || '',
            props: document.getElementById('props')?.value || '',
            surface: document.getElementById('surface')?.value || '',
            lighting: document.getElementById('lighting')?.value || '',
            colorPalette: document.getElementById('colorPalette')?.value || '',
            season: document.getElementById('season')?.value || '',
            additionalDetails: document.getElementById('additionalDetails')?.value || '',
            variations: parseInt(document.getElementById('variations')?.value, 10) || 1
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
        // Alle Steps ausblenden
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Aktuellen Step anzeigen
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }
        
        // Navigation Buttons Update
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    validateCurrentStep() {
        this.collectFormData();
        
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Food-Produkt hoch!');
                    return false;
                }
                if (!this.formData.category) {
                    alert('Bitte wähle eine Food-Kategorie!');
                    return false;
                }
                return true;
                
            case 2:
                if (!this.formData.style) {
                    alert('Bitte wähle einen Food-Style!');
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
                <h3>📋 Zusammenfassung</h3>
                <p><strong>Produkt:</strong> ${this.formData.productName || this.formData.category}</p>
                <p><strong>Style:</strong> ${this.formData.style}</p>
                <p><strong>Winkel:</strong> ${this.formData.cameraAngle}</p>
                <p><strong>Präsentation:</strong> ${this.formData.presentation}</p>
                <p><strong>Effekte:</strong> ${this.formData.effects}</p>
                <p><strong>Beleuchtung:</strong> ${this.formData.lighting}</p>
                <p><strong>Variationen:</strong> ${this.formData.variations}</p>
            `;
        }
    }

    async submit() {
        const submitBtn = document.getElementById('submitBtn');
        
        if (!submitBtn) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Bild wird hochgeladen...';

        try {
            // Check if API exists
            if (!window.API) {
                throw new Error('API nicht verfügbar');
            }

            // Upload Image
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
                projectType: 'food',
                imageUrl: this.formData.imageUrl,
                specifications: this.formData,
                variations: this.formData.variations
            };

            const result = await window.API.submitProject(projectData);

            if (result.success) {
                alert('✅ Erfolgreich! Food-Bilder werden generiert und in Google Drive gespeichert.');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
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
    if (document.body.dataset.page === 'food') {
        window.foodModule = new FoodModule();
        window.foodModule.init();
    }
});
