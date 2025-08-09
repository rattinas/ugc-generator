// components.js - Reusable UI Components

class UIComponents {
    // ============================================
    // HEADER COMPONENT
    // ============================================
    static renderHeader(user) {
        return `
            <div class="header-content">
                <h1 class="logo" onclick="window.location.href='/dashboard.html'">
                    AI<span>STUDIO</span>
                </h1>
                
                <div class="user-menu">
                    <div class="credits-display">
                        <span class="credits-icon">💳</span>
                        <span id="creditsAmount">${user?.credits || 0}</span> Credits
                    </div>
                    
                    <div class="user-dropdown">
                        <img src="${user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'U')}" 
                             alt="Avatar" class="user-avatar">
                        <span>${user?.name || 'User'}</span>
                        
                        <div class="dropdown-menu">
                            <a href="/pages/profile.html">Profil</a>
                            <a href="/pages/projects.html">Meine Projekte</a>
                            <a href="/pages/templates.html">Templates</a>
                            <a href="/pages/billing.html">Credits kaufen</a>
                            <hr>
                            <a href="#" onclick="UIComponents.signOut()">Abmelden</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // STATS GRID COMPONENT
    // ============================================
    static renderStatsGrid(stats) {
        const statsData = [
            { icon: '📸', label: 'Heute erstellt', value: stats?.projectsToday || 0 },
            { icon: '💰', label: 'Credits verwendet', value: stats?.creditsUsed || 0 },
            { icon: '⭐', label: 'Templates', value: stats?.savedTemplates || 0 },
            { icon: '🚀', label: 'Erfolgsrate', value: (stats?.successRate || 0) + '%' }
        ];

        return statsData.map(stat => `
            <div class="stat-card">
                <div class="stat-icon">${stat.icon}</div>
                <div class="stat-content">
                    <div class="stat-number">${stat.value}</div>
                    <div class="stat-label">${stat.label}</div>
                </div>
            </div>
        `).join('');
    }

    // ============================================
    // USE CASE CARDS
    // ============================================
    static renderUseCaseGrid() {
        const useCases = [
            {
                id: 'fashion',
                name: 'Fashion & Apparel',
                icon: '👗',
                description: 'Kleidung, Schuhe & Accessoires auf Models',
                features: ['Model-Konfiguration', 'Lifestyle Scenes', 'Editorial Shots'],
                credits: 2,
                badge: 'Beliebt'
            },
            {
                id: 'product',
                name: 'Product Photography',
                icon: '📦',
                description: 'Objekte in Aktion & Produktdemos',
                features: ['Hand Modeling', 'In-Use Demos', '360° Views'],
                credits: 1
            },
            {
                id: 'beauty',
                name: 'Beauty & Cosmetics',
                icon: '💄',
                description: 'Makeup, Skincare & Haircare',
                features: ['Application Shots', 'Before/After', 'Texture Macros'],
                credits: 2,
                badge: 'Neu'
            },
            {
                id: 'food',
                name: 'Food & Beverage',
                icon: '🍔',
                description: 'Restaurant-Style & Verpackungen',
                features: ['Styled Plating', 'Action Cooking', 'Packaging Hero'],
                credits: 1
            },
            {
                id: 'jewelry',
                name: 'Jewelry & Watches',
                icon: '💎',
                description: 'Schmuck & Luxury Items',
                features: ['Macro Details', 'Worn Shots', 'Luxury Staging'],
                credits: 2
            },
            {
                id: 'sports',
                name: 'Sports & Fitness',
                icon: '⚽',
                description: 'Equipment & Activewear',
                features: ['Action Shots', 'Equipment Demo', 'Lifestyle Active'],
                credits: 2
            }
        ];

        return useCases.map(useCase => `
            <div class="use-case-card" onclick="UIComponents.navigateToUseCase('${useCase.id}')">
                ${useCase.badge ? `<div class="card-badge">${useCase.badge}</div>` : ''}
                <div class="card-icon">${useCase.icon}</div>
                <h4>${useCase.name}</h4>
                <p>${useCase.description}</p>
                <div class="card-features">
                    ${useCase.features.map(f => `<span>${f}</span>`).join('')}
                </div>
                <div class="card-credits">${useCase.credits} Credit${useCase.credits > 1 ? 's' : ''}</div>
            </div>
        `).join('');
    }

    // ============================================
    // PROJECT CARDS
    // ============================================
    static renderProjectCard(project) {
        const statusColors = {
            pending: 'warning',
            processing: 'info',
            completed: 'success',
            failed: 'error'
        };

        return `
            <div class="project-card" onclick="UIComponents.viewProject('${project.id}')">
                <div class="project-image">
                    ${project.output_images?.[0] ? 
                        `<img src="${project.output_images[0]}" alt="${project.project_name}">` :
                        `<div class="project-placeholder">${this.getProjectIcon(project.project_type)}</div>`
                    }
                </div>
                <div class="project-info">
                    <h4>${project.project_name}</h4>
                    <p class="project-type">${project.project_type}</p>
                    <div class="project-status status-${statusColors[project.status]}">
                        ${project.status}
                    </div>
                    <div class="project-date">
                        ${new Date(project.created_at).toLocaleDateString('de-DE')}
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================
    // TEMPLATE CARDS
    // ============================================
    static renderTemplateCard(template) {
        return `
            <div class="template-card" onclick="UIComponents.useTemplate('${template.id}')">
                <div class="template-header">
                    <h4>${template.name}</h4>
                    ${template.is_featured ? '<span class="badge badge-accent">Featured</span>' : ''}
                </div>
                <p class="template-description">${template.description}</p>
                <div class="template-meta">
                    <span>${template.category}</span>
                    <span>${template.usage_count} uses</span>
                </div>
            </div>
        `;
    }

    // ============================================
    // LOADING STATES
    // ============================================
    static renderLoadingCard() {
        return `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text-short"></div>
            </div>
        `;
    }

    static renderEmptyState(message = 'Keine Daten vorhanden') {
        return `
            <div class="empty-state">
                <div class="empty-icon">📷</div>
                <p>${message}</p>
            </div>
        `;
    }

    // ============================================
    // FORM COMPONENTS
    // ============================================
    static renderImageUpload(id = 'imageUpload') {
        return `
            <div class="upload-area" id="${id}Area" onclick="document.getElementById('${id}').click()">
                <input type="file" id="${id}" accept="image/*" style="display: none;">
                <div id="${id}Placeholder">
                    <div class="upload-icon">📸</div>
                    <div class="upload-text">Klicken zum Hochladen</div>
                    <div class="upload-subtext">PNG, JPG oder WebP • Max. 10MB</div>
                </div>
                <div class="image-preview" id="${id}Preview" style="display: none;">
                    <img id="${id}Img" class="preview-img" src="" alt="Preview">
                    <button type="button" class="remove-image" onclick="UIComponents.removeImage('${id}')">×</button>
                </div>
            </div>
        `;
    }

    static renderStepIndicator(steps, currentStep) {
        return `
            <div class="step-indicator">
                ${steps.map((step, index) => `
                    <div class="step ${index + 1 === currentStep ? 'active' : ''} ${index + 1 < currentStep ? 'completed' : ''}" 
                         data-step="${index + 1}">
                        <div class="step-circle">${index + 1}</div>
                        <div class="step-label">${step}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    static getProjectIcon(type) {
        const icons = {
            fashion: '👗',
            product: '📦',
            beauty: '💄',
            food: '🍔',
            jewelry: '💎',
            sports: '⚽'
        };
        return icons[type] || '📸';
    }

    static async signOut() {
        if (window.auth) {
            await window.auth.signOut();
            window.location.href = '/';
        }
    }

    static navigateToUseCase(useCase) {
        // Check credits first
        const credits = parseInt(document.getElementById('creditsAmount')?.textContent || 0);
        
        if (credits < 1) {
            if (confirm('Du hast keine Credits mehr. Möchtest du welche kaufen?')) {
                window.location.href = '/pages/billing.html';
            }
            return;
        }
        
        window.location.href = `/pages/${useCase}.html`;
    }

    static viewProject(projectId) {
        window.location.href = `/pages/project-details.html?id=${projectId}`;
    }

    static useTemplate(templateId) {
        // Store template ID and navigate to appropriate use case
        localStorage.setItem('selectedTemplate', templateId);
        // Get template category and navigate
        // This would need to fetch template details first
    }

    static removeImage(inputId) {
        document.getElementById(inputId).value = '';
        document.getElementById(`${inputId}Placeholder`).style.display = 'block';
        document.getElementById(`${inputId}Preview`).style.display = 'none';
        document.getElementById(`${inputId}Area`).classList.remove('has-image');
    }

    // ============================================
    // NOTIFICATION SYSTEM
    // ============================================
    static showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    static showLoading(show = true) {
        let loader = document.getElementById('globalLoader');
        
        if (show) {
            if (!loader) {
                loader = document.createElement('div');
                loader.id = 'globalLoader';
                loader.className = 'global-loader';
                loader.innerHTML = '<div class="spinner"></div>';
                document.body.appendChild(loader);
            }
            loader.style.display = 'flex';
        } else {
            if (loader) {
                loader.style.display = 'none';
            }
        }
    }
}

// Export for use in other files
window.UIComponents = UIComponents;
