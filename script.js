import { Howl } from 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';

class CyberNexus {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.matrixGrid = [];
        this.correctCode = '';
        this.achievements = {
            'first_decode': false,
            'level_5': false,
            'time_master': false,
            'easter_egg': false
        };
        this.powerUps = {
            timeBoosts: 2,
            hints: 1,
            randomize: 1
        };
        this.soundEffects = {
            decode: null,
            gameOver: null,
            levelUp: null
        };
        
        this.initSoundEffects();
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
        this.initAchievementsPanel();
        this.initBackgroundMusic();
        this.setupEasterEggs();
    }
    
    initSoundEffects() {
        this.soundEffects = {
            decode: new Howl({
                src: ['assets/decode-sound.mp3'],
                volume: 0.5
            }),
            gameOver: new Howl({
                src: ['assets/game-over-sound.mp3'],
                volume: 0.7
            }),
            levelUp: new Howl({
                src: ['assets/level-up-sound.mp3'],
                volume: 0.6
            })
        };
    }
    
    initBackgroundMusic() {
        this.bgMusic = new Howl({
            src: ['assets/cyberpunk-bg-music.mp3'],
            loop: true,
            volume: 0.3
        });
        
        // Add music toggle button
        const musicToggle = document.createElement('button');
        musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        musicToggle.classList.add('music-toggle');
        musicToggle.addEventListener('click', () => this.toggleBackgroundMusic(musicToggle));
        document.querySelector('.header').appendChild(musicToggle);
    }
    
    toggleBackgroundMusic(button) {
        if (this.bgMusic.playing()) {
            this.bgMusic.pause();
            button.classList.add('muted');
        } else {
            this.bgMusic.play();
            button.classList.remove('muted');
        }
    }
    
    setupEasterEggs() {
        // Secret konami code activation
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 
            'ArrowDown', 'ArrowDown', 
            'ArrowLeft', 'ArrowRight', 
            'ArrowLeft', 'ArrowRight', 
            'b', 'a'
        ];
        let konamiProgress = 0;
        
        document.addEventListener('keydown', (event) => {
            if (event.key === konamiCode[konamiProgress]) {
                konamiProgress++;
                
                if (konamiProgress === konamiCode.length) {
                    this.activateKonamiEasterEgg();
                    konamiProgress = 0;
                }
            } else {
                konamiProgress = 0;
            }
        });
    }
    
    activateKonamiEasterEgg() {
        if (!this.achievements['easter_egg']) {
            this.achievements['easter_egg'] = true;
            this.updateAchievementsPanel();
            
            const easterEggZone = document.getElementById('easter-egg-zone');
            const matrix = document.createElement('div');
            matrix.classList.add('matrix-rain');
            easterEggZone.appendChild(matrix);
            
            // Trigger confetti and special effects
            confetti({
                particleCount: 300,
                spread: 200,
                origin: { y: 0.6 }
            });
            
            // Add a fun message
            const message = document.createElement('div');
            message.textContent = 'KONAMI CODE ACTIVATED! 🎉';
            message.classList.add('konami-message');
            easterEggZone.appendChild(message);
            
            setTimeout(() => {
                easterEggZone.innerHTML = '';
            }, 5000);
        }
    }
    
    initializeGame() {
        const gridElement = document.getElementById('matrix-grid');
        gridElement.innerHTML = '';
        this.matrixGrid = [];
        
        // Generate 5x5 matrix of codes with varying complexity
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('matrix-cell');
            
            // Generate a random matrix code with increasing complexity
            const code = this.generateMatrixCode(this.level);
            cell.textContent = code;
            cell.dataset.code = code;
            
            cell.addEventListener('click', () => this.selectCell(cell));
            gridElement.appendChild(cell);
            this.matrixGrid.push(cell);
        }
        
        // Select a random correct code
        const randomIndex = Math.floor(Math.random() * this.matrixGrid.length);
        this.correctCode = this.matrixGrid[randomIndex].dataset.code;
        this.matrixGrid[randomIndex].classList.add('target-code');
    }
    
    generateMatrixCode(level) {
        const baseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        // Increase code complexity with level
        const codeLength = 4 + Math.floor(level / 3);
        const useSpecialChars = level > 3;
        
        const characters = useSpecialChars 
            ? baseChars + specialChars 
            : baseChars;
        
        return Array.from({length: codeLength}, () => 
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    }
    
    selectCell(cell) {
        // Highlight selected cell
        this.matrixGrid.forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
        document.getElementById('code-input').value = cell.dataset.code;
    }
    
    setupEventListeners() {
        document.getElementById('submit-code').addEventListener('click', () => this.checkCode());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
        document.getElementById('time-boost').addEventListener('click', () => this.activateTimeBoost());
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('randomize-btn').addEventListener('click', () => this.randomizeGrid());
        document.getElementById('share-score').addEventListener('click', () => this.shareScore());
    }
    
    checkCode() {
        const inputElement = document.getElementById('code-input');
        const submittedCode = inputElement.value.toUpperCase();
        
        if (submittedCode === this.correctCode) {
            // Play decode sound
            this.soundEffects.decode.play();
            
            // Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
            
            // First decode achievement
            if (!this.achievements['first_decode']) {
                this.achievements['first_decode'] = true;
                this.updateAchievementsPanel();
            }
            
            this.score += 10 * this.level;
            this.level++;
            
            // Level 5 achievement
            if (this.level === 5 && !this.achievements['level_5']) {
                this.achievements['level_5'] = true;
                this.updateAchievementsPanel();
                this.soundEffects.levelUp.play();
            }
            
            // Update character reaction
            this.updateCharacterReaction('success');
            
            document.getElementById('score').textContent = this.score;
            document.getElementById('level').textContent = this.level;
            
            // Reset the game with increased difficulty
            this.initializeGame();
            inputElement.value = '';
        } else {
            // Shake animation for incorrect code
            const codeInputArea = document.getElementById('code-input-area');
            codeInputArea.classList.add('shake');
            setTimeout(() => codeInputArea.classList.remove('shake'), 500);
            
            // Update character reaction
            this.updateCharacterReaction('failure');
        }
    }
    
    updateCharacterReaction(type) {
        const reactionElement = document.getElementById('character-reaction');
        const reactions = {
            success: ['🤖', '✨', '🎉', '💡'],
            failure: ['😱', '🤔', '😅', '🤨']
        };
        
        const randomReaction = reactions[type][Math.floor(Math.random() * reactions[type].length)];
        reactionElement.textContent = randomReaction;
    }
    
    startTimer() {
        const timerElement = document.getElementById('time');
        
        const timerInterval = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            // Time master achievement
            if (this.timeLeft <= 10 && !this.achievements['time_master']) {
                this.achievements['time_master'] = true;
                this.updateAchievementsPanel();
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(timerInterval);
                this.gameOver();
            }
        }, 1000);
    }
    
    activateTimeBoost() {
        if (this.powerUps.timeBoosts > 0) {
            this.timeLeft += 10;
            this.powerUps.timeBoosts--;
            document.getElementById('time').textContent = this.timeLeft;
            document.getElementById('time-boost').disabled = this.powerUps.timeBoosts === 0;
        }
    }
    
    useHint() {
        if (this.powerUps.hints > 0) {
            const targetCell = document.querySelector('.target-code');
            if (targetCell) {
                targetCell.classList.add('hint-active');
                this.powerUps.hints--;
                document.getElementById('hint-btn').disabled = this.powerUps.hints === 0;
            }
        }
    }
    
    randomizeGrid() {
        if (this.powerUps.randomize > 0) {
            this.initializeGame();
            this.powerUps.randomize--;
            document.getElementById('randomize-btn').disabled = this.powerUps.randomize === 0;
        }
    }
    
    initAchievementsPanel() {
        const achievementList = document.getElementById('achievement-list');
        achievementList.innerHTML = `
            <div id="first-decode-achievement" class="achievement-item">
                <i class="fas fa-code"></i> First Decode
            </div>
            <div id="level-5-achievement" class="achievement-item">
                <i class="fas fa-level-up-alt"></i> Level 5 Master
            </div>
            <div id="time-master-achievement" class="achievement-item">
                <i class="fas fa-clock"></i> Time Master
            </div>
            <div id="easter-egg-achievement" class="achievement-item">
                <i class="fas fa-egg"></i> Konami Master
            </div>
        `;
    }
    
    updateAchievementsPanel() {
        Object.keys(this.achievements).forEach(achievement => {
            const achievementElement = document.getElementById(`${achievement.replace('_', '-')}-achievement`);
            if (this.achievements[achievement]) {
                achievementElement.classList.add('achieved');
            }
        });
    }
    
    shareScore() {
        const score = document.getElementById('final-score').textContent;
        const shareText = `I decoded ${score} points in Cyber Nexus! Can you beat my score? 🖥️🔓 #CyberNexus`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Cyber Nexus Score',
                text: shareText
            }).catch(console.error);
        } else {
            // Fallback for browsers without Web Share API
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Score copied to clipboard!');
            });
        }
    }
    
    gameOver() {
        // Stop background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        
        // Play game over sound
        this.soundEffects.gameOver.play();
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
        
        // Trigger game over confetti
        confetti({
            particleCount: 200,
            spread: 150,
            origin: { y: 0.6 }
        });
    }
    
    restartGame() {
        // Restart background music
        if (this.bgMusic) {
            this.bgMusic.play();
        }
        
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.powerUps = {
            timeBoosts: 2,
            hints: 1,
            randomize: 1
        };
        
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('time').textContent = this.timeLeft;
        
        document.getElementById('game-over').classList.add('hidden');
        
        this.initializeGame();
        this.startTimer();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CyberNexus();
});
