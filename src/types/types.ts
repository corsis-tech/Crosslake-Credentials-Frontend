// Enhanced skill with proficiency level
export interface EnrichedSkill {
  name: string;
  proficiency: 'Expert' | 'Advanced' | 'Proficient';
  source: 'CV' | 'LinkedIn' | 'Inferred';
}

// Enhanced 1-6 point scoring
export interface EnhancedMatchScore {
  linkedin_match: number;
  project_match: number;
  total_score: number;
  category: 'High' | 'Medium' | 'Low';
}

// Work experience entry
export interface WorkExperience {
  title: string;
  company: string;
  date_range?: string;
  description?: string;
  company_description?: string;
}

// Crosslake project entry
export interface CrosslakeProject {
  project_id: string;
  project_type: string;
  role: string;
  industry: string;
  solution_type?: string;
  close_date?: string;
}

// Crosslake project history summary
export interface ProjectHistory {
  total_projects: number;
  project_types: string[];
  roles_performed: string[];
  industries: string[];
  solution_types: string[];
  recent_projects: CrosslakeProject[];
}

// Detailed match breakdown
export interface MatchBreakdown {
  overall_score: number;
  skill_match_score: number;
  skill_match_rationale?: string;
  seniority_match_score: number;
  seniority_match_rationale?: string;
  project_fit_score: number;
  project_fit_rationale?: string;
  industry_match_score: number;
  industry_match_rationale?: string;
  strengths: string[];
  gaps: string[];
  perfect_match_criteria: string[];
  enhanced_score?: EnhancedMatchScore;
  scoring_methodology?: string;
}

// Individual practitioner match from the API
export interface PractitionerMatch {
  practitioner_id: string;
  name: string;
  headline: string;
  email?: string;
  linkedin_url?: string;
  location?: string;
  skills: string[]; // Legacy field
  match_score: number;
  explanation: string;
  explanation_status?: 'pending' | 'loading' | 'complete' | 'error';
  
  // Enhanced enriched data fields
  enriched_skills?: EnrichedSkill[];
  seniority_level?: string;
  leadership_level?: string;
  good_for_projects?: string[];
  industry_tags?: string[];
  specializations?: string[];
  remote_work_suitability?: string;
  ai_summary?: string;
  match_breakdown?: MatchBreakdown;
  work_history?: WorkExperience[];
  project_history?: ProjectHistory;
  
  // LinkedIn accomplishments data
  linkedin_about?: string;
  linkedin_accomplishments?: string[];
  linkedin_certifications?: string[];
  linkedin_honors_awards?: string[];
  linkedin_languages?: string[];
  linkedin_current_position?: {
    title?: string;
    company?: string;
    duration?: string;
  };
}

// API request/response types
export interface MatchQuery {
  query: string;
  limit?: number;
  prompt?: string;  // Optional custom prompt for O3 explanations
}

// Enhanced structured search query
export interface StructuredMatchQuery {
  role?: string;
  client?: string;
  industry?: string;
  skills?: string[];
  seniority_level?: string;
  free_text_query?: string;
  limit?: number;
  include_explanation?: boolean;
}

// Pitch resume generation request
export interface PitchResumeRequest {
  practitioner_id: string;
  client_name: string;
  role_description: string;
  key_requirements?: string[];
  tone?: string;
  include_contact_info?: boolean;
}

// Pitch resume response
export interface PitchResumeResponse {
  practitioner_id: string;
  client_name: string;
  role_description: string;
  pitch_resume: string;
  key_highlights: string[];
  processing_time_ms: number;
  error?: ApiError;
}

export interface MatchResponse {
  query: string;
  matches: PractitionerMatch[];
  total_results: number;
  processing_time_ms: number;
}

// Error response type
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Types for system selection
export type MatchingSystem = 'original' | 'agentset';
export type IndexType = 'original' | 'semantic';

// Extended response type with system info
export interface ExtendedMatchResponse extends MatchResponse {
  system_used: MatchingSystem;
  index_used?: IndexType;
  reranking_applied?: boolean;
  comparison_metrics?: {
    original_time_ms?: number;
    agentset_time_ms?: number;
    score_differences?: Record<string, number>;
  };
}

// Comparison result type
export interface ComparisonResult {
  original: ExtendedMatchResponse;
  agentset: ExtendedMatchResponse;
  metrics: {
    time_difference_ms: number;
    common_practitioners: string[];
    unique_to_original: string[];
    unique_to_agentset: string[];
    score_correlations: Record<string, { original: number; agentset: number }>;
  };
}