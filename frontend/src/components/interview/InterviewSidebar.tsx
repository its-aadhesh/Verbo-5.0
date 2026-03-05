import { User, Building2, Rocket, Code2 } from 'lucide-react';
import { InterviewMode } from '@/services/api';
import { VoiceStatus } from '@/services/voice';

interface InterviewSidebarProps {
  botName: string;
  mode: InterviewMode;
  voiceStatus: VoiceStatus;
}

const modeLabels: Record<InterviewMode, string> = {
  corporate: 'Corporate Interview',
  startup: 'Startup Interview',
  faang: 'FAANG Interview',
};

const modeIcons: Record<InterviewMode, React.ReactNode> = {
  corporate: <Building2 className="w-4 h-4" />,
  startup: <Rocket className="w-4 h-4" />,
  faang: <Code2 className="w-4 h-4" />,
};

const statusColors: Record<VoiceStatus, string> = {
  idle: 'bg-muted-foreground',
  listening: 'bg-success',
  thinking: 'bg-warning',
  speaking: 'bg-primary',
};

const statusLabels: Record<VoiceStatus, string> = {
  idle: 'Ready',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
};

export function InterviewSidebar({ botName, mode, voiceStatus }: InterviewSidebarProps) {
  return (
    <aside className="w-56 flex flex-col gap-6">
      {/* Interviewer Avatar */}
      <div className="flex flex-col items-start">
        <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3">
          <User className="w-7 h-7 text-muted-foreground" />
        </div>
        <h2 className="font-display font-semibold text-foreground">{botName}</h2>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          {modeIcons[mode]}
          <span>{modeLabels[mode]}</span>
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Status</p>
        <div className="flex items-center gap-2">
          <div className={`status-dot ${statusColors[voiceStatus]}`} />
          <span className="text-sm text-foreground">{statusLabels[voiceStatus]}</span>
        </div>
      </div>

      {/* Tips */}
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Tips</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Speak clearly and naturally</li>
          <li>• Take your time to think</li>
          <li>• Click mic when ready</li>
        </ul>
      </div>
    </aside>
  );
}
