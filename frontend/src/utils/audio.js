// A simple utility to generate synthesized UI sounds using the Web Audio API
class UIAudioSynthesizer {
    constructor() {
        this.audioContext = null;
        this.isUnlocked = false;

        if (typeof window !== 'undefined') {
            const unlock = () => {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume().then(() => {
                        this.isUnlocked = true;
                    }).catch(() => { });
                } else {
                    this.isUnlocked = true;
                }

                // Remove listeners once unlocked
                ['click', 'touchstart', 'keydown'].forEach(evt =>
                    document.removeEventListener(evt, unlock, { capture: true })
                );
            };

            ['click', 'touchstart', 'keydown'].forEach(evt =>
                document.addEventListener(evt, unlock, { capture: true })
            );
        }
    }

    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended' && this.isUnlocked) {
            this.audioContext.resume().catch(() => { });
        }
    }

    playHoverClick() {
        if (!this.isUnlocked) return;
        this.init();
        if (this.audioContext.state !== 'running') return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }

    playDropThud() {
        if (!this.isUnlocked) return;
        this.init();
        if (this.audioContext.state !== 'running') return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    }

    playTick() {
        if (!this.isUnlocked) return;
        this.init();
        if (this.audioContext.state !== 'running') return;
        const ctx = this.audioContext;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.015, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.02);
    }
}

export const uiAudio = new UIAudioSynthesizer();
