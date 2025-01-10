class MatrixCodeBreaker {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        this.matrixGrid = [];
        this.correctCode = '';
        
        this.initializeGame();
        this.setupEventListeners();
        this.startTimer();
    }
    
    initializeGame() {
        const gridElement = document.getElementById('matrix-grid');
        gridElement.innerHTML = '';
        this.matrixGrid = [];
        
        // Generate 5x5 matrix of codes
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.classList.add('matrix-cell');
            
            // Generate a random matrix code
            const code = this.generateMatrixCode();
            cell.textContent = code;
            cell.dataset.code = code;
            
            cell.addEventListener('click', () => this.selectCell(cell));
            gridElement.appendChild(cell);
            this.matrixGrid.push(cell);
        }
        
        // Select a random correct code
        const randomIndex = Math.floor(Math.random() * this.matrixGrid.length);
        this.correctCode = this.matrixGrid[randomIndex].dataset.code;
    }
    
    generateMatrixCode() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({length: 4}, () => 
            characters.charAt(Math.floor(Math.random() * characters.length))
        ).join('');
    }
    
    selectCell(cell) {
        // Highlight selected cell
        this.matrixGrid.forEach(c => c.classList.remove('selected'));
        cell.classList.add('selected');
    }
    
    setupEventListeners() {
        document.getElementById('submit-code').addEventListener('click', () => this.checkCode());
        document.getElementById('restart-game').addEventListener('click', () => this.restartGame());
    }
    
    checkCode() {
        const inputElement = document.getElementById('code-input');
        const submittedCode = inputElement.value.toUpperCase();
        
        if (submittedCode === this.correctCode) {
            this.score += 10 * this.level;
            this.level++;
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
        }
    }
    
    startTimer() {
        const timerElement = document.getElementById('time');
        
        const timerInterval = setInterval(() => {
            this.timeLeft--;
            timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(timerInterval);
                this.gameOver();
            }
        }, 1000);
    }
    
    gameOver() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.timeLeft = 60;
        
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
    new MatrixCodeBreaker();
});
