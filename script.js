// Constants
const WEBHOOK_URL = '/api/webhook';
const PASSWORD = 'fashion2024';

// State
let currentStep = 1;
let currentUser = null;
let hasImage = false;
let selectedStyle = '';
let selectedScene = '';

// Scene definitions per style
const scenes = {
    ecommerce: [
        'Freisteller weiß',
        'Ghost Mannequin',
        'Flat Lay',
        'Detail Shot',
        'Hanging',
        '360 View'
    ],
    lifestyle: [
        'Street Casual',
        'Café',
        'Home Cozy',
        'Park',
        'Shopping',
        'Travel',
        'Office',
        'Date Night',
        'Weekend',
        'Sport Activity'
    ],
    editorial: [
        'High Fashion Studio',
        'Avant-garde',
        'Minimalist',
        'Dramatic Lighting',
        'Outdoor Editorial',
        'Urban Editorial',
        'Nature Editorial',
        'Vintage Style',
        'Futuristic',
        'Artistic Abstract'
    ],
    commercial: [
        'Lookbook Clean',
        'Campaign Hero',
        'Social Media',
        'Billboard Style',
        'E-commerce Premium',
        'Catalog',
        'Website Banner',
        'Instagram Ad',
        'Influencer Style'
    ],
    ugc: [
        'Mirror Selfie',
        'OOTD',
        'Haul/Unboxing',
        'Real Life',
        'BeReal Style',
        'TikTok Style',
        'Instagram Story',
        'Casual Snap',
        'Friend Photo'
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const storedUser = localStorage.getItem('fashion_user');
    if (storedUser) {
        currentUser = storedUser;
        document.getElementById('userBadge').textContent = '@' + storedUser;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').classList.add('active');
    }
   
    initializeEventListeners();
    initializeSliders();
});

// Login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const password = document.getElementById('password').value;
    const username = document.getElementById('slackUsername').value.replace('@', '');
   
    if (password === PASSWORD) {
        currentUser = username;
        localStorage.setItem('fashion_user', username);
        document.getElementById('userBadge').textContent = '@' + username;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appContainer').classList.add('active');
    } else {
        alert('Falsches Passwort!');
    }
});

function logout() {
    localStorage.removeItem('fashion_user');
    location.reload();
}

// Navigation
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 5) {
            completeStep(currentStep);
            currentStep++;
            showStep(currentStep);
        }
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

function showStep(step) {
    // Update sections
    document.querySelectorAll('.form-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelector(`[data-section="${step}"]`).classList.add('active');
   
    // Update indicators
    document.querySelectorAll('.step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
   
    // Update navigation
    document.getElementById('prevBtn').style.display = step === 1 ? 'none' : 'block';
    document.getElementById('nextBtn').style.display = step === 5 ? 'none' : 'block';
    document.getElementById('submitBtn').style.display = step === 5 ? 'block' : 'none';
}

function completeStep(step) {
    document.querySelector(`[data-step="${step}"]`).classList.add('completed');
}

function validateCurrentStep() {
    switch(currentStep) {
        case 1:
            if (!hasImage) {
                alert('Bitte lade ein Bild hoch!');
                return false;
            }
            return true;
        case 2:
            if (!selectedStyle) {
                alert('Bitte wähle einen Stil!');
                return false;
            }
            return true;
        case 3:
            if (!selectedScene) {
                alert('Bitte wähle eine Szene!');
                return false;
            }
            return true;
        default:
            return true;
    }
}

// Image Upload
document.getElementById('imageInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Bild ist zu groß! Max. 10MB');
            return;
        }
       
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('imagePreview').classList.add('show');
            document.getElementById('uploadArea').classList.add('has-image');
            hasImage = true;
        };
        reader.readAsDataURL(file);
    }
});

function removeImage(e) {
    e.stopPropagation();
    document.getElementById('imageInput').value = '';
    document.getElementById('uploadPlaceholder').style.display = 'block';
    document.getElementById('imagePreview').classList.remove('show');
    document.getElementById('uploadArea').classList.remove('has-image');
    hasImage = false;
}

// Style Selection
function initializeEventListeners() {
    // Style cards
    document.querySelectorAll('.style-card').forEach(card => {
        card.addEventListener('click', function() {
            document.querySelectorAll('.style-card').forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            selectedStyle = this.dataset.style;
            document.getElementById('selectedStyle').value = selectedStyle;
            loadScenes(selectedStyle);
        });
    });
}

// Load scenes based on style
function loadScenes(style) {
    const container = document.getElementById('sceneContainer');
    const sceneList = scenes[style] || [];
   
    container.innerHTML = '<div class="scene-grid">' +
        sceneList.map(scene => `
            <div class="scene-item" data-scene="${scene}">
                ${scene}
            </div>
        `).join('') +
    '</div>';
   
    // Add click handlers
    document.querySelectorAll('.scene-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.scene-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            selectedScene = this.dataset.scene;
            document.getElementById('selectedScene').value = selectedScene;
        });
    });
}

// Model Presets
function applyPreset(preset) {
    const presets = {
        young_casual: {
            age: '18-25',
            gender: 'mixed',
            ethnicity: 'mixed',
            body: 'varied',
            hair: 'natural',
            makeup: 'natural',
            expression: 'smile',
            pose: 'relaxed'
        },
        business: {
            age: '25-35',
            gender: 'mixed',
            ethnicity: 'mixed',
            body: 'average',
            hair: 'professional',
            makeup: 'natural',
            expression: 'confident',
            pose: 'standing'
        },
        high_fashion: {
            age: '18-25',
            gender: 'female',
            ethnicity: 'mixed',
            body: 'slim',
            hair: 'editorial',
            makeup: 'editorial',
            expression: 'fierce',
            pose: 'editorial'
        },
        diverse_group: {
            age: 'mixed',
            gender: 'mixed',
            ethnicity: 'mixed',
            body: 'varied',
            hair: 'varied',
            makeup: 'varied',
            expression: 'candid',
            pose: 'dynamic'
        },
        mature_elegant: {
            age: '45-55',
            gender: 'female',
            ethnicity: 'caucasian',
            body: 'average',
            hair: 'styled',
            makeup: 'glamour',
            expression: 'confident',
            pose: 'standing'
        }
    };
   
    const settings = presets[preset];
    if (settings) {
        document.getElementById('modelAge').value = settings.age;
        document.getElementById('modelGender').value = settings.gender;
        document.getElementById('modelEthnicity').value = settings.ethnicity;
        document.getElementById('modelBody').value = settings.body;
        document.getElementById('modelHair').value = settings.hair;
        document.getElementById('modelMakeup').value = settings.makeup;
        document.getElementById('modelExpression').value = settings.expression;
        document.getElementById('modelPose').value = settings.pose;
       
        // Visual feedback
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    }
}

// Sliders
function initializeSliders() {
    // Quality slider
    document.getElementById('imageQuality').addEventListener('input', function() {
        const labels = ['Sehr niedrig', 'Niedrig', 'Mittel', 'Hoch', 'Ultra'];
        document.getElementById('qualityValue').textContent = labels[this.value - 1];
    });
   
    // Authenticity slider
    document.getElementById('authenticity').addEventListener('input', function() {
        const labels = ['Perfekt', 'Polished', 'Balanced', 'Natürlich', 'Raw'];
        document.getElementById('authenticityValue').textContent = labels[this.value - 1];
    });
   
    // Post-processing slider
    document.getElementById('postProcessing').addEventListener('input', function() {
        const labels = ['None', 'Minimal', 'Medium', 'Heavy', 'Extreme'];
        document.getElementById('postValue').textContent = labels[this.value - 1];
    });
}

// Form submission
document.getElementById('fashionForm').addEventListener('submit', async function(e) {
    e.preventDefault();
   
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Wird gesendet...';
   
    try {
        // First upload image
        const imageFile = document.getElementById('imageInput').files[0];
        const base64 = await toBase64(imageFile);
       
        const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64 })
        });
       
        const uploadResult = await uploadResponse.json();
       
        if (!uploadResult.success) {
            throw new Error('Bild-Upload fehlgeschlagen');
        }
       
        // Prepare complete data
        const formData = {
            user: currentUser,
            channel: document.getElementById('slackChannel').value.replace('#', ''),
            imageUrl: uploadResult.imageUrl,
            style: selectedStyle,
            scene: selectedScene,
            modelSpecs: {
                age: document.getElementById('modelAge').value,
                gender: document.getElementById('modelGender').value,
                ethnicity: document.getElementById('modelEthnicity').value,
                body: document.getElementById('modelBody').value,
                hair: document.getElementById('modelHair').value,
                makeup: document.getElementById('modelMakeup').value,
                expression: document.getElementById('modelExpression').value,
                pose: document.getElementById('modelPose').value
            },
            technical: {
                camera: document.getElementById('cameraType').value,
                lens: document.getElementById('lensType').value,
                lighting: document.getElementById('lightingType').value,
                quality: document.getElementById('imageQuality').value,
                authenticity: document.getElementById('authenticity').value,
                postProcessing: document.getElementById('postProcessing').value
            },
            imageCount: document.getElementById('imageCount').value,
            stylingDetails: document.getElementById('stylingDetails').value,
            timestamp: new Date().toISOString()
        };
       
        // Send to webhook
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
       
        const result = await response.json();
       
        if (result.success) {
            document.getElementById('successModal').classList.add('show');
            resetForm();
        } else {
            throw new Error(result.error || 'Unbekannter Fehler');
        }
       
    } catch (error) {
        alert('Fehler: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '🚀 Bilder generieren';
    }
});

// Helper functions
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}

function resetForm() {
    document.getElementById('fashionForm').reset();
    currentStep = 1;
    showStep(1);
    hasImage = false;
    selectedStyle = '';
    selectedScene = '';
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('completed');
    });
    document.querySelectorAll('.selected').forEach(el => {
        el.classList.remove('selected');
    });
    removeImage({ stopPropagation: () => {} });
}
