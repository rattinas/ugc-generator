// api.js - API Communication Layer with Google Drive Integration

class API {
    constructor() {
        this.baseUrl = window.location.origin;
        this.webhookUrl = '/api/webhook';
        this.uploadUrl = '/api/upload';
        this.makeWebhookUrl = 'https://hook.eu2.make.com/n2qhklk2qaxq54ojjyp734jmpsxswmql';
    }

    // ============================================
    // PROJECT SUBMISSION WITH DRIVE
    // ============================================
    async submitProject(projectData) {
        try {
            // Get Google Drive folder from localStorage
            const driveFolder = localStorage.getItem('drive_folder_link');
            if (!driveFolder) {
                throw new Error('Google Drive Ordner nicht konfiguriert. Bitte im Dashboard einrichten.');
            }

            // Get user info
            const userInfo = localStorage.getItem('ai_studio_user');
            const user = userInfo ? JSON.parse(userInfo) : { email: 'unknown' };

            // First upload the image to temporary storage
            let imageUrl = null;
            if (projectData.image) {
                const uploadResult = await this.uploadImage(projectData.image);
                if (!uploadResult.success) {
                    throw new Error('Bild-Upload fehlgeschlagen');
                }
                imageUrl = uploadResult.imageUrl;
            }

            // Prepare complete webhook data with Drive integration
            const webhookData = {
                // Meta Information
                webhook_type: projectData.projectType || 'unknown',
                timestamp: new Date().toISOString(),
                user_email: user.email,
                
                // Google Drive Configuration
                google_drive_folder: driveFolder,
                
                // Image Data
                image_url: imageUrl,
                image_base64: projectData.image, // Send base64 for Make.com to upload to Drive
                
                // Project Specifications
                specifications: projectData.specifications || {},
                
                // AI Prompt Matrix
                prompt_matrix: this.generatePromptMatrix(projectData),
                
                // Additional Settings
                variations: projectData.variations || 1,
                quality: projectData.quality || 'high',
                
                // Instructions for Make.com
                make_instructions: {
                    upload_to_drive: true,
                    drive_folder_link: driveFolder,
                    organize_by_date: true,
                    create_subfolder: projectData.projectType,
                    notify_slack: true,
                    return_drive_links: true
                }
            };

            console.log('📤 Sending to Make.com with Drive integration:', webhookData);

            // Send to webhook
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.status}`);
            }

            const result = await response.json();
            
            console.log('✅ Make.com response:', result);
            
            return { 
                success: true, 
                message: 'Projekt erfolgreich gesendet. Bilder werden in Google Drive hochgeladen.',
                result 
            };
            
        } catch (error) {
            console.error('❌ Project submission error:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }

    // ============================================
    // GENERATE PROMPT MATRIX
    // ============================================
    generatePromptMatrix(projectData) {
        const { projectType, specifications } = projectData;
        
        // Base prompt structure based on PROMPT_MATRIX
        let promptMatrix = {
            agent: projectType,
            base_prompt: '',
            style_modifiers: [],
            technical_specs: {},
            quality_requirements: {}
        };

        switch(projectType) {
            case 'fashion':
                promptMatrix = this.generateFashionPrompt(specifications);
                break;
            case 'product':
                promptMatrix = this.generateProductPrompt(specifications);
                break;
            case 'beauty':
                promptMatrix = this.generateBeautyPrompt(specifications);
                break;
            case 'food':
                promptMatrix = this.generateFoodPrompt(specifications);
                break;
            case 'jewelry':
                promptMatrix = this.generateJewelryPrompt(specifications);
                break;
            case 'sports':
                promptMatrix = this.generateSportsPrompt(specifications);
                break;
            default:
                promptMatrix.base_prompt = 'Professional product photography';
        }

        return promptMatrix;
    }

    // ============================================
    // FASHION PROMPT GENERATION
    // ============================================
    generateFashionPrompt(specs) {
        const { category, style, modelAction, modelType, location, mood } = specs;
        
        let prompt = {
            base_prompt: '',
            style_modifiers: [],
            technical_specs: {},
            model_direction: {}
        };

        // Base action prompt
        const actionPrompts = {
            'wearing': `${modelType} model wearing and showcasing ${category}`,
            'holding': `${modelType} model holding up ${category} to display`,
            'trying-on': `${modelType} model in the process of trying on ${category}`,
            'walking': `${modelType} model walking confidently while wearing ${category}`,
            'sitting': `${modelType} model sitting elegantly in ${category}`,
            'posing': `${modelType} model posing professionally in ${category}`,
            'mirror-pose': `${modelType} model taking mirror selfie wearing ${category}`,
            'casual-selfie': `${modelType} model taking casual selfie with ${category}`
        };

        prompt.base_prompt = actionPrompts[modelAction] || `${modelType} model with ${category}`;

        // Style-specific modifications
        if (style === 'ugc') {
            prompt.style_modifiers.push('Authentic user-generated content aesthetic');
            prompt.style_modifiers.push('Natural, unposed feeling');
            prompt.style_modifiers.push('Shot with phone camera quality');
            prompt.style_modifiers.push('Casual home environment');
        } else if (style === 'mirror-selfie') {
            prompt.style_modifiers.push('Mirror selfie composition');
            prompt.style_modifiers.push('Phone visible in hand');
            prompt.style_modifiers.push('Bedroom or bathroom mirror setting');
            prompt.style_modifiers.push('Trendy Gen-Z pose');
        } else if (style === 'iphone') {
            prompt.style_modifiers.push(`Shot with ${specs.iphoneModel || 'iPhone 15 Pro'}`);
            prompt.style_modifiers.push('Mobile photography aesthetic');
            prompt.style_modifiers.push('Portrait mode depth effect');
            prompt.style_modifiers.push('Natural handheld camera angle');
        }

        // Location and mood
        prompt.technical_specs = {
            location: location,
            lighting: specs.lighting || 'natural',
            mood: mood,
            composition: specs.socialStyle === 'instagram' ? 'Square format, Instagram-ready' : 'Standard composition'
        };

        // Model specifications
        prompt.model_direction = {
            body_type: specs.bodyType,
            ethnicity: specs.ethnicity,
            expression: mood === 'playful' ? 'Smiling, energetic' : 
                       mood === 'elegant' ? 'Sophisticated, poised' :
                       mood === 'edgy' ? 'Cool, confident' : 'Natural, relaxed',
            pose_style: modelAction
        };

        return prompt;
    }

    // ============================================
    // PRODUCT PROMPT GENERATION
    // ============================================
    generateProductPrompt(specs) {
        const { category, interaction, handAppearance } = specs;
        
        let prompt = {
            base_prompt: '',
            interaction_details: {},
            hand_specifications: {}
        };

        // Interaction-based prompts
        const interactions = {
            'holding': `Hands holding ${category} product naturally`,
            'using': `Person actively using ${category} product`,
            'applying': `Hands applying or installing ${category} product`,
            'displaying': `Hands presenting ${category} product to camera`,
            'unboxing': `Hands unboxing ${category} product`,
            'comparing': `Hands comparing two ${category} products`
        };

        prompt.base_prompt = interactions[interaction] || `Product photography of ${category}`;

        // Hand specifications
        prompt.hand_specifications = {
            appearance: handAppearance || 'neutral',
            grooming: specs.nailStyle || 'natural',
            position: 'Natural grip appropriate for product',
            visibility: 'Clear view of product and hands'
        };

        // Specific product actions
        if (category === 'cosmetics') {
            prompt.interaction_details = {
                action: 'Applying product to skin',
                texture_visible: true,
                effect_shown: true
            };
        } else if (category === 'electronics') {
            prompt.interaction_details = {
                action: 'Operating device naturally',
                screen_visible: true,
                functionality_shown: true
            };
        }

        return prompt;
    }

    // ============================================
    // IMAGE UPLOAD
    // ============================================
    async uploadImage(base64Image) {
        try {
            const response = await fetch(this.uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ image: base64Image })
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Image upload error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // BEAUTY PROMPT GENERATION
    // ============================================
    generateBeautyPrompt(specs) {
        return {
            base_prompt: `Beauty photography: ${specs.category} product ${specs.shotType}`,
            style_modifiers: [`Focus on ${specs.focusArea}`, `${specs.makeupLevel} makeup look`],
            technical_specs: { lighting: specs.lighting, location: specs.location }
        };
    }

    // ============================================
    // FOOD PROMPT GENERATION
    // ============================================
    generateFoodPrompt(specs) {
        return {
            base_prompt: `Food photography: ${specs.category} in ${specs.style} style`,
            style_modifiers: [`${specs.presentation} presentation`, `${specs.angle} camera angle`],
            technical_specs: { lighting: specs.lighting, props: specs.props }
        };
    }

    // ============================================
    // JEWELRY PROMPT GENERATION
    // ============================================
    generateJewelryPrompt(specs) {
        return {
            base_prompt: `Luxury jewelry photography: ${specs.category} ${specs.style}`,
            style_modifiers: [`${specs.material} material`, `${specs.lighting} lighting`],
            technical_specs: { background: specs.background, reflections: specs.reflections }
        };
    }

    // ============================================
    // SPORTS PROMPT GENERATION
    // ============================================
    generateSportsPrompt(specs) {
        return {
            base_prompt: `Sports photography: ${specs.category} in ${specs.action} action`,
            style_modifiers: [`${specs.intensity} intensity`, `${specs.location} setting`],
            technical_specs: { mood: specs.mood, weather: specs.weather }
        };
    }

    // ============================================
    // DIRECT MAKE.COM WEBHOOK
    // ============================================
    async sendToMake(data) {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Make.com webhook error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    validateImageFile(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            return { valid: false, error: 'Ungültiger Dateityp. Erlaubt: JPG, PNG, WebP' };
        }

        if (file.size > maxSize) {
            return { valid: false, error: 'Datei zu groß. Maximum: 10MB' };
        }

        return { valid: true };
    }

    async compressImage(file, maxWidth = 1920, quality = 0.85) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', quality);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
}

// Create global instance
window.API = new API();
