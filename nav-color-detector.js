// Navigation Color Detector
// Automatically changes nav color based on background

class NavColorDetector {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.sections = [];
        this.currentTheme = null;
        this.init();
    }

    init() {
        if (!this.navbar) return;
        
        // Exécution immédiate pour éviter le flash
        this.quickInit();
        
        // Initialisation complète après le chargement
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.fullInit());
        } else {
            this.fullInit();
        }
    }

    quickInit() {
        // Détection rapide basée sur la page actuelle
        const currentPage = window.location.pathname;
        
        // Définir un thème par défaut basé sur la page
        let defaultTheme = 'light'; // blanc par défaut
        
        // Pages avec headers sombres
        if (currentPage.includes('extensions') || 
            currentPage.includes('volume-russe') || 
            currentPage.includes('rehaussement') || 
            currentPage.includes('tarifs') || 
            currentPage.includes('contact')) {
            defaultTheme = 'light'; // texte blanc sur header sombre
        } else {
            // Page d'accueil - commencer avec du texte sombre sur fond clair
            defaultTheme = 'dark';
        }
        
        this.updateNavTheme(defaultTheme);
    }

    fullInit() {
        // Attendre un peu pour que tout soit rendu
        setTimeout(() => {
            this.defineSections();
            this.handleScroll();
            window.addEventListener('scroll', () => this.handleScroll());
            window.addEventListener('resize', () => {
                setTimeout(() => this.defineSections(), 100);
            });
        }, 50);
    }

    defineSections() {
        this.sections = [];
        
        // Récupérer toutes les sections principales
        const allSections = document.querySelectorAll('section, header, .hero, .page-header, footer');
        
        allSections.forEach(section => {
            // Déterminer si la section est sombre ou claire
            let isDark = this.determineSectionTheme(section);
            
            this.sections.push({
                element: section,
                top: section.offsetTop,
                bottom: section.offsetTop + section.offsetHeight,
                isDark: isDark
            });
        });
        
        // Trier par position
        this.sections.sort((a, b) => a.top - b.top);
    }

    determineSectionTheme(section) {
        // Vérifier les classes spécifiques pour les sections sombres
        const darkClasses = [
            'process-section', 
            'dark-section', 
            'cta-section',
            'page-header'
        ];
        
        const lightClasses = [
            'services-section',
            'alt-section'
        ];
        
        // Vérifier si c'est le footer
        if (section.tagName.toLowerCase() === 'footer') {
            return true; // Footer est toujours sombre
        }
        
        // Vérifier les classes spécifiques
        for (let className of darkClasses) {
            if (section.classList.contains(className)) {
                return true;
            }
        }
        
        for (let className of lightClasses) {
            if (section.classList.contains(className)) {
                return false;
            }
        }
        
        // Vérifier si c'est la section hero (page d'accueil)
        if (section.classList.contains('hero')) {
            return false; // Hero a un fond blanc
        }
        
        // Vérifier la couleur de fond
        const style = window.getComputedStyle(section);
        const bgColor = style.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            return this.isColorDark(bgColor);
        }
        
        // Par défaut, considérer comme clair
        return false;
    }

    isColorDark(color) {
        // Convertir la couleur en RGB et calculer la luminosité
        const rgb = color.match(/\d+/g);
        if (!rgb || rgb.length < 3) return false;
        
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);
        
        // Formule de luminosité
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance < 0.5;
    }

    handleScroll() {
        const scrollY = window.scrollY;
        const navHeight = this.navbar.offsetHeight;
        const navCenter = scrollY + navHeight / 2;
        
        // Trouver la section actuelle
        let currentSection = null;
        for (let section of this.sections) {
            if (navCenter >= section.top && navCenter <= section.bottom) {
                currentSection = section;
                break;
            }
        }
        
        // Si aucune section trouvée, utiliser la première ou dernière
        if (!currentSection && this.sections.length > 0) {
            if (navCenter < this.sections[0].top) {
                currentSection = this.sections[0];
            } else {
                currentSection = this.sections[this.sections.length - 1];
            }
        }
        
        if (currentSection) {
            const newTheme = currentSection.isDark ? 'light' : 'dark';
            this.updateNavTheme(newTheme);
        }
    }

    updateNavTheme(theme) {
        if (this.currentTheme === theme) return;
        
        this.currentTheme = theme;
        
        // Supprimer les anciennes classes
        this.navbar.classList.remove('nav-dark', 'nav-light');
        
        // Ajouter la nouvelle classe immédiatement
        if (theme === 'dark') {
            this.navbar.classList.add('nav-dark');
        } else {
            this.navbar.classList.add('nav-light');
        }
        
        // Appliquer le thème au menu mobile aussi
        this.updateMobileMenuTheme(theme);
    }
    
    updateMobileMenuTheme(theme) {
        const navLinks = document.getElementById('navLinks');
        if (!navLinks) return;
        
        // Supprimer les anciennes classes de thème mobile
        navLinks.classList.remove('mobile-nav-dark', 'mobile-nav-light');
        
        // Le menu mobile garde toujours son style glassmorphism avec texte noir
        // mais on peut ajuster la couleur du logo mobile selon le contexte
        const mobileLogo = navLinks.querySelector('.mobile-logo');
        if (mobileLogo) {
            // Le logo mobile reste blanc pour contraster avec le fond glassmorphism
            mobileLogo.style.color = 'var(--white)';
        }
    }
}

// Initialiser immédiatement
new NavColorDetector();