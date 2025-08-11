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
        // Navigation & Globale Elemente
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());
        document.querySelector('.logo')?.addEventListener('click', () => window.location.href = '/dashboard.html');

        // Bild-Upload
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('imageFile')?.click());
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());

        // Formular-Interaktionen
        document.getElementById('foodCategory')?.addEventListener('change', (e) => this.updateCategoryDefaults(e.target.value));
        document.querySelectorAll('.style-card').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Annahme: window.API.validateImageFile existiert
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

    selectStyle(card) {
        document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.updateStyleDefaults(card.dataset.style);
    }

    updateCategoryDefaults(category) {
        // Diese Logik bleibt erhalten, da sie spezifisch für Food ist.
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
        // Diese Logik bleibt ebenfalls erhalten.
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
            category: document.getElementById('foodCategory')?.value,
            productName: document.getElementById('foodName')?.value,
            style: document.querySelector('.style-card.selected')?.dataset.style || '',
            cameraAngle: document.getElementById('cameraAngle')?.value,
            presentation: document.getElementById('presentation')?.value,
            effects: document.getElementById('effects')?.value,
            props: document.getElementById('props')?.value,
            surface: document.getElementById('surface')?.value,
            lighting: document.getElementById('lighting')?.value,
            colorPalette: document.getElementById('colorPalette')?.value,
            season: document.getElementById('season')?.value,
            additionalDetails: document.getElementById('additionalDetails')?.value,
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
