import axios from 'axios';
import { api } from '../utils/api';
import type { PitchResumeRequest, PitchResumeResponse, ApiError } from '../types/types';

/**
 * Service for pitch resume generation functionality
 */
export const pitchResumeService = {
  /**
   * Generate a tailored pitch resume for a practitioner
   */
  async generatePitchResume(request: PitchResumeRequest): Promise<PitchResumeResponse> {
    try {
      const response = await api.post<PitchResumeResponse>('/api/v1/pitch-resume', request);
      return response.data;
    } catch (error) {
      // Transform axios error to our ApiError format
      if (axios.isAxiosError(error)) {
        const apiError: ApiError = {
          message: error.response?.data?.detail || error.message || 'Failed to generate pitch resume',
          code: error.response?.status?.toString() || 'UNKNOWN_ERROR',
          details: error.response?.data
        };
        throw apiError;
      }
      throw error;
    }
  },

  /**
   * Generate a pitch resume with simplified parameters
   */
  async generateSimplePitchResume(
    practitioner_id: string,
    client_name: string,
    role_description: string,
    key_requirements: string[] = [],
    tone: string = 'professional',
    include_contact_info: boolean = true
  ): Promise<PitchResumeResponse> {
    const request: PitchResumeRequest = {
      practitioner_id,
      client_name,
      role_description,
      key_requirements,
      tone,
      include_contact_info
    };

    return this.generatePitchResume(request);
  },

  /**
   * Generate a pitch resume from a search query context
   */
  async generatePitchResumeFromQuery(
    practitioner_id: string,
    query: string,
    client_name?: string,
    key_requirements: string[] = []
  ): Promise<PitchResumeResponse> {
    // Extract role and client from query if not provided
    const extractedClient = client_name || this.extractClientFromQuery(query) || 'Valued Client';
    const role_description = this.extractRoleFromQuery(query) || query;

    const request: PitchResumeRequest = {
      practitioner_id,
      client_name: extractedClient,
      role_description,
      key_requirements,
      tone: 'professional',
      include_contact_info: true
    };

    return this.generatePitchResume(request);
  },

  /**
   * Helper function to extract client name from query
   */
  extractClientFromQuery(query: string): string | null {
    // Simple regex patterns to extract client names
    const clientPatterns = [
      /client[:\s]+([^.]+)/i,
      /for ([A-Z][a-z]+ [A-Z][a-z]+)/,
      /working with ([A-Z][a-z]+ [A-Z][a-z]+)/,
      /at ([A-Z][a-z]+ [A-Z][a-z]+)/
    ];

    for (const pattern of clientPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return null;
  },

  /**
   * Helper function to extract role description from query
   */
  extractRoleFromQuery(query: string): string | null {
    // Simple regex patterns to extract role descriptions
    const rolePatterns = [
      /role[:\s]+([^.]+)/i,
      /position[:\s]+([^.]+)/i,
      /looking for ([^.]+)/i,
      /need ([^.]+)/i
    ];

    for (const pattern of rolePatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // If no specific role pattern found, return the whole query
    return query;
  }
};

export default pitchResumeService;