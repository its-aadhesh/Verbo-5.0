import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'interviewer' | 'user';
  content: string;
  timestamp: Date;
}

interface MessagePanelProps {
  messages: Message[];
  currentTranscript: string;
}

export function MessagePanel({ messages, currentTranscript }: MessagePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript]);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-4 pr-2"
    >
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`${message.role === 'interviewer' ? 'pr-8' : 'pl-8'}`}
        >
          <div
            className={`
              rounded-2xl p-4
              ${message.role === 'interviewer' 
                ? 'glass-card border-primary/20' 
                : 'bg-secondary/50 ml-auto'
              }
            `}
          >
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {message.role === 'interviewer' ? 'Interviewer' : 'You'}
            </p>
            <p className="text-foreground leading-relaxed">
              {message.content}
            </p>
          </div>
        </motion.div>
      ))}

      {/* Live transcript */}
      {currentTranscript && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pl-8"
        >
          <div className="bg-secondary/30 rounded-2xl p-4 border border-dashed border-primary/30">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">
              You (speaking...)
            </p>
            <p className="text-foreground/80 italic leading-relaxed">
              {currentTranscript}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
