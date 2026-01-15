// Contact Form Security & Anti-Spam
class ContactFormSecurity {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.mathQuestion = document.getElementById('mathQuestion');
        this.captchaInput = document.getElementById('captcha');
        this.correctAnswer = 0;
        this.lastSubmissionTime = 0;
        this.rateLimitMinutes = 5;
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.generateMathCaptcha();
        this.setupEventListeners();
        this.checkRateLimit();
    }

    generateMathCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        if (operation === '+') {
            this.correctAnswer = num1 + num2;
            this.mathQuestion.textContent = `${num1} + ${num2} = ?`;
        } else {
            // S'assurer que le résultat est positif
            const larger = Math.max(num1, num2);
            const smaller = Math.min(num1, num2);
            this.correctAnswer = larger - smaller;
            this.mathQuestion.textContent = `${larger} - ${smaller} = ?`;
        }
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Régénérer le captcha si l'utilisateur se trompe
        this.captchaInput.addEventListener('blur', () => {
            if (this.captchaInput.value && parseInt(this.captchaInput.value) !== this.correctAnswer) {
                setTimeout(() => {
                    this.generateMathCaptcha();
                    this.captchaInput.value = '';
                    this.captchaInput.focus();
                }, 1000);
            }
        });
    }

    checkRateLimit() {
        const lastSubmission = localStorage.getItem('lastContactSubmission');
        if (lastSubmission) {
            const timeDiff = Date.now() - parseInt(lastSubmission);
            const minutesPassed = timeDiff / (1000 * 60);
            
            if (minutesPassed < this.rateLimitMinutes) {
                const remainingTime = Math.ceil(this.rateLimitMinutes - minutesPassed);
                this.disableForm(`Veuillez attendre ${remainingTime} minute(s) avant d'envoyer un autre message.`);
                
                // Réactiver le formulaire après le délai
                setTimeout(() => {
                    this.enableForm();
                }, (remainingTime * 60 * 1000));
            }
        }
    }

    disableForm(message) {
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = message;
        this.form.style.opacity = '0.6';
    }

    enableForm() {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'Envoyer le message';
        this.form.style.opacity = '1';
    }

    validateForm(formData) {
        const errors = [];
        
        // Vérifier le honeypot
        if (formData.get('website')) {
            errors.push('Tentative de spam détectée.');
            return errors;
        }
        
        // Vérifier le captcha
        const captchaValue = parseInt(formData.get('captcha'));
        if (captchaValue !== this.correctAnswer) {
            errors.push('Réponse au calcul incorrecte.');
        }
        
        // Vérifier la longueur du nom
        const name = formData.get('name');
        if (name.length < 2 || name.length > 50) {
            errors.push('Le nom doit contenir entre 2 et 50 caractères.');
        }
        
        // Vérifier le message
        const message = formData.get('message');
        if (message.length < 10) {
            errors.push('Le message doit contenir au moins 10 caractères.');
        }
        if (message.length > 1000) {
            errors.push('Le message ne peut pas dépasser 1000 caractères.');
        }
        
        // Vérifier les mots-clés de spam
        const spamKeywords = ['viagra', 'casino', 'loan', 'bitcoin', 'crypto', 'investment', 'make money', 'click here', 'free money'];
        const messageText = message.toLowerCase();
        const nameText = name.toLowerCase();
        
        for (let keyword of spamKeywords) {
            if (messageText.includes(keyword) || nameText.includes(keyword)) {
                errors.push('Contenu suspect détecté.');
                break;
            }
        }
        
        // Vérifier les liens suspects
        const urlPattern = /(https?:\/\/[^\s]+)/g;
        const urls = message.match(urlPattern);
        if (urls && urls.length > 2) {
            errors.push('Trop de liens dans le message.');
        }
        
        return errors;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const errors = this.validateForm(formData);
        
        if (errors.length > 0) {
            alert('Erreurs détectées :\n' + errors.join('\n'));
            this.generateMathCaptcha();
            this.captchaInput.value = '';
            return;
        }
        
        // Simuler l'envoi (remplacer par votre logique d'envoi réelle)
        this.submitBtn.disabled = true;
        this.submitBtn.textContent = 'Envoi en cours...';
        
        try {
            // Ici, vous devriez envoyer les données à votre serveur
            // await this.sendToServer(formData);
            
            // Simulation d'envoi
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Enregistrer le timestamp de soumission
            localStorage.setItem('lastContactSubmission', Date.now().toString());
            
            // Afficher le succès
            alert('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
            
            // Réinitialiser le formulaire
            this.form.reset();
            this.generateMathCaptcha();
            
            // Désactiver temporairement le formulaire
            this.disableForm(`Message envoyé. Attendez ${this.rateLimitMinutes} minutes pour envoyer un autre message.`);
            
            setTimeout(() => {
                this.enableForm();
            }, this.rateLimitMinutes * 60 * 1000);
            
        } catch (error) {
            alert('Erreur lors de l\'envoi du message. Veuillez réessayer.');
            this.enableForm();
        }
    }

    // Méthode pour envoyer au serveur (à implémenter selon vos besoins)
    async sendToServer(formData) {
        // Exemple d'envoi vers un serveur
        const response = await fetch('/contact', {
            method: 'POST',
            body: formData,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur serveur');
        }
        
        return response.json();
    }
}

// Initialiser la sécurité du formulaire
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormSecurity();
});