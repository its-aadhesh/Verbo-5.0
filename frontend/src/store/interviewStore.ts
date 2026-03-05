import { create } from 'zustand';
import { InterviewMode, InterviewReport } from '@/services/api';
import { VoiceStatus } from '@/services/voice';

export type InterviewPhase = 'landing' | 'interview' | 'loading-report' | 'scorecard';

interface Message {
  id: string;
  role: 'interviewer' | 'user';
  content: string;
  timestamp: Date;
}

interface InterviewState {
  // Interview phase
  phase: InterviewPhase;
  setPhase: (phase: InterviewPhase) => void;

  // Session
  sessionId: string | null;

  // Interview details
  mode: InterviewMode | null;
  botName: string;
  
  // CV upload
  cvUploaded: boolean;
  setCvUploaded: (uploaded: boolean) => void;
  
  // Messages
  messages: Message[];
  currentTranscript: string;
  
  // Voice status
  voiceStatus: VoiceStatus;
  
  // Report
  report: InterviewReport | null;
  reportError: string | null;

  // Actions
  startInterview: (sessionId: string, mode: InterviewMode, botName: string, firstMessage: string) => void;
  addMessage: (role: 'interviewer' | 'user', content: string) => void;
  setCurrentTranscript: (transcript: string) => void;
  setVoiceStatus: (status: VoiceStatus) => void;
  setReport: (report: InterviewReport) => void;
  setReportError: (error: string) => void;
  reset: () => void;
}

const initialState = {
  phase: 'landing' as InterviewPhase,
  sessionId: null,
  mode: null,
  botName: '',
  cvUploaded: false,
  messages: [],
  currentTranscript: '',
  voiceStatus: 'idle' as VoiceStatus,
  report: null,
  reportError: null,
};

export const useInterviewStore = create<InterviewState>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setCvUploaded: (uploaded) => set({ cvUploaded: uploaded }),

  startInterview: (sessionId, mode, botName, firstMessage) => set({
    phase: 'interview',
    sessionId,
    mode,
    botName,
    messages: [{
      id: crypto.randomUUID(),
      role: 'interviewer',
      content: firstMessage,
      timestamp: new Date(),
    }],
    currentTranscript: '',
    voiceStatus: 'idle',
    report: null,
    reportError: null,
  }),

  addMessage: (role, content) => set((state) => ({
    messages: [
      ...state.messages,
      {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date(),
      },
    ],
  })),

  setCurrentTranscript: (transcript) => set({ currentTranscript: transcript }),

  setVoiceStatus: (status) => set({ voiceStatus: status }),

  setReport: (report) => set({ report, reportError: null }),

  setReportError: (error) => set({ reportError: error }),

  reset: () => set(initialState),
}));
