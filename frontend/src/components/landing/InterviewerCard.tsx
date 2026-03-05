import { motion } from 'framer-motion';
import { Building2, Rocket, Code2, User, ArrowRight } from 'lucide-react';
import { InterviewMode } from '@/services/api';

interface InterviewerCardProps {
  mode: InterviewMode;
  name: string;
  title: string;
  description: string;
  onSelect: (mode: InterviewMode) => void;
  delay?: number;
}

const modeIcons: Record<InterviewMode, React.ReactNode> = {
  corporate: <Building2 className="w-6 h-6" />,
  startup: <Rocket className="w-6 h-6" />,
  faang: <Code2 className="w-6 h-6" />,
};

export function InterviewerCard({ mode, name, title, description, onSelect, delay = 0 }: InterviewerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="interviewer-card group"
      onClick={() => onSelect(mode)}
    >
      {/* Mode Icon */}
      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
        {modeIcons[mode]}
      </div>

      {/* Interviewer Info */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">{name}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        {description}
      </p>

      {/* CTA */}
      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all">
        Start Interview
        <ArrowRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}
