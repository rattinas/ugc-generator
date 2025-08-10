// api.js - API Communication Layer

class API {
    constructor() {
        this.baseUrl = window.location.origin;
        this.webhookUrl = '/api/webhook';
        this.uploadUrl = '/api/upload';
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
    // PROJECT SUBMISSION
    // ============================================
    async submitProject(projectData) {
        try {
            // First upload the image
            let imageUrl = null;
            if (projectData.image) {
                const uploadResult = await this.uploadImage(projectData.image);
                if (!uploadResult.success) {
                    throw new Error('Image upload failed');
                }
                imageUrl = uploadResult.imageUrl;
            }

            // Prepare webhook data
            const webhookData = {
                ...projectData,
                imageUrl,
                image: undefined, // Remove base64 from webhook data
                timestamp: new Date().toISOString()
            };

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
            return result;
        } catch (error) {
            console.error('Project submission error:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // MAKE.COM WEBHOOK
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

                    // Calculate new dimensions
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