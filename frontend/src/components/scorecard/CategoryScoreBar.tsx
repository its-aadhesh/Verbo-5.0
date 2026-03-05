import { motion } from 'framer-motion';

interface CategoryScoreBarProps {
  label: string;
  score: number;
  delay?: number;
}

export function CategoryScoreBar({ label, score, delay = 0 }: CategoryScoreBarProps) {
  const percentage = (score / 10) * 100;
  
  const getColorClass = () => {
    if (score >= 7) return 'bg-success';
    if (score >= 5) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-4"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-primary">{score}/10</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${getColorClass()}`}
        />
      </div>
    </motion.div>
  );
}
