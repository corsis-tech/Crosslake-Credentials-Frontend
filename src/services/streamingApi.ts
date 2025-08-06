/**
 * Streaming API service for Server-Sent Events (SSE) processing.
 * Handles async match processing with progressive explanation loading.
 */

export interface StreamingMatchQuery {
  query: string;
  limit?: number;
  include_explanations?: boolean;
}

export interface StreamingEvent {
  type: string;
  data: any;
  timestamp: number;
}

export interface BasicMatch {
  practitioner_id: string;
  name: string;
  headline: string;
  email: string;
  linkedin_url: string;
  location: string;
  skills: string[];
  about: string;
  match_score: number;
  explanation: string;
  explanation_status: 'pending' | 'loading' | 'complete' | 'error';
  matched_keywords: string[];
  phrase_matches?: string[];  // Compound phrases that were matched
  word_matches?: string[];    // Individual words that were matched
  boost_factor: number;
}

export interface LLMSearchTerms {
  primary_concepts: string[];
  expanded_terms: string[];
  exact_matches: string[];
  domain_context: string;
  confidence_score: number;
}

export interface StreamingMatchResults {
  query: string;
  matches: BasicMatch[];
  total_results: number;
  processing_time_ms: number;
  explanations_pending: boolean;
  llm_search_terms?: LLMSearchTerms;
}

export interface ExplanationUpdate {
  practitioner_id: string;
  explanation: string;
  enhanced_analysis: any;
  completed: number;
  total: number;
  processing_time_ms: number;
}

export interface StreamingCallbacks {
  onMatchResults?: (results: StreamingMatchResults) => void;
  onExplanationComplete?: (update: ExplanationUpdate) => void;
  onStatusUpdate?: (status: { message: string; stage: string; total?: number }) => void;
  onError?: (error: { message: string }) => void;
  onComplete?: (summary: { total_processing_time_ms: number; explanations_generated: number }) => void;
}

export class StreamingMatchService {
  private baseUrl: string;
  private abortController: AbortController | null = null;
  
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  /**
   * Stream practitioner matches with progressive explanation generation
   */
  async streamMatches(
    query: StreamingMatchQuery,
    callbacks: StreamingCallbacks
  ): Promise<void> {
    // Cancel any existing stream
    this.cancel();
    
    this.abortController = new AbortController();
    
    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      };
      
      // Add authorization header if token exists
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}/api/v1/match/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(query),
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Stream completed');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          let currentEventType = '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('event:')) {
              currentEventType = line.slice(6).trim(); // Remove 'event:' prefix
              continue;
            }

            if (line.startsWith('data:')) {
              try {
                const jsonData = line.slice(5).trim(); // Remove 'data:' prefix
                const eventData = JSON.parse(jsonData);
                
                // Handle different event types using the actual event type
                await this.handleStreamEventWithType(currentEventType || 'unknown', eventData, callbacks);
                currentEventType = ''; // Reset for next event
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError, line);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream cancelled');
        return;
      }
      
      console.error('Streaming error:', error);
      
      // Handle different types of network errors
      let errorMessage = 'Failed to stream matches';
      if (error.message?.includes('ERR_NETWORK_CHANGED')) {
        errorMessage = 'Network connection changed during streaming. Please try again.';
      } else if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Connection failed. Please check your network and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      callbacks.onError?.({
        message: errorMessage
      });
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Handle individual stream events with explicit event type
   */
  private async handleStreamEventWithType(eventType: string, data: any, callbacks: StreamingCallbacks): Promise<void> {
    try {
      switch (eventType) {
        case 'match_results':
          callbacks.onMatchResults?.(data as StreamingMatchResults);
          break;
        case 'explanation_complete':
          callbacks.onExplanationComplete?.(data as ExplanationUpdate);
          break;
        case 'status':
          callbacks.onStatusUpdate?.(data);
          break;
        case 'stream_complete':
          callbacks.onComplete?.(data);
          break;
        case 'error':
          callbacks.onError?.(data);
          break;
        case 'explanation_error':
          // Handle explanation errors gracefully
          console.warn('Explanation error:', data);
          callbacks.onError?.(data);
          break;
        default:
          console.log(`Unknown stream event type: ${eventType}`, data);
          // Fall back to old detection method for compatibility
          await this.handleStreamEvent(data, callbacks);
      }
    } catch (error) {
      console.error(`Error handling stream event ${eventType}:`, error, data);
    }
  }

  /**
   * Handle individual stream events (legacy fallback)
   */
  private async handleStreamEvent(data: any, callbacks: StreamingCallbacks): Promise<void> {
    // Determine event type from data structure (fallback method)
    if (data.matches && Array.isArray(data.matches)) {
      // This is match_results event
      callbacks.onMatchResults?.(data as StreamingMatchResults);
    } else if (data.practitioner_id && data.explanation !== undefined) {
      // This is explanation_complete event
      callbacks.onExplanationComplete?.(data as ExplanationUpdate);
    } else if (data.message && data.stage) {
      // This is status update event
      callbacks.onStatusUpdate?.(data);
    } else if (data.total_processing_time_ms !== undefined) {
      // This is stream_complete event
      callbacks.onComplete?.(data);
    } else if (data.message && !data.stage) {
      // This is error event
      callbacks.onError?.(data);
    } else {
      console.log('Unknown stream event:', data);
    }
  }

  /**
   * Cancel the current streaming request
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
      console.log('Stream cancelled by user');
    }
  }

  /**
   * Test SSE connection
   */
  async testStream(): Promise<void> {
    this.cancel();
    this.abortController = new AbortController();

    try {
      // Get the access token from localStorage
      const accessToken = localStorage.getItem('access_token');
      
      const headers: HeadersInit = {
        'Accept': 'text/event-stream',
      };
      
      // Add authorization header if token exists
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const response = await fetch(`${this.baseUrl}/api/v1/match/stream/test`, {
        method: 'GET',
        headers,
        signal: this.abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log('Test stream completed');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('Test stream chunk:', chunk);
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Test stream cancelled');
        return;
      }
      console.error('Test stream error:', error);
    } finally {
      this.abortController = null;
    }
  }
}

// Singleton instance
export const streamingMatchService = new StreamingMatchService();
export default streamingMatchService;