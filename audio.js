class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.sounds = {};
        this.createSounds();
    }

    createSounds() {
        // Laser sound
        this.createOscillatorSound('laser', 880, 0.1);
        
        // Explosion sound
        this.createNoiseSound('explosion', 0.3);
        
        // Game over sound
        this.createOscillatorSound('gameOver', 440, 0.5, 'sawtooth');
    }

    createOscillatorSound(name, frequency, duration, type = 'sine') {
        this.sounds[name] = () => {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
            
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            oscillator.start();
            oscillator.stop(this.context.currentTime + duration);
        };
    }

    createNoiseSound(name, duration) {
        this.sounds[name] = () => {
            const bufferSize = this.context.sampleRate * duration;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            
            source.buffer = buffer;
            gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
            
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            source.start();
        };
    }

    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
}
