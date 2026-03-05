import { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { LogOut, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InterviewSidebar } from './InterviewSidebar';
import { MessagePanel } from './MessagePanel';
import { MicButton } from './MicButton';
import { useInterviewStore } from '@/store/interviewStore';
import { voiceService, VoiceStatus } from '@/services/voice';
import { api } from '@/services/api';

export function InterviewRoom() {
  const {
    sessionId,
    mode,
    botName,
    messages,
    currentTranscript,
    voiceStatus,
    addMessage,
    setCurrentTranscript,
    setVoiceStatus,
    setPhase,
    setReport,
    setReportError,
  } = useInterviewStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasSpokenFirstMessage = useRef(false);

  // Initialize voice service
  useEffect(() => {
    const success = voiceService.initialize({
      onTranscript: (transcript, isFinal) => {
        if (isFinal) {
          handleUserMessage(transcript);
          setCurrentTranscript('');
        } else {
          setCurrentTranscript(transcript);
        }
      },
      onStatusChange: (status: VoiceStatus) => {
        setVoiceStatus(status);
      },
      onError: (err) => {
        setError(err);
      },
    });

    if (!success) {
      setError('Failed to initialize voice recognition');
    }

    // Speak the first message only once
    if (messages.length > 0 && !hasSpokenFirstMessage.current) {
      hasSpokenFirstMessage.current = true;
      const firstMessage = messages[0].content;
      voiceService.speak(firstMessage);
    }

    return () => {
      voiceService.cleanup();
    };
  }, []);

  const handleUserMessage = useCallback(async (transcript: string) => {
    if (!transcript.trim() || isProcessing || !sessionId) return;

    setIsProcessing(true);
    voiceService.setThinking();
    
    addMessage('user', transcript);

    try {
      const response = await api.sendMessage(sessionId, transcript);
      
      addMessage('interviewer', response.message);
      
      await voiceService.speak(response.message);

      if (response.interview_over) {
        handleEndInterview();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to communicate with the server. Please try again.');
      setVoiceStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, isProcessing, sessionId]);

  const handleMicToggle = useCallback(() => {
    // Don't allow mic toggle while speaking or processing
    if (voiceService.isSpeaking() || isProcessing) return;

    if (voiceStatus === 'listening') {
      voiceService.stopListening();
    } else if (voiceStatus === 'idle') {
      setError(null);
      voiceService.startListening();
    }
  }, [voiceStatus, isProcessing]);

  const handleEndInterview = useCallback(async () => {
    if (!sessionId) return;
    
    voiceService.cleanup();
    setPhase('loading-report');

    try {
      await api.forceEnd(sessionId);
      const report = await api.endInterview(sessionId);
      setReport(report);
      setPhase('scorecard');
    } catch (err) {
      console.error('Failed to get interview report:', err);
      setReportError('Failed to generate interview report. Please try again.');
      setPhase('scorecard');
    }
  }, [sessionId, setPhase, setReport, setReportError]);

  if (!mode) return null;

  const isMicDisabled = isProcessing || voiceStatus === 'speaking' || voiceStatus === 'thinking';

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen p-6">
        {/* Sidebar */}
        <InterviewSidebar
          botName={botName}
          mode={mode}
          voiceStatus={voiceStatus}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col ml-8">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl font-display font-semibold text-foreground">
              Interview in Progress
            </h1>
            <p className="text-muted-foreground">
              Click the mic to speak, click again to stop
            </p>
          </motion.header>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center gap-2 text-destructive"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          {/* Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex-1 glass-card p-6 mb-6 flex flex-col max-h-[calc(100vh-380px)]"
          >
            <MessagePanel
              messages={messages}
              currentTranscript={currentTranscript}
            />
          </motion.div>

          {/* Mic Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <MicButton
              status={voiceStatus}
              isDisabled={isMicDisabled}
              onToggle={handleMicToggle}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {voiceStatus === 'speaking' && 'AI is speaking...'}
              {voiceStatus === 'thinking' && 'Processing...'}
              {voiceStatus === 'listening' && 'Listening... Click to stop'}
              {voiceStatus === 'idle' && 'Click to start speaking'}
            </p>
          </motion.div>
        </main>

        {/* End Interview Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 left-6"
        >
          <Button
            variant="destructive"
            onClick={handleEndInterview}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            End Interview
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
