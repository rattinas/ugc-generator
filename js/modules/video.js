// js/modules/video.js - Video Generation Module with Veo 3

class VideoModule {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 4;
        this.uploadedFile = null;
        this.videoType = '';
        this.formData = {
            imageUrl: null,
            videoType: '',
            prompt: '',
            style: '',
            motion: '',
            camera: '',
            audio: {
                includeAudio: true,
                soundEffects: true,
                dialogue: false,
                music: false,
                audioDescription: ''
            },
            duration: 8, // Veo 3 default
            aspectRatio: '16:9',
            resolution: '1080p',
            additionalInstructions: ''
        };
    }

    init() {
        console.log('🎬 Initializing Video Module...');
        this.videoType = this.getVideoTypeFromURL();
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
        
        // **UPDATE:** Passt die UI an, falls es eine freie Generierung ist
        this.adjustUIForVideoType();
    }

    getVideoTypeFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('type') || 'custom'; // Standard ist jetzt 'custom'
    }

    // **NEUE FUNKTION:** Ändert die Texte, wenn kein Bild benötigt wird
    adjustUIForVideoType() {
        if (this.videoType === 'custom') {
            // Schritt 1 anpassen
            const step1Header = document.querySelector('.form-step[data-step="1"] h2');
            if (step1Header) step1Header.textContent = 'Schritt 1: Ausgangsbild hochladen (Optional)';
            
            // Upload-Platzhalter anpassen
            const uploadText = document.querySelector('#uploadPlaceholder .upload-text');
            if (uploadText) uploadText.textContent = 'Optional: Bild als Ausgangspunkt hochladen';
            
            // Dashboard-Titel anpassen
            const pageTitle = document.querySelector('.page-header h1');
            if (pageTitle) pageTitle.textContent = '✨ Freies Video erstellen';

            const customTips = document.getElementById('customVideoTips');
            if (customTips) customTips.style.display = 'block';
        }
    }

    checkDriveConfiguration() {
        const driveFolder = localStorage.getItem('drive_folder_link');
        if (!driveFolder && confirm('Google Drive Ordner nicht konfiguriert. Jetzt einrichten?')) {
            window.location.href = '/dashboard.html';
        }
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());

        // Image Upload
        document.getElementById('uploadArea')?.addEventListener('click', () => document.getElementById('imageFile')?.click());
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());

        // Style & Motion Selection
        document.querySelectorAll('.video-style-card').forEach(card => card.addEventListener('click', () => this.selectStyle(card)));
        document.querySelectorAll('.motion-card').forEach(card => card.addEventListener('click', () => this.selectMotion(card)));

        // Audio & Prompt
        document.getElementById('includeAudio')?.addEventListener('change', (e) => this.toggleAudioOptions(e.target.checked));
        document.getElementById('enhancePrompt')?.addEventListener('click', () => this.enhancePrompt());
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Die globale API-Funktion zur Validierung nutzen
        const validation = window.API?.validateImageFile(file);
        if (validation && !validation.valid) {
            alert(validation.error || 'Ungültiges Bild');
            return;
        }

        this.uploadedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.uploadedFile = null;
        this.formData.imageUrl = null;
        document.getElementById('imageFile').value = '';
        document.getElementById('uploadPlaceholder').style.display = 'block';
        document.getElementById('imagePreview').style.display = 'none';
    }
    
    // HIER IST DIE KORRIGIERTE/AKTUALISIERTE PROMPT-VERBESSERUNGSFUNKTION
    async enhancePrompt() {
        const promptInput = document.getElementById('videoPrompt');
        const enhanceButton = document.getElementById('enhancePrompt');
        if (!promptInput || !enhanceButton) return;

        const originalPrompt = promptInput.value;
        if (!originalPrompt || originalPrompt.length < 10) {
            alert('Bitte geben Sie zuerst einen aussagekräftigen Prompt mit mindestens 10 Zeichen ein.');
            return;
        }

        enhanceButton.disabled = true;
        enhanceButton.textContent = 'Verbessere...';

        try {
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: originalPrompt }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ein unbekannter Fehler ist aufgetreten.');
            }

            const data = await response.json();
            promptInput.value = data.enhancedPrompt;

        } catch (error) {
            console.error('Fehler beim Verbessern des Prompts:', error);
            alert(`Die Verbesserung konnte nicht durchgeführt werden: ${error.message}`);
        } finally {
            enhanceButton.disabled = false;
            enhanceButton.textContent = '✨ Prompt verbessern';
        }
    }

    // **UPDATE:** Die Validierung für Schritt 1 ist jetzt flexibel
    validateCurrentStep() {
        this.collectFormData();
        
        switch(this.currentStep) {
            case 1:
                // Das Bild ist nur noch Pflicht, wenn der Typ NICHT 'custom' ist
                if (this.videoType !== 'custom' && !this.uploadedFile) {
                    alert('Für diesen Video-Typ ist ein Ausgangsbild erforderlich!');
                    return false;
                }
                return true;
            
            case 2:
                if (!this.formData.prompt || this.formData.prompt.length < 10) {
                    alert('Bitte beschreiben Sie Ihr gewünschtes Video mit mindestens 10 Zeichen!');
                    return false;
                }
                return true;
            
            default:
                return true;
        }
    }
    
    // **UPDATE:** Die Submit-Funktion behandelt den Fall ohne Bild
    async submit() {
        if (!confirm('Video jetzt generieren? Dies ist mit Kosten verbunden.')) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Video wird vorbereitet...';

        try {
            // Nur wenn ein Bild hochgeladen wurde, wird es verarbeitet
            if (this.uploadedFile) {
                console.log('📤 Uploading video source image...');
                const base64 = await window.API.fileToBase64(this.uploadedFile);
                const uploadResult = await window.API.uploadImage(base64);
                
                if (!uploadResult.success) throw new Error('Bild-Upload fehlgeschlagen');
                this.formData.imageUrl = uploadResult.imageUrl;
                console.log('✅ Image uploaded:', this.formData.imageUrl);
            } else {
                console.log('ℹ️ Kein Referenzbild vorhanden, fahre ohne fort.');
                this.formData.imageUrl = null;
            }

            this.collectFormData();
            const fullPrompt = this.generateFullPrompt();

            const videoProjectData = { /* ... (Datenstruktur wie gehabt) ... */ };

            submitBtn.textContent = '🎬 Video wird generiert...';
            
            const response = await fetch('/api/video', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(videoProjectData) // Hier müssten die Daten rein
            });

            const result = await response.json();
            
            if (result.success) {
                alert('✅ Erfolgreich! Dein Video wird generiert...');
                setTimeout(() => { window.location.href = '/dashboard.html?success=true&type=video'; }, 1000);
            } else {
                throw new Error(result.error || 'Video-Generierung fehlgeschlagen');
            }

        } catch (error) {
            console.error('❌ Video submit error:', error);
            alert('Fehler: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = '🎬 Video generieren';
        }
    }
    
    // Alle weiteren, unveränderten Funktionen...
    selectStyle(card) {
        document.querySelectorAll('.video-style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.style = card.dataset.style;
    }
    selectMotion(card) {
        document.querySelectorAll('.motion-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.motion = card.dataset.motion;
    }
    toggleAudioOptions(enabled) {
        document.getElementById('audioDetails').style.display = enabled ? 'block' : 'none';
        this.formData.audio.includeAudio = enabled;
    }
    generateFullPrompt() { /* ... unverändert ... */ return "Prompt"; }
    collectFormData() { /* ... unverändert ... */ }
    updateSummary() { /* ... unverändert ... */ }
    nextStep() { if (this.validateCurrentStep() && this.currentStep < this.totalSteps) { this.currentStep++; this.updateStepDisplay(); if (this.currentStep === this.totalSteps) this.updateSummary(); } }
    previousStep() { if (this.currentStep > 1) { this.currentStep--; this.updateStepDisplay(); } }
    updateStepDisplay() {
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`[data-step="${this.currentStep}"]`)?.classList.add('active');
        document.getElementById('prevBtn').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'video') {
        window.videoModule = new VideoModule();
        window.videoModule.init();
    }
});

window.VideoModule = VideoModule;
