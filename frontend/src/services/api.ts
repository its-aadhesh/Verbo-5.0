const API_BASE_URL = 'http://127.0.0.1:8000';

export type InterviewMode = 'corporate' | 'startup' | 'faang';

export interface StartInterviewResponse {
  session_id: string;
  bot_name: string;
  message: string;
  interview_over: boolean;
}

export interface ChatResponse {
  message: string;
  interview_over: boolean;
}

export interface CategoryScores {
  technical: number;
  communication: number;
  problem_solving: number;
}

export interface StrengthItem {
  question_or_topic: string;
  user_snapshot: string;
  why_this_is_good: string;
  how_to_improve_further: string;
}

export interface WeaknessItem {
  question_or_topic: string;
  user_snapshot: string;
  why_this_is_a_problem: string;
  how_to_fix: string;
}

export interface InterviewReport {
  overall_score: number;
  category_scores: CategoryScores;
  strengths: StrengthItem[];
  weaknesses: WeaknessItem[];
}

export const api = {
  async uploadCV(file: File): Promise<{ status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload_cv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || 'Failed to upload CV');
    }

    return response.json();
  },

  async startInterview(mode: InterviewMode): Promise<StartInterviewResponse> {
    const response = await fetch(`${API_BASE_URL}/start_interview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mode }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start interview: ${response.statusText}`);
    }

    return response.json();
  },

  async sendMessage(sessionId: string, answer: string): Promise<ChatResponse> {
    const response = await fetch(`${API_BASE_URL}/chat?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  },

  async forceEnd(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/force_end?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to force end: ${response.statusText}`);
    }
  },

  async endInterview(sessionId: string): Promise<InterviewReport> {
    const response = await fetch(`${API_BASE_URL}/end_interview?session_id=${encodeURIComponent(sessionId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to end interview: ${response.statusText}`);
    }

    const data = await response.json();
    
    // The report can be either a parsed object or a JSON string
    let report: InterviewReport;
    
    if (typeof data.report === 'string') {
      // Backend returned JSON string - need to parse
      try {
        let reportString = data.report;
        
        // Remove markdown code blocks if present
        reportString = reportString
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        
        // Try to extract JSON if wrapped in other text
        const jsonMatch = reportString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          reportString = jsonMatch[0];
        }
        
        report = JSON.parse(reportString);
      } catch (parseError) {
        console.error('Failed to parse report string:', parseError);
        console.error('Raw report:', data.report);
        throw new Error('Failed to parse interview report');
      }
    } else if (typeof data.report === 'object' && data.report !== null) {
      // Backend returned parsed object directly
      report = data.report;
    } else {
      throw new Error('Invalid report format received');
    }
    
    // Validate and sanitize the report
    return {
      overall_score: typeof report.overall_score === 'number' 
        ? Math.max(0, Math.min(10, report.overall_score)) 
        : 0,
      category_scores: {
        technical: typeof report.category_scores?.technical === 'number'
          ? Math.max(0, Math.min(10, report.category_scores.technical))
          : 0,
        communication: typeof report.category_scores?.communication === 'number'
          ? Math.max(0, Math.min(10, report.category_scores.communication))
          : 0,
        problem_solving: typeof report.category_scores?.problem_solving === 'number'
          ? Math.max(0, Math.min(10, report.category_scores.problem_solving))
          : 0,
      },
      strengths: Array.isArray(report.strengths) 
        ? report.strengths.filter((s): s is StrengthItem => 
            typeof s === 'object' && s !== null && 
            typeof s.question_or_topic === 'string'
          )
        : [],
      weaknesses: Array.isArray(report.weaknesses)
        ? report.weaknesses.filter((w): w is WeaknessItem =>
            typeof w === 'object' && w !== null &&
            typeof w.question_or_topic === 'string'
          )
        : [],
    };
  },
};
