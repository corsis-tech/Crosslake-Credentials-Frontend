/**
 * API utilities for the Crosslake Practitioner Matching System
 * Cleaned up version - removed deprecated non-streaming search functions
 */

import axios from 'axios';

// Configure base API client
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;

// API methods (cleaned up - only keeps functions still in use)
export const matchingApi = {
  /**
   * Get practitioner statistics
   */
  async getPractitionerStats(): Promise<{
    total_vectors: number;
    estimated_unique_practitioners: number;
    index_name: string;
    dimension: number;
    index_fullness: number;
    namespaces: any;
    status: string;
    error?: string;
  }> {
    const response = await api.get('/api/v1/stats/practitioners');
    return response.data;
  },
};

// Practitioner API methods
export const practitionerApi = {
  /**
   * Get detailed information about a specific practitioner
   */
  async getPractitioner(practitionerId: string): Promise<{
    practitioner_id: string;
    name: string;
    email?: string;
    linkedin_url?: string;
    location?: string;
    skills?: string[];
    headline?: string;
    about?: string;
    work_history?: any[];
    project_history?: any;
    enriched_skills?: any[];
    linkedin_about?: string;
    ai_summary?: string;
    linkedin_accomplishments?: any[];
    linkedin_certifications?: any[];
    linkedin_honors_awards?: any[];
    linkedin_languages?: any[];
  }> {
    const response = await api.get(`/api/v1/practitioners/${practitionerId}`);
    return response.data;
  },

  /**
   * Get practitioner summary with enhanced details
   */
  async getPractitionerSummary(practitionerId: string): Promise<{
    name: string;
    headline: string;
    ai_summary: string;
    skills_overview: string[];
    experience_summary: string;
    key_projects: string[];
  }> {
    const response = await api.get(`/api/v1/practitioners/${practitionerId}/summary`);
    return response.data;
  },

  /**
   * Get list of practitioners with filtering options
   */
  async getPractitioners(filters?: {
    limit?: number;
    offset?: number;
    skills?: string[];
    location?: string;
  }): Promise<any[]> {
    const response = await api.get(`/api/v1/practitioners`, {
      params: filters
    });
    return response.data;
  }
};

// Export the axios instance for use in other services
export { api };