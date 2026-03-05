import { motion } from 'framer-motion';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
}

export function ScoreRing({ score, maxScore = 10 }: ScoreRingProps) {
  const percentage = (score / maxScore) * 100;
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on score
  const getScoreColor = () => {
    if (score >= 7) return 'hsl(var(--success))';
    if (score >= 5) return 'hsl(var(--warning))';
    return 'hsl(var(--destructive))';
  };

  return (
    <div className="score-ring">
      <svg width="200" height="200" className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="hsl(var(--secondary))"
          strokeWidth="12"
        />
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center"
        >
          <span 
            className="text-6xl font-display font-bold"
            style={{ color: getScoreColor() }}
          >
            {score}
          </span>
          <span className="text-2xl text-muted-foreground">/{maxScore}</span>
        </motion.div>
      </div>
    </div>
  );
}
