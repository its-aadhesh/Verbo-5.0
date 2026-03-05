import { useInterviewStore } from '@/store/interviewStore';
import { LandingPage } from '@/components/landing/LandingPage';
import { InterviewRoom } from '@/components/interview/InterviewRoom';
import { Scorecard } from '@/components/scorecard/Scorecard';

const Index = () => {
  const { phase } = useInterviewStore();

  switch (phase) {
    case 'landing':
      return <LandingPage />;
    case 'interview':
      return <InterviewRoom />;
    case 'loading-report':
    case 'scorecard':
      return <Scorecard />;
    default:
      return <LandingPage />;
  }
};

export default Index;
