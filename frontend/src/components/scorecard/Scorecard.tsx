import { motion } from 'framer-motion';
import { RotateCcw, ThumbsUp, ThumbsDown, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreRing } from './ScoreRing';
import { CategoryScoreBar } from './CategoryScoreBar';
import { StrengthCard } from './StrengthCard';
import { WeaknessCard } from './WeaknessCard';
import { useInterviewStore } from '@/store/interviewStore';

export function Scorecard() {
  const { report, reportError, botName, reset, phase } = useInterviewStore();

  const handleNewInterview = () => {
    reset();
  };

  // Loading state
  if (phase === 'loading-report') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary mx-auto mb-6 animate-spin" />
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
            Generating Interview Report
          </h2>
          <p className="text-muted-foreground">
            Please wait while we analyze your interview performance...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (reportError || !report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card max-w-md w-full p-8 text-center"
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
            Report Generation Failed
          </h2>
          <p className="text-muted-foreground mb-6">
            {reportError || 'Unable to generate your interview report. Please try again.'}
          </p>
          <Button onClick={handleNewInterview} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start New Interview
          </Button>
        </motion.div>
      </div>
    );
  }

  const getVerdictBadge = () => {
    const score = report.overall_score;
    if (score >= 7) {
      return { className: 'verdict-positive', icon: ThumbsUp, text: 'Strong Candidate' };
    }
    if (score >= 5) {
      return { className: 'verdict-neutral', icon: AlertCircle, text: 'Needs Improvement' };
    }
    return { className: 'verdict-negative', icon: ThumbsDown, text: 'Not Ready' };
  };

  const verdictBadge = getVerdictBadge();
  const VerdictIcon = verdictBadge.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Interview Complete
          </h1>
          <p className="text-muted-foreground">
            Here's your performance evaluation from {botName}
          </p>
        </motion.header>

        {/* Overall Score Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8 flex flex-col items-center"
        >
          <ScoreRing score={report.overall_score} />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className={`verdict-badge ${verdictBadge.className} mt-6`}
          >
            <VerdictIcon className="w-4 h-4" />
            {verdictBadge.text}
          </motion.div>
        </motion.div>

        {/* Category Scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <CategoryScoreBar 
            label="Technical Skills" 
            score={report.category_scores.technical} 
            delay={0.4}
          />
          <CategoryScoreBar 
            label="Communication" 
            score={report.category_scores.communication} 
            delay={0.5}
          />
          <CategoryScoreBar 
            label="Problem Solving" 
            score={report.category_scores.problem_solving} 
            delay={0.6}
          />
        </motion.div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-success" />
              Strengths
            </h3>
            {report.strengths.length > 0 ? (
              <div className="space-y-4">
                {report.strengths.map((strength, index) => (
                  <StrengthCard key={index} strength={strength} delay={0.6 + index * 0.1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No strengths identified.
              </p>
            )}
          </motion.div>

          {/* Weaknesses */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <ThumbsDown className="w-5 h-5 text-destructive" />
              Areas to Improve
            </h3>
            {report.weaknesses.length > 0 ? (
              <div className="space-y-4">
                {report.weaknesses.map((weakness, index) => (
                  <WeaknessCard key={index} weakness={weakness} delay={0.6 + index * 0.1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No weaknesses identified.
              </p>
            )}
          </motion.div>
        </div>

        {/* New Interview Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleNewInterview}
            size="lg"
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Interview
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
