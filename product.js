// product.js - Product Photography Module

class ProductPhotography {
    constructor() {
        this.agent = AI_AGENTS.product;
        this.scenes = SCENES.product;
        this.currentStep = 1;
        this.totalSteps = 5;
        this.productData = {
            image: null,
            imageUrl: null,
            category: '',
            style: '',
            scene: '',
            usage: {},
            technical: {},
            variations: 1
        };
    }

    init() {
        this.setupEventListeners();
        this.loadScenes();
        this.initializeSliders();
    }

    setupEventListeners() {
        // Product category selection
        document.querySelectorAll('.product-category').forEach(cat => {
            cat.addEventListener('click', (e) => {
                this.selectCategory(e.target.dataset.category);
            });
        });

        // Usage type selection
        document.querySelectorAll('.usage-type').forEach(type => {
            type.addEventListener('click', (e) => {
                this.selectUsageType(e.target.dataset.usage);
            });
        });

        // Form submission
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitProduct();
        });
    }

    selectCategory(category) {
        this.productData.category = category;
        
        // Update UI
        document.querySelectorAll('.product-category').forEach(cat => {
            cat.classList.remove('selected');
        });
        event.target.classList.add('selected');

        // Load category-specific options
        this.loadCategoryOptions(category);
    }

    loadCategoryOptions(category) {
        const options = {
            electronics: {
                scenes: ['On Desk Setup', 'In Hands Using', 'Unboxing', 'Technical Details', 'Lifestyle Context'],
                props: ['Tech accessories', 'Modern desk', 'Cables', 'Packaging'],
                lighting: ['Soft studio', 'Natural window', 'RGB accent', 'Clean white']
            },
            cosmetics: {
                scenes: ['Hand Holding', 'Bathroom Counter', 'Vanity Setup', 'In Use Application', 'Texture Display'],
                props: ['Flowers', 'Mirror', 'Brushes', 'Towels', 'Other products'],
                lighting: ['Soft beauty', 'Natural daylight', 'Ring light', 'Golden hour']
            },
            homegoods: {
                scenes: ['Room Setting', 'Styled Surface', 'In Use Demo', 'Multiple Angles', 'Detail Shots'],
                props: ['Plants', 'Books', 'Decor items', 'Furniture'],
                lighting: ['Warm home', 'Natural light', 'Cozy evening', 'Bright airy']
            },
            toys: {
                scenes: ['Kids Playing', 'Playroom Setup', 'Outdoor Fun', 'Unboxing Joy', 'Educational Use'],
                props: ['Other toys', 'Colorful background', 'Play mat', 'Kids furniture'],
                lighting: ['Bright cheerful', 'Soft natural', 'Colorful', 'Studio clean']
            },
            tools: {
                scenes: ['In Use Action', 'Workshop Setting', 'Before/After', 'Professional Use', 'Detail Function'],
                props: ['Work surface', 'Other tools', 'Materials', 'Safety gear'],
                lighting: ['Industrial', 'Garage lighting', 'Outdoor work', 'Studio technical']
            }
        };

        const categoryOptions = options[category] || options.electronics;
        this.updateSceneOptions(categoryOptions);
    }

    selectUsageType(usage) {
        this.productData.usage = {
            type: usage,
            details: this.getUsageDetails(usage)
        };

        // Update UI based on usage type
        this.updateUsageUI(usage);
    }

    getUsageDetails(usage) {
        const details = {
            holding: {
                prompt: 'Person holding product naturally',
                hand_position: 'Natural grip',
                interaction: 'Examining product',
                expression: 'Interested, pleased'
            },
            using: {
                prompt: 'Actively using the product',
                hand_position: 'Functional grip',
                interaction: 'Demonstrating features',
                expression: 'Focused, satisfied'
            },
            displaying: {
                prompt: 'Presenting product to camera',
                hand_position: 'Presentational',
                interaction: 'Showing features',
                expression: 'Enthusiastic, professional'
            },
            applying: {
                prompt: 'Applying or installing product',
                hand_position: 'Precise handling',
                interaction: 'Step-by-step process',
                expression: 'Concentrated, careful'
            }
        };
        
        return details[usage] || details.holding;
    }

    async submitProduct() {
        // Validate form
        if (!this.validateForm()) return;

        // Show loading
        this.showLoading(true);

        try {
            // Upload image first
            const imageUrl = await this.uploadImage();
            this.productData.imageUrl = imageUrl;

            // Prepare complete data for AI
            const requestData = {
                agent: 'product',
                productData: this.productData,
                instructions: this.generateInstructions(),
                timestamp: new Date().toISOString()
            };

            // Send to webhook
            const response = await API.sendToWebhook(requestData);
            
            if (response.success) {
                this.showSuccess();
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.showLoading(false);
        }
    }

    generateInstructions() {
        const { category, usage, scene, technical } = this.productData;
        
        return {
            primary: `Create ${category} product photography with ${usage.type} demonstration`,
            scene: scene,
            usage_details: usage.details,
            technical_specs: technical,
            style_notes: this.getStyleNotes(),
            quality_requirements: this.getQualityRequirements()
        };
    }

    getStyleNotes() {
        const style = document.getElementById('productStyle')?.value || 'commercial';
        
        const styles = {
            commercial: 'Clean, professional, market-ready imagery with perfect lighting',
            lifestyle: 'Natural, relatable context showing real-world product use',
            minimal: 'Simple, elegant presentation with focus on product form',
            dramatic: 'Bold lighting and composition for impact',
            technical: 'Detailed, informative shots highlighting features'
        };
        
        return styles[style];
    }

    getQualityRequirements() {
        return {
            resolution: 'High resolution for zoom capability',
            focus: 'Sharp product focus with appropriate depth of field',
            color: 'Accurate color representation',
            lighting: 'No harsh shadows on product',
            composition: 'Product as hero with supporting context'
        };
    }

    validateForm() {
        const required = ['category', 'scene', 'usage'];
        for (let field of required) {
            if (!this.productData[field]) {
                alert(`Bitte wähle: ${field}`);
                return false;
            }
        }
        return true;
    }

    async uploadImage() {
        const file = document.getElementById('productImage').files[0];
        if (!file) throw new Error('Kein Bild ausgewählt');
        
        const base64 = await this.fileToBase64(file);
        const response = await API.uploadImage(base64);
        
        if (!response.success) {
            throw new Error('Bild-Upload fehlgeschlagen');
        }
        
        return response.imageUrl;
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    showLoading(show) {
        const btn = document.getElementById('submitBtn');
        if (btn) {
            btn.disabled = show;
            btn.textContent = show ? 'Wird verarbeitet...' : 'Generieren';
        }
    }

    showSuccess() {
        alert('✅ Erfolgreich! Bilder werden generiert und in Slack gepostet.');
        this.resetForm();
    }

    showError(message) {
        alert(`❌ Fehler: ${message}`);
    }

    resetForm() {
        document.getElementById('productForm')?.reset();
        this.productData = {
            image: null,
            imageUrl: null,
            category: '',
            style: '',
            scene: '',
            usage: {},
            technical: {},
            variations: 1
        };
        document.querySelectorAll('.selected').forEach(el => {
            el.classList.remove('selected');
        });
    }

    // Spezielle Funktionen für Objektfotografie
    setupObjectPhotography() {
        // Hand modeling options
        const handOptions = {
            gender: ['female', 'male', 'neutral'],
            age: ['young', 'middle', 'mature'],
            skin_tone: ['light', 'medium', 'dark', 'varied'],
            nail_style: ['natural', 'manicured', 'colored', 'short'],
            jewelry: ['none', 'minimal', 'rings', 'watch']
        };

        // Action types for products
        const actionTypes = {
            beauty: ['applying', 'spraying', 'spreading', 'dabbing', 'brushing'],
            tech: ['typing', 'swiping', 'holding', 'pressing', 'connecting'],
            food: ['pouring', 'cutting', 'mixing', 'serving', 'opening'],
            tools: ['gripping', 'turning', 'measuring', 'cutting', 'assembling']
        };

        return { handOptions, actionTypes };
    }

    // Preset für Hairspray-Beispiel
    createHairsprayPreset() {
        return {
            category: 'beauty',
            product_type: 'hairspray',
            scene: 'bathroom_mirror',
            action: {
                type: 'spraying',
                description: 'Woman spraying hairspray into styled hair',
                hand_position: 'Holding can 6 inches from head',
                spray_effect: 'Visible mist cloud',
                hair_movement: 'Slight movement from spray force'
            },
            model: {
                gender: 'female',
                age: '25-35',
                hair: 'Styled updo or waves',
                expression: 'Focused on mirror',
                clothing: 'Robe or casual top'
            },
            technical: {
                angle: 'Over shoulder or side profile',
                lighting: 'Bathroom vanity lighting',
                focus: 'Sharp on product and action',
                motion: 'Frozen spray moment'
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.dataset.page === 'product') {
        const productPhoto = new ProductPhotography();
        productPhoto.init();
    }
});