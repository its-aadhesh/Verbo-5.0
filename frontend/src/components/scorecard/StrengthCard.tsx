import { motion } from 'framer-motion';
import { CheckCircle2, Quote, Lightbulb } from 'lucide-react';
import { StrengthItem } from '@/services/api';

interface StrengthCardProps {
  strength: StrengthItem;
  delay?: number;
}

export function StrengthCard({ strength, delay = 0 }: StrengthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-success/20 bg-success/5 rounded-lg p-4 space-y-3"
    >
      {/* Topic */}
      <div className="flex items-start gap-2">
        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
        <span className="text-sm font-medium text-foreground">
          {strength.question_or_topic}
        </span>
      </div>

      {/* User Snapshot */}
      <div className="pl-6">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Quote className="w-3 h-3 mt-1 flex-shrink-0" />
          <p className="text-xs italic">"{strength.user_snapshot}"</p>
        </div>
      </div>

      {/* Why Good */}
      <div className="pl-6">
        <p className="text-xs text-success">
          {strength.why_this_is_good}
        </p>
      </div>

      {/* How to Improve */}
      {strength.how_to_improve_further && (
        <div className="pl-6 flex items-start gap-2">
          <Lightbulb className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {strength.how_to_improve_further}
          </p>
        </div>
      )}
    </motion.div>
  );
}
