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
        
        // Video webhook is different from image webhook
        this.videoWebhookUrl = 'https://hook.eu2.make.com/cm8ms9d0nly28j27i7mprdh02owzmlb4';
    }

    init() {
        console.log('🎬 Initializing Video Module...');
        this.videoType = this.getVideoTypeFromURL();
        this.setupEventListeners();
        this.updateStepDisplay();
        this.checkDriveConfiguration();
        this.initializeVideoTypeDefaults();
        
        // Show special tips for custom video
        if (this.videoType === 'custom') {
            const customTips = document.getElementById('customVideoTips');
            if (customTips) customTips.style.display = 'block';
            
            // Update page title for custom
            const pageTitle = document.querySelector('.page-header h1');
            if (pageTitle) pageTitle.textContent = '✨ Freies Video erstellen';
        }
    }

    getVideoTypeFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('type') || 'product-demo';
    }

    checkDriveConfiguration() {
        const driveFolder = localStorage.getItem('drive_folder_link');
        if (!driveFolder) {
            if (confirm('Google Drive Ordner nicht konfiguriert. Jetzt einrichten?')) {
                window.location.href = '/dashboard.html';
            }
        }
    }

    initializeVideoTypeDefaults() {
        // ... (Dieser Teil bleibt unverändert)
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('prevBtn')?.addEventListener('click', () => this.previousStep());
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submit());

        // Image Upload
        document.getElementById('uploadArea')?.addEventListener('click', () => {
            document.getElementById('imageFile')?.click();
        });
        document.getElementById('imageFile')?.addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn')?.addEventListener('click', () => this.removeImage());

        // Style Selection
        document.querySelectorAll('.video-style-card').forEach(card => {
            card.addEventListener('click', () => this.selectStyle(card));
        });

        // Motion Type Selection
        document.querySelectorAll('.motion-card').forEach(card => {
            card.addEventListener('click', () => this.selectMotion(card));
        });

        // Audio Options
        document.getElementById('includeAudio')?.addEventListener('change', (e) => {
            this.toggleAudioOptions(e.target.checked);
        });

        // HIER IST DER EVENT LISTENER FÜR DIE NEUE FUNKTION
        document.getElementById('enhancePrompt')?.addEventListener('click', () => this.enhancePrompt());
    }
    
    // HIER IST DIE AKTUALISIERTE FUNKTION
    async enhancePrompt() {
        const promptInput = document.getElementById('videoPrompt');
        const enhanceButton = document.getElementById('enhancePrompt');
        if (!promptInput || !enhanceButton) return;

        const originalPrompt = promptInput.value;
        if (!originalPrompt || originalPrompt.length < 10) {
            alert('Bitte geben Sie zuerst einen aussagekräftigen Prompt mit mindestens 10 Zeichen ein.');
            return;
        }

        // Button während der Anfrage deaktivieren
        enhanceButton.disabled = true;
        enhanceButton.textContent = 'Verbessere...';

        try {
            // Senden Sie den aktuellen Prompt an Ihre neue API-Route
            const response = await fetch('/api/enhance-prompt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: originalPrompt }),
            });

            if (!response.ok) {
                // Fehlerbehandlung, falls der Server einen Fehler meldet
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ein unbekannter Fehler ist aufgetreten.');
            }

            const data = await response.json();

            // Aktualisieren Sie das Textfeld mit dem verbesserten Prompt
            promptInput.value = data.enhancedPrompt;

        } catch (error) {
            console.error('Fehler beim Verbessern des Prompts:', error);
            alert(`Die Verbesserung konnte nicht durchgeführt werden: ${error.message}`);
        } finally {
            // Button am Ende wieder aktivieren, egal ob erfolgreich oder nicht
            enhanceButton.disabled = false;
            enhanceButton.textContent = '✨ Prompt verbessern';
        }
    }

    async handleImageUpload(event) {
         // ... (Dieser Teil bleibt unverändert)
    }

    removeImage() {
         // ... (Dieser Teil bleibt unverändert)
    }

    selectStyle(card) {
         // ... (Dieser Teil bleibt unverändert)
    }

    selectMotion(card) {
        // ... (Dieser Teil bleibt unverändert)
    }

    toggleAudioOptions(enabled) {
        // ... (Dieser Teil bleibt unverändert)
    }
    
    // ... (alle weiteren Funktionen der Klasse bis zum Ende)
    // ...
    // updatePromptPreview(), generateFullPrompt(), collectFormData(), etc.
    // ...
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'video') {
        window.videoModule = new VideoModule();
        window.videoModule.init();
    }
});

// Export for global access
window.VideoModule = VideoModule;
