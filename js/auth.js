// auth.js - Supabase Authentication System

class AuthManager {
    constructor() {
        // Initialize Supabase Client
        this.supabase = null;
        this.user = null;
        this.profile = null;
        this.initSupabase();
    }

    initSupabase() {
        // Supabase Config
        const SUPABASE_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:54321'
            : 'https://YOUR_PROJECT.supabase.co'; // REPLACE WITH YOUR SUPABASE URL
        const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // REPLACE WITH YOUR ANON KEY
        
        if (typeof window.supabase !== 'undefined') {
            this.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            this.setupAuthListener();
        } else {
            console.error('Supabase not loaded');
        }
    }

    setupAuthListener() {
        // Listen for auth state changes
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth event:', event);
            
            if (event === 'SIGNED_IN' && session) {
                this.user = session.user;
                await this.loadUserProfile();
                
                // Redirect to dashboard if on login page
                if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                    window.location.href = '/dashboard.html';
                }
            } else if (event === 'SIGNED_OUT') {
                this.user = null;
                this.profile = null;
                
                // Redirect to login if not already there
                if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                    window.location.href = '/';
                }
            }
        });
    }

    async signInWithProvider(provider) {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin + '/dashboard.html'
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.user = null;
            this.profile = null;
            window.location.href = '/';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    async isAuthenticated() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            return !!session;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }

    async getSession() {
        try {
            const { data: { session } } = await this.supabase.auth.getSession();
            return session;
        } catch (error) {
            console.error('Get session error:', error);
            return null;
        }
    }

    getUser() {
        return this.user;
    }

    async loadUserProfile() {
        if (!this.user) return null;

        try {
            // Check if profile exists
            let { data: profile, error } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', this.user.id)
                .single();

            if (error && error.code === 'PGRST116') {
                // Profile doesn't exist, create it
                profile = await this.createUserProfile();
            } else if (error) {
                throw error;
            }

            this.profile = profile;
            this.user.profile = profile;
            return profile;
        } catch (error) {
            console.error('Load profile error:', error);
            return null;
        }
    }

    async createUserProfile() {
        if (!this.user) return null;

        try {
            const profileData = {
                user_id: this.user.id,
                email: this.user.email,
                username: this.user.user_metadata?.full_name || this.user.email.split('@')[0],
                avatar_url: this.user.user_metadata?.avatar_url,
                credits: 100, // Initial free credits
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_profiles')
                .insert([profileData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Create profile error:', error);
            return null;
        }
    }

    async updateCredits(amount) {
        if (!this.user || !this.profile) return false;

        try {
            const newCredits = Math.max(0, this.profile.credits + amount);
            
            const { data, error } = await this.supabase
                .from('user_profiles')
                .update({ credits: newCredits })
                .eq('user_id', this.user.id)
                .select()
                .single();

            if (error) throw error;
            
            this.profile.credits = newCredits;
            this.user.profile.credits = newCredits;
            
            // Update UI if credits display exists
            const creditsDisplay = document.getElementById('creditsAmount');
            if (creditsDisplay) {
                creditsDisplay.textContent = newCredits;
            }
            
            return true;
        } catch (error) {
            console.error('Update credits error:', error);
            return false;
        }
    }
}

// Database operations
class DatabaseManager {
    constructor(supabase) {
        this.supabase = supabase;
    }

    async createProject(projectData) {
        try {
            const user = window.auth?.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await this.supabase
                .from('projects')
                .insert([{
                    user_id: user.id,
                    project_name: projectData.name,
                    project_type: projectData.type,
                    specifications: projectData.specifications,
                    input_image: projectData.imageUrl,
                    credits_used: projectData.credits_needed,
                    status: 'pending'
                }])
                .select()
                .single();

            if (error) throw error;
            
            // Deduct credits
            await window.auth.updateCredits(-projectData.credits_needed);
            
            return { success: true, project: data };
        } catch (error) {
            console.error('Create project error:', error);
            return { success: false, error: error.message };
        }
    }

    async getProjects(limit = 10, offset = 0) {
        try {
            const user = window.auth?.getUser();
            if (!user) return { success: false, error: 'Not authenticated' };

            const { data, error } = await this.supabase
                .from('projects')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;
            
            return { success: true, projects: data };
        } catch (error) {
            console.error('Get projects error:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserStats() {
        try {
            const user = window.auth?.getUser();
            if (!user) return { success: false, error: 'Not authenticated' };

            // Get stats from multiple queries
            const today = new Date().toISOString().split('T')[0];
            const thisMonth = new Date().toISOString().slice(0, 7);

            // Projects today
            const { count: projectsToday } = await this.supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .gte('created_at', today);

            // Credits used this month
            const { data: monthProjects } = await this.supabase
                .from('projects')
                .select('credits_used')
                .eq('user_id', user.id)
                .gte('created_at', thisMonth + '-01');

            const creditsUsed = monthProjects?.reduce((sum, p) => sum + (p.credits_used || 0), 0) || 0;

            return {
                success: true,
                stats: {
                    projects_today: projectsToday || 0,
                    credits_used_this_month: creditsUsed,
                    total_credits: window.auth?.profile?.credits || 0,
                    success_rate: 100
                }
            };
        } catch (error) {
            console.error('Get stats error:', error);
            return { success: false, error: error.message };
        }
    }

    async getTemplates(filters = {}) {
        try {
            let query = this.supabase.from('templates').select('*');
            
            if (filters.featured) {
                query = query.eq('is_featured', true);
            }
            
            if (filters.category) {
                query = query.eq('category', filters.category);
            }
            
            const { data, error } = await query.order('usage_count', { ascending: false });
            
            if (error) throw error;
            
            return { success: true, templates: data || [] };
        } catch (error) {
            console.error('Get templates error:', error);
            return { success: false, error: error.message, templates: [] };
        }
    }
}

// Initialize global instances
window.auth = new AuthManager();
window.db = new DatabaseManager(window.auth.supabase);