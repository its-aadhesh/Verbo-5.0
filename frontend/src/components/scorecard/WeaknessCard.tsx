import { motion } from 'framer-motion';
import { XCircle, Quote, Wrench } from 'lucide-react';
import { WeaknessItem } from '@/services/api';

interface WeaknessCardProps {
  weakness: WeaknessItem;
  delay?: number;
}

export function WeaknessCard({ weakness, delay = 0 }: WeaknessCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="border border-destructive/20 bg-destructive/5 rounded-lg p-4 space-y-3"
    >
      {/* Topic */}
      <div className="flex items-start gap-2">
        <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
        <span className="text-sm font-medium text-foreground">
          {weakness.question_or_topic}
        </span>
      </div>

      {/* User Snapshot */}
      <div className="pl-6">
        <div className="flex items-start gap-2 text-muted-foreground">
          <Quote className="w-3 h-3 mt-1 flex-shrink-0" />
          <p className="text-xs italic">"{weakness.user_snapshot}"</p>
        </div>
      </div>

      {/* Why Problem */}
      <div className="pl-6">
        <p className="text-xs text-destructive">
          {weakness.why_this_is_a_problem}
        </p>
      </div>

      {/* How to Fix */}
      {weakness.how_to_fix && (
        <div className="pl-6 flex items-start gap-2">
          <Wrench className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            {weakness.how_to_fix}
          </p>
        </div>
      )}
    </motion.div>
  );
}
