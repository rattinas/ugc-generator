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
        const defaults = {
            'custom': {
                prompt: '',
                style: 'professional',
                motion: 'smooth',
                camera: 'dynamic',
                includeSound: true
            },
            'product-demo': {
                prompt: 'Product demonstration showing features and usage',
                style: 'professional',
                motion: 'smooth',
                camera: 'dynamic',
                includeSound: true
            },
            'fashion-video': {
                prompt: 'Fashion model showcasing clothing with movement',
                style: 'trendy',
                motion: 'flowing',
                camera: '360-rotation',
                includeSound: true
            },
            'unboxing': {
                prompt: 'Hands opening package and revealing product',
                style: 'authentic',
                motion: 'deliberate',
                camera: 'top-down',
                includeSound: true,
                soundEffects: 'ASMR unboxing sounds'
            },
            'beauty-tutorial': {
                prompt: 'Beauty product application demonstration',
                style: 'clean',
                motion: 'precise',
                camera: 'close-up',
                includeSound: true
            },
            'food-prep': {
                prompt: 'Food preparation and cooking process',
                style: 'appetizing',
                motion: 'dynamic',
                camera: 'overhead',
                includeSound: true,
                soundEffects: 'sizzling, chopping sounds'
            },
            'action-sports': {
                prompt: 'Athletic movement and sports action',
                style: 'energetic',
                motion: 'fast-paced',
                camera: 'tracking',
                includeSound: true
            }
        };

        const typeDefaults = defaults[this.videoType] || defaults['product-demo'];
        Object.assign(this.formData, typeDefaults);
        this.updateUIWithDefaults();
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

        // Prompt Enhancement
        document.getElementById('enhancePrompt')?.addEventListener('click', () => this.enhancePrompt());
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const validation = window.API?.validateImageFile(file);
        if (!validation?.valid) {
            alert(validation?.error || 'Ungültiges Bild');
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
        document.querySelectorAll('.video-style-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.style = card.dataset.style;
        this.updatePromptPreview();
    }

    selectMotion(card) {
        document.querySelectorAll('.motion-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.formData.motion = card.dataset.motion;
        this.updatePromptPreview();
    }

    toggleAudioOptions(enabled) {
        const audioDetails = document.getElementById('audioDetails');
        if (audioDetails) {
            audioDetails.style.display = enabled ? 'block' : 'none';
        }
        this.formData.audio.includeAudio = enabled;
    }

    enhancePrompt() {
        const promptInput = document.getElementById('videoPrompt');
        if (!promptInput) return;

        // Add video-specific enhancements
        const enhancements = {
            'product-demo': ', showing product features clearly, professional lighting, smooth camera movement',
            'fashion-video': ', model walking confidently, fashion runway style, elegant movement',
            'unboxing': ', hands carefully opening package, ASMR style, satisfying reveal moment',
            'beauty-tutorial': ', step-by-step application, clear visibility of product and technique',
            'food-prep': ', appetizing food preparation, steam and sizzle effects, professional cooking',
            'action-sports': ', dynamic athletic movement, high energy, powerful motion'
        };

        const currentPrompt = promptInput.value;
        const enhancement = enhancements[this.videoType] || '';
        
        if (!currentPrompt.includes(enhancement)) {
            promptInput.value = currentPrompt + enhancement;
        }
    }

    updatePromptPreview() {
        const preview = document.getElementById('promptPreview');
        if (!preview) return;

        const fullPrompt = this.generateFullPrompt();
        preview.textContent = fullPrompt;
    }

    generateFullPrompt() {
        const { prompt, style, motion, camera, audio } = this.formData;
        
        let fullPrompt = prompt;
        
        // Add style descriptors
        const styleDescriptors = {
            'professional': 'professional quality, clean and polished',
            'authentic': 'authentic user-generated style, natural and real',
            'cinematic': 'cinematic quality, dramatic lighting',
            'trendy': 'trendy social media style, vibrant and engaging',
            'minimal': 'minimalist aesthetic, clean composition'
        };
        
        if (styleDescriptors[style]) {
            fullPrompt += `, ${styleDescriptors[style]}`;
        }

        // Add motion descriptors
        const motionDescriptors = {
            'smooth': 'smooth and fluid motion',
            'dynamic': 'dynamic and energetic movement',
            'slow-motion': 'slow-motion effect for dramatic impact',
            'fast-paced': 'fast-paced action',
            'steady': 'steady and controlled movement'
        };
        
        if (motionDescriptors[motion]) {
            fullPrompt += `, ${motionDescriptors[motion]}`;
        }

        // Add camera movement
        const cameraDescriptors = {
            'static': 'static camera, fixed position',
            'pan': 'camera panning smoothly',
            'zoom': 'camera zooming for emphasis',
            'tracking': 'camera tracking the subject',
            '360-rotation': '360-degree rotation around subject',
            'handheld': 'handheld camera for authentic feel'
        };
        
        if (cameraDescriptors[camera]) {
            fullPrompt += `, ${cameraDescriptors[camera]}`;
        }

        // Add audio instructions if enabled
        if (audio.includeAudio) {
            fullPrompt += '. Audio: ';
            const audioElements = [];
            
            if (audio.soundEffects) audioElements.push('natural sound effects');
            if (audio.dialogue) audioElements.push('spoken dialogue');
            if (audio.music) audioElements.push('background music');
            
            if (audioElements.length > 0) {
                fullPrompt += audioElements.join(', ');
            }
            
            if (audio.audioDescription) {
                fullPrompt += `. ${audio.audioDescription}`;
            }
        }

        return fullPrompt;
    }

    collectFormData() {
        this.formData.videoType = this.videoType;
        this.formData.prompt = document.getElementById('videoPrompt')?.value || '';
        this.formData.aspectRatio = document.getElementById('aspectRatio')?.value || '16:9';
        this.formData.camera = document.getElementById('cameraMovement')?.value || 'dynamic';
        
        // Audio settings
        this.formData.audio.includeAudio = document.getElementById('includeAudio')?.checked || false;
        this.formData.audio.soundEffects = document.getElementById('soundEffects')?.checked || false;
        this.formData.audio.dialogue = document.getElementById('dialogue')?.checked || false;
        this.formData.audio.music = document.getElementById('backgroundMusic')?.checked || false;
        this.formData.audio.audioDescription = document.getElementById('audioDescription')?.value || '';
        
        this.formData.additionalInstructions = document.getElementById('additionalInstructions')?.value || '';
    }

    validateCurrentStep() {
        this.collectFormData();
        
        switch(this.currentStep) {
            case 1:
                if (!this.uploadedFile) {
                    alert('Bitte lade ein Ausgangsbild hoch!');
                    return false;
                }
                return true;
            
            case 2:
                if (!this.formData.prompt) {
                    alert('Bitte beschreibe dein Video!');
                    return false;
                }
                if (this.formData.prompt.length < 10) {
                    alert('Bitte gib eine detailliertere Beschreibung ein!');
                    return false;
                }
                return true;
            
            case 3:
                if (!this.formData.style) {
                    alert('Bitte wähle einen Video-Stil!');
                    return false;
                }
                if (!this.formData.motion) {
                    alert('Bitte wähle einen Bewegungstyp!');
                    return false;
                }
                return true;
            
            default:
                return true;
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
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });
        
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

    updateSummary() {
        this.collectFormData();
        const summaryContent = document.getElementById('summaryContent');
        if (summaryContent) {
            summaryContent.innerHTML = `
                <div class="summary-item">
                    <span class="summary-label">Video-Typ:</span>
                    <span class="summary-value">${this.videoType.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Prompt:</span>
                    <span class="summary-value">${this.formData.prompt.substring(0, 50)}...</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Stil:</span>
                    <span class="summary-value">${this.formData.style}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Audio:</span>
                    <span class="summary-value">${this.formData.audio.includeAudio ? 'Ja' : 'Nein'}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Seitenverhältnis:</span>
                    <span class="summary-value">${this.formData.aspectRatio}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Dauer:</span>
                    <span class="summary-value">8 Sekunden</span>
                </div>
            `;
        }
    }

    updateUIWithDefaults() {
        // Update UI elements with default values
        const promptInput = document.getElementById('videoPrompt');
        if (promptInput) promptInput.value = this.formData.prompt;
        
        // Update other UI elements as needed
    }

    async submit() {
        // Cost warning before submission
        const costWarning = 'LETZTE WARNUNG:\n\n' +
                          'Dieses Video kostet 4.00 CHF (8 Sekunden × 0.50 CHF).\n\n' +
                          'Die Kosten werden SOFORT berechnet.\n\n' +
                          'Bist du absolut sicher?';
        
        if (!confirm(costWarning)) {
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = '⏳ Video wird vorbereitet...';
        }

        try {
            // Upload image first
            console.log('📤 Uploading video source image...');
            const base64 = await window.API.fileToBase64(this.uploadedFile);
            const uploadResult = await window.API.uploadImage(base64);
            
            if (!uploadResult.success) {
                throw new Error('Bild-Upload fehlgeschlagen');
            }

            this.formData.imageUrl = uploadResult.imageUrl;
            console.log('✅ Image uploaded:', this.formData.imageUrl);

            // Collect all form data
            this.collectFormData();

            // Generate full prompt
            const fullPrompt = this.generateFullPrompt();

            // Prepare video project data for Veo 3
            const videoProjectData = {
                webhook_type: 'video_generation',
                api: 'veo3',
                timestamp: new Date().toISOString(),
                user_email: JSON.parse(localStorage.getItem('ai_studio_user') || '{}').email || 'unknown',
                
                // Google Drive Configuration
                google_drive_folder: localStorage.getItem('drive_folder_link'),
                
                // Video specifications
                video_specs: {
                    type: this.videoType,
                    source_image: this.formData.imageUrl,
                    prompt: fullPrompt,
                    style: this.formData.style,
                    motion: this.formData.motion,
                    camera: this.formData.camera,
                    duration: this.formData.duration,
                    aspect_ratio: this.formData.aspectRatio,
                    resolution: this.formData.resolution
                },
                
                // Audio specifications
                audio_specs: {
                    include_audio: this.formData.audio.includeAudio,
                    sound_effects: this.formData.audio.soundEffects,
                    dialogue: this.formData.audio.dialogue,
                    music: this.formData.audio.music,
                    audio_description: this.formData.audio.audioDescription
                },
                
                // Additional instructions
                additional_instructions: this.formData.additionalInstructions,
                
                // Make.com instructions
                make_instructions: {
                    use_veo3_api: true,
                    upload_to_drive: true,
                    drive_folder_link: localStorage.getItem('drive_folder_link'),
                    create_subfolder: 'videos',
                    notify_slack: true,
                    return_drive_links: true
                }
            };

            if (submitBtn) submitBtn.textContent = '🎬 Video wird generiert...';

            // Send to video webhook (different from image webhook)
            const response = await fetch('/api/video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(videoProjectData)
            });

            const result = await response.json();
            
            if (result.success) {
                alert('✅ Erfolgreich! Dein Video wird mit Veo 3 generiert und in Google Drive gespeichert. Dies kann 30-60 Sekunden dauern.');
                
                // Store in localStorage for history
                const videoHistory = JSON.parse(localStorage.getItem('video_history') || '[]');
                videoHistory.unshift({
                    id: Date.now(),
                    type: this.videoType,
                    prompt: fullPrompt,
                    timestamp: new Date().toISOString(),
                    status: 'processing'
                });
                localStorage.setItem('video_history', JSON.stringify(videoHistory.slice(0, 10)));
                
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 2000);
            } else {
                throw new Error(result.error || 'Video-Generierung fehlgeschlagen');
            }

        } catch (error) {
            console.error('❌ Video submit error:', error);
            alert('Fehler: ' + error.message);
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = '🎬 Video generieren';
            }
        }
    }
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
