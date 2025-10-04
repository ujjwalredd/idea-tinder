class IdeaTinder {
    constructor() {
        this.currentIdea = null;
        this.isShowingPitchDeck = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isDragging = false;
        this.ideaHistory = [];
        this.favoriteIdeas = [];
        this.stats = {
            totalGenerated: 0,
            totalLiked: 0,
            totalPassed: 0,
            totalRefined: 0
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeApp();
        
        // Add a small delay to ensure everything is loaded
        setTimeout(() => {
            this.generateNewIdea();
        }, 500);
    }

    initializeElements() {
        // Main elements
        this.ideaCard = document.getElementById('ideaCard');
        this.miniPitchDeck = document.getElementById('miniPitchDeck');
        this.loadingState = document.getElementById('loadingState');
        this.errorModal = document.getElementById('errorModal');
        
        // Idea card elements
        this.ideaName = document.getElementById('ideaName');
        this.vibeBadge = document.getElementById('vibeBadge');
        this.ideaTagline = document.getElementById('ideaTagline');
        this.ideaPitch = document.getElementById('ideaPitch');
        
        // Buttons (may not exist if removed from HTML)
        this.passBtn = document.getElementById('passBtn');
        this.refineBtn = document.getElementById('refineBtn');
        this.likeBtn = document.getElementById('likeBtn');
        this.backBtn = document.getElementById('backBtn');
        this.retryBtn = document.getElementById('retryBtn');
        
        // Pitch deck elements
        this.problemText = document.getElementById('problemText');
        this.solutionText = document.getElementById('solutionText');
        this.targetAudienceText = document.getElementById('targetAudienceText');
        this.secretSauceText = document.getElementById('secretSauceText');
        this.monetizationText = document.getElementById('monetizationText');
        this.hurdleText = document.getElementById('hurdleText');
        this.firstStepText = document.getElementById('firstStepText');
        
        // Error elements
        this.errorMessage = document.getElementById('errorMessage');
        this.successToast = document.getElementById('successToast');
    }

    initializeApp() {
        // Load saved data from localStorage
        this.loadSavedData();
        
        // Add haptic feedback for mobile
        this.setupHapticFeedback();
        
        // Add sound effects
        this.setupSoundEffects();
        
        // Initialize particle effects
        this.initializeParticles();
    }

    loadSavedData() {
        const savedStats = localStorage.getItem('ideaTinderStats');
        const savedFavorites = localStorage.getItem('ideaTinderFavorites');
        
        if (savedStats) {
            this.stats = JSON.parse(savedStats);
        }
        
        if (savedFavorites) {
            this.favoriteIdeas = JSON.parse(savedFavorites);
        }
    }

    saveData() {
        localStorage.setItem('ideaTinderStats', JSON.stringify(this.stats));
        localStorage.setItem('ideaTinderFavorites', JSON.stringify(this.favoriteIdeas));
    }

    setupHapticFeedback() {
        if ('vibrate' in navigator) {
            this.vibrate = (pattern) => navigator.vibrate(pattern);
        } else {
            this.vibrate = () => {};
        }
    }

    setupSoundEffects() {
        // Create audio context for sound effects
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    playSound(frequency, duration, type = 'sine') {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    initializeParticles() {
        // Add floating particles effect
        this.createParticles();
    }

    createParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'fixed inset-0 pointer-events-none z-0';
        document.body.appendChild(particleContainer);

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'absolute w-1 h-1 bg-white/20 rounded-full animate-float';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 5 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
            particleContainer.appendChild(particle);
        }
    }

    setupEventListeners() {
        // Button events (only if buttons exist)
        if (this.passBtn) this.passBtn.addEventListener('click', () => this.passIdea());
        if (this.refineBtn) this.refineBtn.addEventListener('click', () => this.refineIdea());
        if (this.likeBtn) this.likeBtn.addEventListener('click', () => this.likeIdea());
        if (this.backBtn) this.backBtn.addEventListener('click', () => this.backToIdea());
        if (this.retryBtn) this.retryBtn.addEventListener('click', () => this.hideError() && this.generateNewIdea());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.showVisualFeedback('pass');
                this.passIdea();
            }
            if (e.key === 'ArrowRight') {
                this.showVisualFeedback('like');
                this.likeIdea();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.showVisualFeedback('refine');
                this.refineIdea();
            }
            if (e.key === 'Escape') this.backToIdea();
        });

        // Touch events for mobile
        this.ideaCard.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.ideaCard.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.ideaCard.addEventListener('touchend', (e) => this.handleTouchEnd(e));

        // Mouse events for desktop
        this.ideaCard.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.ideaCard.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.ideaCard.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.ideaCard.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
    }

    async generateNewIdea() {
        console.log('Starting to generate new idea...');
        this.showLoading();
        
        try {
            console.log('Calling generateIdeaWithClaude...');
            const idea = await this.generateIdeaWithClaude();
            console.log('Received idea:', idea);
            this.currentIdea = idea;
            this.displayIdea(idea);
            this.hideLoading();
        } catch (error) {
            console.error('Error generating idea:', error);
            console.error('Error details:', error.message);
            this.showError('Failed to generate a new idea. Please try again.');
            this.hideLoading();
        }
    }

    async generateIdeaWithClaude() {
        console.log('🚀 Making API request to generate idea...');
        try {
            const response = await fetch('https://idea-tinder.vercel.app/api/generate-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 API response status:', response.status);
            console.log('📡 API response ok:', response.ok);
            console.log('📡 API response headers:', response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API error response:', errorText);
                throw new Error(`API request failed: ${response.status} - ${errorText}`);
            }

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            console.log('📡 Content-Type:', contentType);
            
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('❌ Response is not JSON:', textResponse);
                throw new Error('Response is not JSON: ' + textResponse);
            }

            const data = await response.json();
            console.log('✅ API response data:', data);
            return data;
        } catch (error) {
            console.error('💥 Error in generateIdeaWithClaude:', error);
            console.error('💥 Error stack:', error.stack);
            throw error;
        }
    }

    async refineIdea() {
        if (!this.currentIdea) return;
        
        // Update stats
        this.stats.totalRefined++;
        this.saveData();
        
        // Add feedback
        this.playSound(500, 0.2);
        this.vibrate([50]);
        
        this.showLoading();
        
        try {
            const refinedIdea = await this.refineIdeaWithClaude(this.currentIdea);
            this.currentIdea = refinedIdea;
            this.displayIdea(refinedIdea);
            this.hidePitchDeck();
            this.hideLoading();
        } catch (error) {
            console.error('Error refining idea:', error);
            this.showError('Failed to refine the idea. Please try again.');
            this.hideLoading();
        }
    }

    async refineIdeaWithClaude(originalIdea) {
        const response = await fetch('https://idea-tinder.vercel.app/api/refine-idea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentIdea: originalIdea
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        return await response.json();
    }

    displayIdea(idea) {
        // Add to history
        this.ideaHistory.push({
            ...idea,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
        
        // Update stats
        this.stats.totalGenerated++;
        this.saveData();
        
        // Smooth transition animation with premium effects
        this.ideaCard.style.opacity = '0';
        this.ideaCard.style.transform = 'translateY(20px) scale(0.95)';
        this.ideaCard.classList.add('animate-idea-generate');
        
        setTimeout(() => {
            this.ideaName.textContent = idea.name;
            this.vibeBadge.textContent = idea.vibe;
            this.ideaTagline.textContent = idea.tagline;
            this.ideaPitch.textContent = idea.pitch;
            
            // Reset card position and animate in
            this.ideaCard.classList.remove('swipe-left', 'swipe-right', 'animate-idea-generate');
            this.ideaCard.style.transform = '';
            this.ideaCard.style.opacity = '1';
            
            // Add success feedback
            this.showSuccessToast('New idea generated!');
            this.playSound(800, 0.2);
            this.vibrate([50]);
        }, 200);
    }

    showSuccessToast(message) {
        const toast = this.successToast;
        const text = toast.querySelector('span');
        text.textContent = message;
        
        toast.classList.remove('hidden');
        toast.classList.add('animate-slide-down');
        
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('animate-slide-down');
        }, 3000);
    }

    showVisualFeedback(action) {
        // Create temporary visual feedback for keyboard interactions
        const feedback = document.createElement('div');
        feedback.className = 'fixed inset-0 pointer-events-none z-50 flex items-center justify-center';
        
        let content = '';
        let bgColor = '';
        
        switch(action) {
            case 'pass':
                content = '×';
                bgColor = 'bg-white/10';
                break;
            case 'like':
                content = '✓';
                bgColor = 'bg-white/20';
                break;
            case 'refine':
                content = '↻';
                bgColor = 'bg-gray-500/20';
                break;
        }
        
        feedback.innerHTML = `
            <div class="${bgColor} backdrop-blur-xl rounded-full w-20 h-20 flex items-center justify-center text-4xl font-bold animate-scale-in text-white border border-white/20">
                ${content}
            </div>
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 500);
    }

    showLoading() {
        this.loadingState.classList.remove('hidden');
        this.ideaName.textContent = 'Generating...';
        this.ideaTagline.textContent = 'Creating your next startup idea';
        this.ideaPitch.textContent = 'AI is crafting something unique for you...';
        
        // Add some visual feedback during loading
        this.ideaCard.style.opacity = '0.7';
        this.ideaCard.style.transform = 'scale(0.98)';
    }

    hideLoading() {
        this.loadingState.classList.add('hidden');
        this.ideaCard.style.opacity = '1';
        this.ideaCard.style.transform = 'scale(1)';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.classList.remove('hidden');
    }

    hideError() {
        this.errorModal.classList.add('hidden');
    }

    passIdea() {
        // Update stats
        this.stats.totalPassed++;
        this.saveData();
        
        // Add feedback
        this.playSound(400, 0.3, 'sawtooth');
        this.vibrate([100, 50, 100]);
        
        this.ideaCard.classList.add('swipe-left');
        setTimeout(() => {
            this.generateNewIdea();
        }, 300);
    }

    likeIdea() {
        // Add to favorites
        if (this.currentIdea) {
            this.favoriteIdeas.push({
                ...this.currentIdea,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            });
        }
        
        // Update stats
        this.stats.totalLiked++;
        this.saveData();
        
        // Add feedback
        this.playSound(600, 0.4);
        this.vibrate([50, 100, 50]);
        
        this.ideaCard.classList.add('swipe-right');
        setTimeout(() => {
            this.showPitchDeck();
        }, 300);
    }

    showPitchDeck() {
        if (!this.currentIdea) return;
        
        this.problemText.textContent = this.currentIdea.problem;
        this.solutionText.textContent = this.currentIdea.solution;
        this.targetAudienceText.textContent = this.currentIdea.targetAudience;
        this.secretSauceText.textContent = this.currentIdea.secretSauce;
        this.monetizationText.textContent = this.currentIdea.monetization;
        this.hurdleText.textContent = this.currentIdea.hurdle;
        this.firstStepText.textContent = this.currentIdea.firstStep;
        
        this.ideaCard.classList.add('hidden');
        this.miniPitchDeck.classList.remove('hidden');
        this.isShowingPitchDeck = true;
    }

    hidePitchDeck() {
        this.ideaCard.classList.remove('hidden');
        this.ideaCard.classList.remove('swipe-right', 'swipe-left');
        this.ideaCard.style.transform = '';
        this.miniPitchDeck.classList.add('hidden');
        this.isShowingPitchDeck = false;
    }

    backToIdea() {
        this.hidePitchDeck();
    }

    // Touch event handlers
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.isDragging = true;
    }

    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            e.preventDefault();
            const rotation = deltaX * 0.1;
            const translateX = deltaX * 0.5;
            
            this.ideaCard.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
            
            if (deltaX > 50) {
                this.ideaCard.classList.add('swipe-right');
                this.ideaCard.classList.remove('swipe-left');
            } else if (deltaX < -50) {
                this.ideaCard.classList.add('swipe-left');
                this.ideaCard.classList.remove('swipe-right');
            }
        }
    }

    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        const touchX = e.changedTouches[0].clientX;
        const deltaX = touchX - this.touchStartX;
        
        this.isDragging = false;
        this.ideaCard.style.transform = '';
        
        if (Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                this.likeIdea();
            } else {
                this.passIdea();
            }
        } else {
            this.ideaCard.classList.remove('swipe-left', 'swipe-right');
        }
        
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    // Mouse event handlers
    handleMouseDown(e) {
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.isDragging = true;
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const deltaX = mouseX - this.touchStartX;
        const deltaY = mouseY - this.touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const rotation = deltaX * 0.1;
            const translateX = deltaX * 0.5;
            
            this.ideaCard.style.transform = `translateX(${translateX}px) rotate(${rotation}deg)`;
            
            if (deltaX > 50) {
                this.ideaCard.classList.add('swipe-right');
                this.ideaCard.classList.remove('swipe-left');
            } else if (deltaX < -50) {
                this.ideaCard.classList.add('swipe-left');
                this.ideaCard.classList.remove('swipe-right');
            }
        }
    }

    handleMouseUp(e) {
        if (!this.isDragging) return;
        
        const mouseX = e.clientX;
        const deltaX = mouseX - this.touchStartX;
        
        this.isDragging = false;
        this.ideaCard.style.transform = '';
        
        if (Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                this.likeIdea();
            } else {
                this.passIdea();
            }
        } else {
            this.ideaCard.classList.remove('swipe-left', 'swipe-right');
        }
        
        this.touchStartX = 0;
        this.touchStartY = 0;
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new IdeaTinder();
});