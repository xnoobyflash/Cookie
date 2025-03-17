class CookieGame {
    constructor() {
        this.cookies = 0;
        this.usedCodes = new Set();
        this.clickMultiplier = 1;
        this.autoClickInterval = null;
        this.setupEventListeners();
        this.loadGame();
        this.startAutoSave();
        this.updateDisplay();
    }

    setupEventListeners() {
        const toggleCodeVisibility = document.getElementById('toggleCodeVisibility');
        const codeInput = document.getElementById('codeInput');
        
        toggleCodeVisibility.addEventListener('click', () => {
            codeInput.classList.toggle('hidden');
            toggleCodeVisibility.querySelector('.eye-icon').textContent = 
                codeInput.classList.contains('hidden') ? '👁️‍🗨️' : '👁️';
        });
        
        const cookieButton = document.getElementById('cookieButton');
        cookieButton.addEventListener('click', () => {
            this.addCookies(1 * this.clickMultiplier);
            cookieButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                cookieButton.style.transform = '';
            }, 100);
        });

        const resetButton = document.getElementById('resetGame');
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? This will reset your cookies and allow you to use codes again.')) {
                this.resetGame();
            }
        });

        const submitButton = document.getElementById('submitCode');
        submitButton.addEventListener('click', () => {
            this.submitCode();
        });
    }

    submitCode() {
        const codeInput = document.getElementById('codeInput');
        const code = codeInput.value.toLowerCase().trim();

        if (code === 'bluelagoon' && !this.usedCodes.has(code)) {
            this.addCookies(1000000000);
            this.usedCodes.add(code);
            codeInput.value = '';
            alert('Code redeemed successfully!');
        } else if (code === '1stplayer' && !this.usedCodes.has(code)) {
            this.addCookies(1000000000000);
            this.usedCodes.add(code);
            codeInput.value = '';
            alert('Code redeemed successfully!');
        } else if (code === '5xtoe' && !this.usedCodes.has(code)) {
            this.clickMultiplier = 5;
            this.usedCodes.add(code);
            codeInput.value = '';
            alert('Code redeemed successfully! You now get 5 cookies per click!');
        } else if (code === 'ronin' && !this.usedCodes.has(code)) {
            this.clickMultiplier = -50;
            this.usedCodes.add(code);
            codeInput.value = '';
            alert('Code Successfully redeemed!');
        } else if (code === 'devtek') {
            alert('Available Codes:\n\n' +
                  'bluelagoon - Gives 1 billion cookies\n' +
                  '1stplayer - Gives 1 trillion cookies\n' +
                  '5xtoe - Gives 5 cookies per click\n' +
                  'ronin - Gives -50 cookies per click\n' +
                  'devtek - Shows this list of codes');
        } else if (code === 'dev001xyz') {
            const options = `Developer Control Panel

Click Multiplier:
[1] 1x    [2] 2x    [3] 3x
[4] 5x    [5] 10x   [6] 25x   [7] 50x

Auto-Click Speed:
[a] Off   [b] 1s    [c] 500ms
[d] 250ms [e] 100ms [f] 50ms

Cookie Amount:
[s] Set cookie amount

Other Options:
[r] Reset all used codes

Enter your choices (e.g., "2sf" for 2x multiplier, set cookies, and 50ms auto-click):`;

            const choice = prompt(options);
            if (choice) {
                // Handle multiplier
                const multiplierChoice = choice.match(/[1234567]/)?.[0];
                if (multiplierChoice) {
                    const multiplierValues = [1, 2, 3, 5, 10, 25, 50];
                    this.clickMultiplier = multiplierValues[parseInt(multiplierChoice) - 1];
                }

                // Handle auto-click
                const speedChoice = choice.match(/[abcdef]/)?.[0];
                if (speedChoice) {
                    // Clear existing intervals
                    if (this.autoClickInterval) clearInterval(this.autoClickInterval);
                    const speeds = { b: 1000, c: 500, d: 250, e: 100, f: 50 };
                    if (speeds[speedChoice]) {
                        this.autoClickInterval = setInterval(() => this.addCookies(this.clickMultiplier), speeds[speedChoice]);
                    }
                }

                // Handle cookie amount
                if (choice.includes('s')) {
                    const amount = prompt('Enter number of cookies:');
                    if (amount && !isNaN(amount)) {
                        this.cookies = parseInt(amount);
                    }
                }

                // Handle code reset
                if (choice.includes('r')) {
                    this.usedCodes.clear();
                }
            }
            this.updateDisplay();
            this.saveGame();
        } else if (this.usedCodes.has(code)) {
            alert('This code has already been used!');
        } else {
            alert('Invalid code!');
        }
    }

    resetGame() {
        this.cookies = 0;
        this.usedCodes.clear();
        this.clickMultiplier = 1;
        if (this.autoClickInterval) clearInterval(this.autoClickInterval);
        this.autoClickInterval = null;
        this.updateDisplay();
        this.saveGame();
        alert('Game has been reset!');
    }

    addCookies(amount) {
        this.cookies += amount;
        this.updateDisplay();
        this.saveGame();
    }

    updateDisplay() {
        const cookieCount = document.getElementById('cookieCount');
        cookieCount.textContent = `${this.cookies} cookies`;
    }

    saveGame() {
        const gameState = {
            cookies: this.cookies,
            usedCodes: Array.from(this.usedCodes),
            clickMultiplier: this.clickMultiplier
        };
        localStorage.setItem('cookieGame', JSON.stringify(gameState));
    }

    loadGame() {
        const savedState = localStorage.getItem('cookieGame');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.cookies = gameState.cookies;
            this.usedCodes = new Set(gameState.usedCodes);
            this.clickMultiplier = gameState.clickMultiplier || 1;
        }
    }

    startAutoSave() {
        setInterval(() => this.saveGame(), 30000);
    }
}

window.addEventListener('load', () => {
    new CookieGame();
});

//This is a placeholder.  You'll need to define the AudioManager class separately.
class AudioManager {
    constructor() {
        this.sounds = {
            laser: new Audio('laser.wav'), //replace with actual sound file path
            explosion: new Audio('explosion.wav'), //replace with actual sound file path
            gameOver: new Audio('gameOver.wav') //replace with actual sound file path

        };
    }
    play(sound) {
        this.sounds[sound].play();
    }
}