/**
 * Audio handler object
 */
import {AudioContext} from 'standardized-audio-context';

export default {
    mAudio: new Audio(),
    mContext: new AudioContext(),
    mFreq: new Uint8Array(),
    mSource: null,
    mGain: null,
    mAnalyser: null,

    // setup audio routing
    setupAudio() {
        console.log("setupAudio");
        if (this.mSource == null) this.mSource = this.mContext.createMediaElementSource(this.mAudio);

        //Audio gain to manage volume
        if (this.mGain == null) this.mGain = this.mContext.createGain();
        this.mSource.connect(this.mGain);
        this.mGain.connect(this.mContext.destination);
        // Wait for audio load buffer
        this.mAudio.addEventListener('canplaythrough', () => {
            this.playAudio();
        });
        // Frequency Analyzer
        // if (this.mAnalyser == null) this.mAnalyser = this.mContext.createAnalyser();
        if (this.mAnalyser == null) {
            this.mAnalyser = this.mContext.createAnalyser();
            this.mAnalyser.connect(this.mContext.destination);
        } else {
            this.mSource.connect(this.mAnalyser);
        }
        // this.mSource.connect(this.mAnalyser);

        // Activate AudioContext on user event
        if (this.mContext.state === 'suspended') this.unlockAudioContext(this.mContext);
        return this.mAudio;
    },
    // update and return analyser frequency data
    getFreqData() {
        if (this.mAnalyser == null) return 1;
        this.mAnalyser.getByteFrequencyData(this.mFreq);
        return this.mFreq;
    },

    playAudio() {
        if (this.mContext.state === 'running') {
            this.mFreq = new Uint8Array(this.mAnalyser.frequencyBinCount);
            this.mAudio.play().catch(e => {
                console.log("audio :" + e);
            })
        }
    },
    unlockAudioContext(audioCtx) {
        if (audioCtx.state === 'suspended') {
            var events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
            var unlock = function unlock() {
                console.log("audioContext state: " + audioCtx.state);
                if (audioCtx.resume) audioCtx.resume().then(() => {
                    console.log("audioContext resume state: " + audioCtx.state);
                    if (audioCtx.state !== 'suspended') {
                        events.forEach(function (event) {
                            document.body.removeEventListener(event, unlock)
                        });
                    }
                });
            };
            events.forEach(function (event) {
                document.body.addEventListener(event, unlock, false)
            });
        }
    },
    // set audio volume
    setVolume(volume) {
        if (!this.mGain) return;
        volume = parseFloat(volume) || 0.0;
        volume = (volume < 0) ? 0 : volume;
        volume = (volume > 1) ? 1 : volume;
        this.mGain.gain.value = volume;
    },

    // play audio source url
    playSource(source) {
        this.stopAudio();
        this.mAudio.src = String(source || '');
        this.mAudio.crossOrigin = 'anonymous';
        this.mAudio.load();
    },

    // stop playing audio
    stopAudio() {
        try {
            this.mAudio.pause(0);
        } catch (e) {
            console.log(e);
        }
    },
}
