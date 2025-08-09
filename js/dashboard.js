// dashboard.js - Dashboard Page Logic

class Dashboard {
    constructor() {
        this.user = null;
        this.stats = null;
        this.projects = [];
        this.templates = [];
    }

    async init() {
        try {
            // Check authentication
            if (!window.auth || !window.auth.isAuthenticated()) {
                window.location.href = '/';
                return;
            }

            // Get current user
            this.user = window.auth.getUser();
            
            // Load all dashboard data
            await Promise.all([
                this.loadUserProfile(),
                this.loadStats(),
                this.loadRecentProjects(),
                this.loadFeaturedTemplates()
            ]);

            // Render UI
            this.render();
            
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            UIComponents.showNotification('Fehler beim Laden des Dashboards', 'error');
        }
    }

    async loadUserProfile() {
        try {
            const profile = await window.auth.loadUserProfile();
            if (profile) {
                this.user.credits = profile.credits;
                this.user.name = profile.username || this.user.user_metadata?.full_name || this.user.email;
                this.user.avatar = this.user.user_metadata?.avatar_url;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async loadStats() {
        try {
            const result = await window.db.getUserStats();
            if (result.success) {
                this.stats = result.stats;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    async loadRecentProjects() {
        try {
            const result = await window.db.getProjects(4, 0);
            if (result.success) {
                this.projects = result.projects;
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    }

    async loadFeaturedTemplates() {
        try {
            const result = await window.db.getTemplates({ featured: true });
            if (result.success) {
                this.templates = result.templates.slice(0, 6);
            }
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    render() {
        // Render Header
        const header = document.getElementById('mainHeader');
        if (header) {
            header.innerHTML = UIComponents.renderHeader(this.user);
        }

        // Update Welcome Message
        const welcomeName = document.getElementById('welcomeName');
        if (welcomeName) {
            welcomeName.textContent = this.user.name?.split(' ')[0] || 'User';
        }

        // Render Stats Grid
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            statsGrid.innerHTML = UIComponents.renderStatsGrid({
                projectsToday: this.stats?.projects_this_month || 0,
                creditsUsed: this.stats?.credits_used_this_month || 0,
                savedTemplates: this.stats?.total_templates || 0,
                successRate: this.stats?.success_rate || 100
            });
        }

        // Render Use Case Grid
        const useCaseGrid = document.getElementById('useCaseGrid');
        if (useCaseGrid) {
            useCaseGrid.innerHTML = UIComponents.renderUseCaseGrid();
        }

        // Render Recent Projects
        const recentProjects = document.getElementById('recentProjects');
        if (recentProjects) {
            if (this.projects.length > 0) {
                recentProjects.innerHTML = this.projects
                    .map(project => UIComponents.renderProjectCard(project))
                    .join('');
            } else {
                recentProjects.innerHTML = UIComponents.renderEmptyState('Noch keine Projekte erstellt');
            }
        }

        // Render Featured Templates
        const featuredTemplates = document.getElementById('featuredTemplates');
        if (featuredTemplates) {
            if (this.templates.length > 0) {
                featuredTemplates.innerHTML = this.templates
                    .map(template => UIComponents.renderTemplateCard(template))
                    .join('');
            } else {
                featuredTemplates.innerHTML = UIComponents.renderEmptyState('Keine Templates verfügbar');
            }
        }
    }

    // Real-time Updates
    subscribeToUpdates() {
        if (!window.supabase) return;

        // Subscribe to project updates
        const projectSubscription = window.supabase
            .channel('projects')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'projects',
                    filter: `user_id=eq.${this.user.id}`
                }, 
                (payload) => {
                    this.handleProjectUpdate(payload);
                }
            )
            .subscribe();
    }

    handleProjectUpdate(payload) {
        if (payload.eventType === 'INSERT') {
            // Add new project to list
            this.projects.unshift(payload.new);
            this.projects = this.projects.slice(0, 4);
            
            // Re-render projects
            const recentProjects = document.getElementById('recentProjects');
            if (recentProjects) {
                recentProjects.innerHTML = this.projects
                    .map(project => UIComponents.renderProjectCard(project))
                    .join('');
            }
            
            UIComponents.showNotification('Neues Projekt erstellt!', 'success');
            
        } else if (payload.eventType === 'UPDATE') {
            // Update existing project
            const index = this.projects.findIndex(p => p.id === payload.new.id);
            if (index !== -1) {
                this.projects[index] = payload.new;
                
                // Re-render specific project card
                const projectCard = document.querySelector(`[data-project-id="${payload.new.id}"]`);
                if (projectCard) {
                    projectCard.outerHTML = UIComponents.renderProjectCard(payload.new);
                }
            }
            
            if (payload.new.status === 'completed') {
                UIComponents.showNotification('Projekt fertiggestellt!', 'success');
            }
        }
    }

    // Credit Check
    async checkCredits(required = 1) {
        const credits = this.user.credits || 0;
        
        if (credits < required) {
            const result = await this.showCreditWarning();
            return result;
        }
        
        return true;
    }

    async showCreditWarning() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal show';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Keine Credits verfügbar</h3>
                    <p>Du benötigst mindestens 1 Credit um fortzufahren.</p>
                    <p>Aktuelles Guthaben: <strong>${this.user.credits || 0} Credits</strong></p>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">
                            Abbrechen
                        </button>
                        <button class="btn btn-primary" onclick="window.location.href='/pages/billing.html'">
                            Credits kaufen
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
        });
    }
}

// Initialize Dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    dashboard.init();
    dashboard.subscribeToUpdates();
});
