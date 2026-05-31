/**
 * Text-to-Speech Manager
 * Standalone utility for managing browser-based speech synthesis
 * Uses Web Speech API for reading chapter content aloud
 */

class TTSManager {
  constructor(options = {}) {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isSupported = 'speechSynthesis' in window;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentText = '';
    
    // Configuration
    this.config = {
      rate: options.rate || 1.0,        // Speed: 0.1 to 10
      pitch: options.pitch || 1.0,      // Pitch: 0 to 2
      volume: options.volume || 1.0,    // Volume: 0 to 1
      lang: options.lang || 'en-US',    // Language
      voice: options.voice || null      // Specific voice (optional)
    };

    // Callbacks
    this.onStart = options.onStart || null;
    this.onEnd = options.onEnd || null;
    this.onPause = options.onPause || null;
    this.onResume = options.onResume || null;
    this.onError = options.onError || null;
  }

  /**
   * Check if TTS is supported in current browser
   */
  checkSupport() {
    return this.isSupported;
  }

  /**
   * Extract plain text from HTML content
   * Removes tags, scripts, and excessive whitespace
   */
  extractTextFromHTML(htmlContent) {
    if (!htmlContent) return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = htmlContent;

    // Remove script and style elements
    const scripts = temp.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());

    // Get text content
    let text = temp.textContent || temp.innerText || '';

    // Clean up whitespace
    text = text
      .replace(/\s+/g, ' ')           // Multiple spaces to single
      .replace(/\n\s*\n/g, '\n\n')    // Multiple newlines to double
      .trim();

    return text;
  }

  /**
   * Split text into manageable chunks for better performance
   * Splits on sentence boundaries
   */
  chunkText(text, maxLength = 500) {
    if (text.length <= maxLength) return [text];

    const chunks = [];
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxLength && currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Initialize and start speaking
   */
  speak(text) {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported in this browser');
      if (this.onError) this.onError('not_supported');
      return false;
    }

    // Stop any ongoing speech
    this.stop();

    // Extract plain text if HTML is provided
    const plainText = this.extractTextFromHTML(text);
    
    if (!plainText) {
      console.warn('No text content to speak');
      return false;
    }

    this.currentText = plainText;

    // Create new utterance
    this.utterance = new SpeechSynthesisUtterance(plainText);
    
    // Apply configuration
    this.utterance.rate = this.config.rate;
    this.utterance.pitch = this.config.pitch;
    this.utterance.volume = this.config.volume;
    this.utterance.lang = this.config.lang;

    // Set voice if specified
    if (this.config.voice) {
      this.utterance.voice = this.config.voice;
    }

    // Event handlers
    this.utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      if (this.onStart) this.onStart();
    };

    this.utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      if (this.onEnd) this.onEnd();
    };

    this.utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isPlaying = false;
      this.isPaused = false;
      if (this.onError) this.onError(event);
    };

    this.utterance.onpause = () => {
      this.isPaused = true;
      if (this.onPause) this.onPause();
    };

    this.utterance.onresume = () => {
      this.isPaused = false;
      if (this.onResume) this.onResume();
    };

    // Start speaking
    this.synth.speak(this.utterance);
    return true;
  }

  /**
   * Pause speech
   */
  pause() {
    if (this.isSupported && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      return true;
    }
    return false;
  }

  /**
   * Resume speech
   */
  resume() {
    if (this.isSupported && this.isPlaying && this.isPaused) {
      this.synth.resume();
      return true;
    }
    return false;
  }

  /**
   * Stop speech completely
   */
  stop() {
    if (this.isSupported) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      return true;
    }
    return false;
  }

  /**
   * Toggle between play/pause
   */
  toggle() {
    if (!this.isPlaying) {
      // Not playing, start from beginning
      return false; // Caller should call speak()
    } else if (this.isPaused) {
      // Paused, resume
      return this.resume();
    } else {
      // Playing, pause
      return this.pause();
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isSupported: this.isSupported,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isSpeaking: this.synth.speaking,
      isPending: this.synth.pending
    };
  }

  /**
   * Get available voices
   */
  getVoices() {
    if (!this.isSupported) return [];
    return this.synth.getVoices();
  }

  /**
   * Set voice by name or index
   */
  setVoice(voiceNameOrIndex) {
    const voices = this.getVoices();
    
    if (typeof voiceNameOrIndex === 'number') {
      this.config.voice = voices[voiceNameOrIndex] || null;
    } else {
      this.config.voice = voices.find(v => v.name === voiceNameOrIndex) || null;
    }
  }

  /**
   * Update configuration
   */
  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSManager;
}
