import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { VoiceStatus } from '@/services/voice';

interface MicButtonProps {
  status: VoiceStatus;
  isDisabled: boolean;
  onToggle: () => void;
}

export function MicButton({ status, isDisabled, onToggle }: MicButtonProps) {
  const isListening = status === 'listening';
  const isSpeaking = status === 'speaking';
  const isThinking = status === 'thinking';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pulse rings when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.8, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-primary"
              />
            </>
          )}
        </AnimatePresence>

        {/* Main button */}
        <motion.button
          whileHover={{ scale: isDisabled ? 1 : 1.05 }}
          whileTap={{ scale: isDisabled ? 1 : 0.95 }}
          onClick={onToggle}
          disabled={isDisabled || isSpeaking || isThinking}
          className={`
            relative w-24 h-24 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isListening 
              ? 'mic-button listening' 
              : isDisabled || isSpeaking || isThinking
                ? 'bg-muted cursor-not-allowed'
                : 'mic-button'
            }
          `}
        >
          {isThinking ? (
            <Loader2 className="w-10 h-10 text-primary-foreground animate-spin" />
          ) : isListening ? (
            <MicOff className="w-10 h-10 text-primary-foreground" />
          ) : (
            <Mic className="w-10 h-10 text-primary-foreground" />
          )}
        </motion.button>
      </div>

      {/* Status text */}
      <motion.p
        key={status}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm text-muted-foreground"
      >
        {status === 'listening' && 'Listening... Click to stop'}
        {status === 'speaking' && 'AI is speaking...'}
        {status === 'thinking' && 'Processing your response...'}
        {status === 'idle' && 'Click to speak'}
      </motion.p>
    </div>
  );
}
