// Voice Service - Handles speech recognition and synthesis
// MANUAL MIC CONTROL ONLY - No auto-restart

export type VoiceStatus = 'idle' | 'listening' | 'thinking' | 'speaking';

interface VoiceServiceConfig {
  onTranscript: (transcript: string, isFinal: boolean) => void;
  onStatusChange: (status: VoiceStatus) => void;
  onError: (error: string) => void;
}

class VoiceService {
  private recognition: SpeechRecognitionInstance | null = null;
  private synthesis: SpeechSynthesis;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private config: VoiceServiceConfig | null = null;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initVoice();
  }

  private initVoice() {
    const loadVoices = () => {
      const voices = this.synthesis.getVoices();
      if (voices.length > 0) {
        this.selectFemaleVoice(voices);
      }
    };

    loadVoices();
    
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = loadVoices;
    }
  }

  private selectFemaleVoice(voices: SpeechSynthesisVoice[]) {
    // Priority list of female voice names/patterns
    const femaleVoicePatterns = [
      /google uk english female/i,
      /google us english female/i,
      /microsoft zira/i,
      /samantha/i,
      /karen/i,
      /victoria/i,
      /moira/i,
      /fiona/i,
      /tessa/i,
      /veena/i,
      /female/i,
      /\bwoman\b/i,
    ];

    for (const pattern of femaleVoicePatterns) {
      const femaleVoice = voices.find(voice => pattern.test(voice.name));
      if (femaleVoice) {
        this.selectedVoice = femaleVoice;
        console.log('Selected female voice:', femaleVoice.name);
        return;
      }
    }

    // Fallback: avoid male-sounding names
    const malePatterns = [/david/i, /mark/i, /daniel/i, /alex/i, /james/i, /thomas/i, /fred/i, /ralph/i, /guy/i, /richard/i, /male/i, /\bman\b/i];
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    
    for (const voice of englishVoices) {
      const isMale = malePatterns.some(pattern => pattern.test(voice.name));
      if (!isMale) {
        this.selectedVoice = voice;
        console.log('Selected voice (fallback female):', voice.name);
        return;
      }
    }

    if (englishVoices.length > 0) {
      this.selectedVoice = englishVoices[0];
      console.log('Selected voice (last resort):', englishVoices[0].name);
    }
  }

  initialize(config: VoiceServiceConfig) {
    this.config = config;
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      config.onError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    this.recognition = new SpeechRecognitionAPI();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        this.config?.onTranscript(finalTranscript, true);
      } else if (interimTranscript) {
        this.config?.onTranscript(interimTranscript, false);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      
      // NO AUTO-RESTART - just report error and set idle
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // These are normal - recognition ended without speech
        return;
      }

      if (event.error === 'not-allowed') {
        this.config?.onError('Microphone access denied. Please allow microphone access and refresh.');
        return;
      }

      this.config?.onError(`Speech recognition error: ${event.error}`);
    };

    this.recognition.onend = () => {
      // NO AUTO-RESTART - only update status if we were listening
      if (this.isListening) {
        this.isListening = false;
        this.config?.onStatusChange('idle');
      }
    };

    return true;
  }

  startListening() {
    if (!this.recognition) {
      this.config?.onError('Speech recognition not initialized');
      return;
    }

    // Don't start if already listening
    if (this.isListening) return;

    // Stop any ongoing speech
    this.synthesis.cancel();
    
    this.isListening = true;
    this.config?.onStatusChange('listening');

    try {
      this.recognition.start();
    } catch (e) {
      console.log('Recognition start error:', e);
      this.isListening = false;
      this.config?.onStatusChange('idle');
    }
  }

  stopListening() {
    if (!this.isListening) return;
    
    this.isListening = false;
    
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.log('Recognition stop error:', e);
      }
    }
    
    this.config?.onStatusChange('idle');
  }

  speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      // Stop listening while speaking
      this.stopListening();
      this.config?.onStatusChange('speaking');
      
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }
      
      // Slightly faster speech rate
      utterance.rate = 1.15;
      utterance.pitch = 1.0;
      utterance.volume = 1;

      utterance.onend = () => {
        this.config?.onStatusChange('idle');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.config?.onStatusChange('idle');
        resolve();
      };

      this.synthesis.speak(utterance);
    });
  }

  setThinking() {
    this.config?.onStatusChange('thinking');
  }

  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  getStatus(): VoiceStatus {
    if (this.synthesis.speaking) return 'speaking';
    if (this.isListening) return 'listening';
    return 'idle';
  }

  cleanup() {
    this.stopListening();
    this.synthesis.cancel();
    this.recognition = null;
    this.config = null;
  }
}

// TypeScript declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export const voiceService = new VoiceService();
