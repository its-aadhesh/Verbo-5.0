import { motion } from 'framer-motion';
import { Mic, Target, Sparkles, Upload, FileText, CheckCircle2 } from 'lucide-react';
import { InterviewerCard } from './InterviewerCard';
import { InterviewMode, api } from '@/services/api';
import { useInterviewStore } from '@/store/interviewStore';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

const interviewers = [
  {
    mode: 'corporate' as InterviewMode,
    name: 'Ms. Ananya Rao',
    title: 'Senior Corporate Hiring Manager',
    description: 'Formal and structured interviews focused on professionalism, communication, and corporate problem-solving scenarios.',
  },
  {
    mode: 'startup' as InterviewMode,
    name: 'Kavya Nair',
    title: 'Startup Hiring Manager',
    description: 'Warm and encouraging conversations about projects, practical engineering, and your passion for building products.',
  },
  {
    mode: 'faang' as InterviewMode,
    name: 'Dr. Meera Iyer',
    title: 'Senior FAANG Engineer',
    description: 'Intense technical deep-dives into algorithms, system design, optimization, and scalability challenges.',
  },
];

const features = [
  { icon: Mic, text: 'Voice-first experience' },
  { icon: Target, text: 'Real interview scenarios' },
  { icon: Sparkles, text: 'Instant AI feedback' },
];

export function LandingPage() {
  const { startInterview, cvUploaded, setCvUploaded } = useInterviewStore();
  const [loading, setLoading] = useState<InterviewMode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf')) {
      setError('Only PDF files are allowed');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await api.uploadCV(file);
      setCvUploaded(true);
      setCvFileName(file.name);
    } catch (err) {
      console.error('Failed to upload CV:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectInterviewer = async (mode: InterviewMode) => {
    setLoading(mode);
    setError(null);

    try {
      const response = await api.startInterview(mode);
      startInterview(response.session_id, mode, response.bot_name, response.message);
    } catch (err) {
      console.error('Failed to start interview:', err);
      setError('Failed to connect to the interview server. Make sure the backend is running at http://127.0.0.1:8000');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm">
            <Sparkles className="w-4 h-4" />
            AI-Powered Interview Practice
          </div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl md:text-7xl font-display font-bold gradient-text mb-4">
            Verbo
          </h1>
          <p className="text-xl text-muted-foreground">
            Your personal AI interview coach
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {features.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </motion.div>

        {/* CV Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="glass-card p-6 text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Your Resume (Optional)
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your CV to get personalized interview questions
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleCVUpload}
              className="hidden"
            />
            
            {cvUploaded ? (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">{cvFileName || 'CV uploaded successfully'}</span>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload PDF Resume
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Interviewer Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
            Choose your interviewer
          </h2>
          <p className="text-muted-foreground">
            Select an interview style that matches your career goals
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-destructive/20 border border-destructive/30 text-destructive text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Interviewer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {interviewers.map((interviewer, index) => (
            <div key={interviewer.mode} className="relative">
              <InterviewerCard
                {...interviewer}
                onSelect={handleSelectInterviewer}
                delay={0.4 + index * 0.1}
              />
              {loading === interviewer.mode && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-muted-foreground">Starting interview...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-16 text-sm text-muted-foreground"
        >
          Practice makes perfect • Powered by AI
        </motion.footer>
      </div>
    </div>
  );
}
