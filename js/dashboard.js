// dashboard.js - Dashboard Page Logic with Video Integration

// Supabase Configuration
const SUPABASE_URL = 'https://vnodqwehipwpusrthurk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZub2Rxd2VoaXB3cHVzcnRodXJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTA5NTcsImV4cCI6MjA3MDMyNjk1N30.LSMyYLt7URx1G1NFKZAqXTrzVHwjtbvOzeuxLZy0u-Q';

let supabase = null;
let isCheckingAuth = false;
let currentUser = null;

// ============================================
// AUTHENTICATION
// ============================================
async function checkAuth() {
    if (isCheckingAuth) return;
    isCheckingAuth = true;

    console.log('🔒 Checking authentication...');

    try {
        // Initialize Supabase
        if (!supabase && typeof window.supabase !== 'undefined') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }

        if (!supabase) {
            console.error('Supabase not initialized');
            showError();
            return;
        }

        // Check session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            console.error('Session check error:', error);
            showError();
            return;
        }

        if (session) {
            console.log('✅ User authenticated:', session.user.email);
            currentUser = session.user;
            document.getElementById('userEmail').textContent = session.user.email;
            
            // Load Drive settings
            loadDriveSettings();
            
            // Setup auth listener for logout
            supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    window.location.href = '/';
                }
            });
        } else {
            // Check localStorage as fallback
            const storedUser = localStorage.getItem('ai_studio_user');
            
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    console.log('📦 Using stored user:', user.email);
                    currentUser = user;
                    document.getElementById('userEmail').textContent = user.email;
                    loadDriveSettings();
                } catch (e) {
                    console.error('Invalid stored user data');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                }
            } else {
                console.log('❌ No authentication found');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        }

    } catch (error) {
        console.error('Auth check error:', error);
        showError();
    } finally {
        isCheckingAuth = false;
    }
}

function showError() {
    document.querySelector('.welcome-section').innerHTML = `
        <h2 style="color: #ff6b6b;">Authentifizierungsfehler</h2>
        <p>Bitte <a href="/" style="color: #667eea;">neu anmelden</a></p>
    `;
}

async function signOut() {
    console.log('👋 Signing out...');
    
    if (supabase) {
        await supabase.auth.signOut();
    }
    
    localStorage.removeItem('ai_studio_user');
    localStorage.removeItem('drive_folder_link');
    localStorage.removeItem('video_history');
    window.location.href = '/';
}

// ============================================
// TAB SYSTEM
// ============================================
function switchTab(tab) {
    // Update buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content with animation
    document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
    });
    
    if (tab === 'images') {
        document.getElementById('imageSection').style.display = 'block';
        // Track tab switch
        trackEvent('tab_switch', { tab: 'images' });
    } else {
        document.getElementById('videoSection').style.display = 'block';
        // Track tab switch
        trackEvent('tab_switch', { tab: 'videos' });
    }
}

// ============================================
// NAVIGATION
// ============================================
function navigateTo(path) {
    // Check if Drive is configured
    const driveLink = localStorage.getItem('drive_folder_link');
    if (!driveLink) {
        if (confirm('Bitte konfiguriere zuerst deinen Google Drive Ordner. Jetzt einrichten?')) {
            openDriveSettings();
        }
        return;
    }
    
    // Show cost warning for images
    if (!confirm('⚠️ Kosten-Hinweis:\n\nBildgenerierung ist kostenpflichtig.\nBitte nutze diese Funktion sparsam.\n\nMöchtest du fortfahren?')) {
        return;
    }
    
    window.location.href = path;
}

function navigateToVideo(videoType) {
    // Check Drive configuration
    const driveLink = localStorage.getItem('drive_folder_link');
    if (!driveLink) {
        if (confirm('Bitte konfiguriere zuerst deinen Google Drive Ordner für die Video-Speicherung. Jetzt einrichten?')) {
            openDriveSettings();
        }
        return;
    }
    
    // Show cost warning for videos
    const message = '⚠️ WICHTIGE KOSTEN-WARNUNG:\n\n' +
                   'Video-Generierung kostet 0.50 CHF pro Sekunde!\n' +
                   'Ein 8-Sekunden-Video kostet somit 4.00 CHF.\n\n' +
                   'Bitte nutze diese Funktion sehr sparsam!\n\n' +
                   'Möchtest du wirklich fortfahren?';
    
    if (!confirm(message)) {
        return;
    }
    
    // Double confirmation for videos due to high cost
    if (!confirm('Bist du sicher? Die Kosten werden sofort berechnet.')) {
        return;
    }
    
    // Track video type selection
    trackEvent('video_type_selected', { type: videoType });
    
    // Navigate to video page with type parameter
    window.location.href = `/pages/video.html?type=${videoType}`;
}

// ============================================
// GOOGLE DRIVE SETTINGS
// ============================================
function openDriveSettings() {
    const modal = document.getElementById('driveSettingsModal');
    if (modal) {
        modal.classList.add('show');
        const savedLink = localStorage.getItem('drive_folder_link');
        if (savedLink) {
            document.getElementById('driveFolderLink').value = savedLink;
        }
    }
}

function closeDriveSettings() {
    const modal = document.getElementById('driveSettingsModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function saveDriveSettings() {
    const link = document.getElementById('driveFolderLink').value.trim();
    
    if (!link) {
        alert('Bitte gib einen gültigen Google Drive Link ein');
        return;
    }
    
    // Basic validation
    if (!link.includes('drive.google.com')) {
        alert('Bitte gib einen gültigen Google Drive Link ein');
        return;
    }
    
    // Extract folder ID if possible
    const folderIdMatch = link.match(/folders\/([a-zA-Z0-9-_]+)/);
    const folderId = folderIdMatch ? folderIdMatch[1] : null;
    
    // Save to localStorage
    localStorage.setItem('drive_folder_link', link);
    if (folderId) {
        localStorage.setItem('drive_folder_id', folderId);
    }
    
    // Update UI
    loadDriveSettings();
    closeDriveSettings();
    
    // Track setting saved
    trackEvent('drive_settings_saved', { configured: true });
    
    alert('✅ Drive Ordner gespeichert!');
}

function loadDriveSettings() {
    const savedLink = localStorage.getItem('drive_folder_link');
    const driveStatus = document.getElementById('driveStatus');
    const driveFolderPath = document.getElementById('driveFolderPath');
    
    if (savedLink && driveStatus && driveFolderPath) {
        driveStatus.style.display = 'block';
        // Extract folder name from link if possible
        const folderName = savedLink.split('/').pop() || 'Konfiguriert';
        driveFolderPath.textContent = folderName;
    }
}

// ============================================
// CREDIT SYSTEM - REMOVED, ONLY COST WARNING
// ============================================
function showCostWarning(type = 'image') {
    const costs = {
        image: 'Bildgenerierung ist kostenpflichtig.',
        video: 'Video-Generierung kostet 0.50 CHF pro Sekunde!\nEin 8-Sekunden-Video = 4.00 CHF'
    };
    
    return costs[type] || costs.image;
}

// ============================================
// VIDEO HISTORY
// ============================================
function loadVideoHistory() {
    const history = JSON.parse(localStorage.getItem('video_history') || '[]');
    return history;
}

function addToVideoHistory(videoData) {
    const history = JSON.parse(localStorage.getItem('video_history') || '[]');
    history.unshift({
        ...videoData,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    // Keep only last 20 items
    localStorage.setItem('video_history', JSON.stringify(history.slice(0, 20)));
}

// ============================================
// ANALYTICS & TRACKING
// ============================================
function trackEvent(eventName, eventData = {}) {
    // Simple event tracking - you can integrate with your analytics service
    console.log('📊 Event:', eventName, eventData);
    
    // Store in localStorage for basic analytics
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    events.push({
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        user: currentUser?.email || 'anonymous'
    });
    localStorage.setItem('analytics_events', JSON.stringify(events.slice(-100))); // Keep last 100 events
}

// ============================================
// UTILITIES
// ============================================
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K - Open Drive Settings
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openDriveSettings();
    }
    
    // Ctrl/Cmd + 1 - Switch to Images
    if ((e.ctrlKey || e.metaKey) && e.key === '1') {
        e.preventDefault();
        document.querySelector('[data-tab="images"]').click();
    }
    
    // Ctrl/Cmd + 2 - Switch to Videos
    if ((e.ctrlKey || e.metaKey) && e.key === '2') {
        e.preventDefault();
        document.querySelector('[data-tab="videos"]').click();
    }
});

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard initializing...');
    
    // Check authentication
    checkAuth();
    
    // Load user preferences
    loadUserPreferences();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Check for URL parameters (e.g., coming back from video generation)
    checkURLParams();
    
    // Setup periodic session check
    setInterval(() => {
        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (!session) {
                    console.log('Session expired, redirecting to login...');
                    window.location.href = '/';
                }
            });
        }
    }, 60000); // Check every minute
});

// ============================================
// USER PREFERENCES
// ============================================
function loadUserPreferences() {
    const preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    
    // Apply dark mode if preferred
    if (preferences.darkMode) {
        document.body.classList.add('dark-mode');
    }
    
    // Set default tab
    if (preferences.defaultTab === 'videos') {
        setTimeout(() => {
            document.querySelector('[data-tab="videos"]')?.click();
        }, 100);
    }
}

function saveUserPreference(key, value) {
    const preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    preferences[key] = value;
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
}

// ============================================
// TOOLTIPS
// ============================================
function initializeTooltips() {
    // Simple tooltip implementation
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = e.target.dataset.tooltip;
            tooltip.style.cssText = `
                position: absolute;
                background: #333;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;
            document.body.appendChild(tooltip);
            
            const rect = e.target.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + 'px';
            tooltip.style.top = rect.bottom + 5 + 'px';
            
            e.target._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', (e) => {
            if (e.target._tooltip) {
                e.target._tooltip.remove();
                delete e.target._tooltip;
            }
        });
    });
}

// ============================================
// URL PARAMETERS
// ============================================
function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Check if coming back from successful generation
    if (params.get('success') === 'true') {
        const type = params.get('type');
        if (type === 'video') {
            showNotification('✅ Video wird generiert! Check deinen Google Drive Ordner.', 'success');
            // Switch to video tab
            setTimeout(() => {
                document.querySelector('[data-tab="videos"]')?.click();
            }, 100);
        } else {
            showNotification('✅ Bilder werden generiert!', 'success');
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, '/dashboard.html');
    }
    
    // Check for error messages
    if (params.get('error')) {
        showNotification('❌ ' + params.get('error'), 'error');
        window.history.replaceState({}, document.title, '/dashboard.html');
    }
}

// ============================================
// EXPORT FOR DEBUGGING
// ============================================
window.dashboardDebug = {
    checkAuth,
    signOut,
    loadDriveSettings,
    trackEvent,
    showNotification,
    currentUser: () => currentUser,
    videoHistory: loadVideoHistory
};
