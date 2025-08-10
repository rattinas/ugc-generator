// config.js - Zentrale Konfiguration und AI Agent Definitionen

const CONFIG = {
    api: {
        webhookUrl: '/api/webhook',
        uploadUrl: '/api/upload',
        maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    auth: {
        password: 'aistudio2024',
        sessionKey: 'ai_studio_user'
    },
    slack: {
        defaultChannel: 'ai-output'
    }
};

// AI Agent Definitionen für verschiedene Use Cases
const AI_AGENTS = {
    // Fashion Photography Agent
    fashion: {
        name: 'Fashion Photographer AI',
        systemPrompt: `You are a professional fashion photography AI specializing in apparel, accessories, and lifestyle fashion shoots. 
        You understand model positioning, garment presentation, styling, and fashion industry standards.
        
        EXPERTISE:
        - Editorial fashion photography
        - E-commerce fashion standards
        - Model direction and posing
        - Garment styling and draping
        - Fashion lighting techniques
        
        OUTPUT: Structured JSON for fashion-specific image generation including model specs, garment styling, and scene composition.`,
        
        capabilities: [
            'model_configuration',
            'outfit_styling',
            'pose_direction',
            'fashion_lighting',
            'editorial_composition'
        ]
    },

    // Product Photography Agent
    product: {
        name: 'Product Photographer AI',
        systemPrompt: `You are a specialized product photography AI focused on creating compelling product images for e-commerce.
        You excel at showcasing products in use, demonstrating features, and creating desire through visual storytelling.
        
        EXPERTISE:
        - Hero product shots
        - In-use demonstrations
        - 360° product views
        - Detail and texture shots
        - Lifestyle product integration
        - Scale and proportion representation
        
        SPECIAL FOCUS: Products being held, used, or interacted with by people in natural, compelling ways.
        
        OUTPUT: Structured JSON for product-centric image generation with emphasis on product features and human interaction.`,
        
        capabilities: [
            'product_positioning',
            'hand_modeling',
            'usage_demonstration',
            'detail_highlighting',
            'context_creation'
        ]
    },

    // Beauty & Cosmetics Agent
    beauty: {
        name: 'Beauty Photography AI',
        systemPrompt: `You are a beauty and cosmetics photography specialist AI. You understand makeup application, 
        skincare routines, hair styling, and beauty product presentation.
        
        EXPERTISE:
        - Makeup application shots
        - Skincare routine visualization
        - Hair product demonstrations
        - Before/after transformations
        - Texture and swatch photography
        - Beauty model specifications
        
        SPECIAL SKILLS:
        - Understanding skin types and tones
        - Makeup techniques and trends
        - Hair textures and styles
        - Product texture representation
        
        OUTPUT: Structured JSON for beauty-specific imagery with focus on skin, makeup, and product interaction.`,
        
        capabilities: [
            'makeup_application',
            'skin_detail',
            'hair_styling',
            'texture_shots',
            'before_after'
        ]
    },

    // Food Photography Agent
    food: {
        name: 'Food Photographer AI',
        systemPrompt: `You are a culinary photography AI specializing in food and beverage imagery for restaurants, 
        packaging, and food brands.
        
        EXPERTISE:
        - Restaurant-style plating
        - Ingredient showcasing
        - Cooking action shots
        - Beverage styling
        - Packaging hero shots
        - Food texture and steam effects
        
        OUTPUT: Structured JSON for appetizing food photography with proper styling and composition.`,
        
        capabilities: [
            'food_styling',
            'plating_composition',
            'action_cooking',
            'ingredient_display',
            'beverage_presentation'
        ]
    },

    // Jewelry & Luxury Agent
    jewelry: {
        name: 'Luxury Photography AI',
        systemPrompt: `You are a luxury goods photography AI specializing in jewelry, watches, and high-end accessories.
        
        EXPERTISE:
        - Macro jewelry details
        - Luxury product staging
        - Reflective surface management
        - Elegant hand modeling
        - Premium packaging shots
        
        OUTPUT: Structured JSON for luxury product photography with emphasis on craftsmanship and prestige.`,
        
        capabilities: [
            'macro_detail',
            'luxury_staging',
            'reflection_control',
            'elegant_modeling',
            'premium_presentation'
        ]
    },

    // Sports & Fitness Agent
    sports: {
        name: 'Sports Photography AI',
        systemPrompt: `You are a sports and fitness photography AI specializing in activewear, equipment, and fitness products.
        
        EXPERTISE:
        - Action sports photography
        - Equipment demonstration
        - Activewear on athletes
        - Gym and outdoor settings
        - Dynamic movement capture
        
        OUTPUT: Structured JSON for dynamic sports photography with emphasis on performance and energy.`,
        
        capabilities: [
            'action_capture',
            'equipment_demo',
            'athletic_posing',
            'dynamic_composition',
            'performance_showcase'
        ]
    }
};

// Szenen-Definitionen pro Use Case
const SCENES = {
    fashion: {
        studio: ['White Background', 'Grey Seamless', 'Colored Backdrop', 'Fashion Set'],
        lifestyle: ['Street Style', 'Café', 'Home', 'Urban', 'Nature', 'Luxury Hotel'],
        editorial: ['High Fashion', 'Avant-garde', 'Minimalist', 'Dramatic', 'Vintage'],
        commercial: ['Lookbook', 'E-commerce', 'Campaign', 'Social Media']
    },
    
    product: {
        hero: ['White Background', 'Gradient', 'Lifestyle Context', 'Branded Environment'],
        inUse: ['Hands Holding', 'Person Using', 'In Action', 'Problem Solving'],
        detail: ['Macro Close-up', 'Texture Shot', 'Features Display', 'Components'],
        context: ['On Desk', 'In Home', 'Outdoor Use', 'Professional Setting']
    },
    
    beauty: {
        application: ['Applying Makeup', 'Skincare Routine', 'Hair Styling', 'Nail Art'],
        texture: ['Product Swatch', 'Cream Texture', 'Powder Display', 'Oil Drops'],
        model: ['Face Close-up', 'Eyes Focus', 'Lips Focus', 'Full Face'],
        lifestyle: ['Morning Routine', 'Getting Ready', 'Spa Day', 'Night Routine']
    },
    
    food: {
        plated: ['Restaurant Style', 'Home Cooking', 'Fast Food', 'Fine Dining'],
        ingredients: ['Raw Display', 'Prep Station', 'Fresh Market', 'Artisanal'],
        action: ['Cooking Process', 'Pouring', 'Cutting', 'Mixing', 'Serving'],
        packaging: ['Product Hero', 'In Store', 'Unboxing', 'Brand Focus']
    },
    
    jewelry: {
        worn: ['On Model', 'Hand Model', 'Neck Focus', 'Ear Focus', 'Wrist Focus'],
        display: ['Jewelry Box', 'Velvet Display', 'Museum Style', 'Boutique Window'],
        macro: ['Diamond Detail', 'Engraving', 'Gemstone', 'Mechanism'],
        lifestyle: ['Luxury Event', 'Daily Wear', 'Gift Giving', 'Wedding']
    },
    
    sports: {
        action: ['Running', 'Training', 'Competition', 'Stretching', 'Victory'],
        equipment: ['Product Focus', 'In Use', 'Technical Details', 'Comparison'],
        lifestyle: ['Gym', 'Outdoor', 'Home Workout', 'Team Sport', 'Solo Training'],
        results: ['Before/After', 'Progress', 'Achievement', 'Transformation']
    }
};

// Preset-Konfigurationen
const PRESETS = {
    quickShots: {
        fashion_quick: {
            name: 'Quick Fashion',
            style: 'ecommerce',
            scene: 'White Background',
            model: { age: '25-35', ethnicity: 'diverse' },
            lighting: 'studio',
            quality: 'high'
        },
        product_hero: {
            name: 'Product Hero',
            style: 'hero',
            scene: 'Gradient',
            lighting: 'soft_box',
            quality: 'ultra'
        },
        beauty_swatch: {
            name: 'Beauty Swatch',
            style: 'texture',
            scene: 'Product Swatch',
            lighting: 'natural',
            quality: 'high'
        }
    }
};

// Export für andere Module
window.CONFIG = CONFIG;
window.AI_AGENTS = AI_AGENTS;
window.SCENES = SCENES;
window.PRESETS = PRESETS;