/**
 * React hook for managing streaming search state and SSE connections.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { streamingMatchService } from '../services/streamingApi';
import type {
  StreamingMatchQuery,
  BasicMatch,
  StreamingMatchResults,
  ExplanationUpdate,
  LLMSearchTerms
} from '../services/streamingApi';

export interface StreamingSearchState {
  // Loading states
  isSearching: boolean;
  isGeneratingExplanations: boolean;
  
  // Results
  matches: BasicMatch[];
  query: string;
  totalResults: number;
  
  // Progress tracking
  explanationsCompleted: number;
  explanationsTotal: number;
  
  // Status
  currentStatus: string;
  currentStage: 'idle' | 'search' | 'explanations' | 'complete' | 'error';
  
  // Performance metrics
  searchTime: number;
  totalProcessingTime: number;
  
  // Error handling
  error: string | null;
  
  // LLM Search Terms
  llmSearchTerms: LLMSearchTerms | null;
  
  // Stream control
  isStreamActive: boolean;
}

export interface StreamingSearchActions {
  startSearch: (query: StreamingMatchQuery) => Promise<void>;
  cancelSearch: () => void;
  retry: () => Promise<void>;
  updateExplanation: (practitionerId: string, explanation: string, analysis?: any) => void;
}

export interface UseStreamingSearchReturn {
  state: StreamingSearchState;
  actions: StreamingSearchActions;
}

export const useStreamingSearch = (): UseStreamingSearchReturn => {
  const [state, setState] = useState<StreamingSearchState>({
    isSearching: false,
    isGeneratingExplanations: false,
    matches: [],
    query: '',
    totalResults: 0,
    explanationsCompleted: 0,
    explanationsTotal: 0,
    currentStatus: '',
    currentStage: 'idle',
    searchTime: 0,
    totalProcessingTime: 0,
    error: null,
    llmSearchTerms: null,
    isStreamActive: false
  });

  const lastQueryRef = useRef<StreamingMatchQuery | null>(null);

  const startSearch = useCallback(async (query: StreamingMatchQuery) => {
    lastQueryRef.current = query;
    
    setState(prev => ({
      ...prev,
      isSearching: true,
      isGeneratingExplanations: false,
      matches: [],
      query: query.query,
      totalResults: 0,
      explanationsCompleted: 0,
      explanationsTotal: 0,
      currentStatus: 'Starting search...',
      currentStage: 'search',
      searchTime: 0,
      totalProcessingTime: 0,
      error: null,
      isStreamActive: true
    }));

    try {
      await streamingMatchService.streamMatches(query, {
        onMatchResults: (results: StreamingMatchResults) => {
          console.log('Received match results:', results);
          
          setState(prev => ({
            ...prev,
            isSearching: false,
            isGeneratingExplanations: results.explanations_pending,
            matches: results.matches,
            totalResults: results.total_results,
            explanationsTotal: results.matches.length,
            searchTime: results.processing_time_ms,
            llmSearchTerms: results.llm_search_terms || null,
            currentStatus: results.explanations_pending 
              ? `Found ${results.total_results} matches. Generating explanations...`
              : `Found ${results.total_results} matches`,
            currentStage: results.explanations_pending ? 'explanations' : 'complete'
          }));
        },

        onExplanationComplete: (update: ExplanationUpdate) => {
          console.log('Explanation complete:', update);
          
          setState(prev => {
            const updatedMatches = prev.matches.map(match => {
              if (match.practitioner_id === update.practitioner_id) {
                return {
                  ...match,
                  explanation: update.explanation,
                  explanation_status: 'complete' as const
                };
              }
              return match;
            });

            return {
              ...prev,
              matches: updatedMatches,
              explanationsCompleted: update.completed,
              currentStatus: `Generated ${update.completed}/${update.total} explanations`
            };
          });
        },

        onStatusUpdate: (status) => {
          console.log('Status update:', status);
          setState(prev => ({
            ...prev,
            currentStatus: status.message,
            currentStage: status.stage as any,
            explanationsTotal: status.total || prev.explanationsTotal
          }));
        },

        onError: (error) => {
          console.error('Stream error:', error);
          setState(prev => ({
            ...prev,
            isSearching: false,
            isGeneratingExplanations: false,
            error: error.message,
            currentStage: 'error',
            currentStatus: `Error: ${error.message}`,
            isStreamActive: false
          }));
        },

        onComplete: (summary) => {
          console.log('Stream complete:', summary);
          setState(prev => ({
            ...prev,
            isSearching: false,
            isGeneratingExplanations: false,
            currentStage: 'complete',
            currentStatus: `Search complete`,
            totalProcessingTime: summary.total_processing_time_ms,
            isStreamActive: false
          }));
        }
      });

    } catch (error: any) {
      console.error('Search error:', error);
      setState(prev => ({
        ...prev,
        isSearching: false,
        isGeneratingExplanations: false,
        error: error.message || 'Failed to search',
        currentStage: 'error',
        currentStatus: `Error: ${error.message || 'Search failed'}`,
        isStreamActive: false
      }));
    }
  }, []);

  const cancelSearch = useCallback(() => {
    streamingMatchService.cancel();
    setState(prev => ({
      ...prev,
      isSearching: false,
      isGeneratingExplanations: false,
      currentStage: 'idle',
      currentStatus: 'Search cancelled',
      isStreamActive: false
    }));
  }, []);

  const retry = useCallback(async () => {
    if (lastQueryRef.current) {
      await startSearch(lastQueryRef.current);
    }
  }, [startSearch]);

  const updateExplanation = useCallback((
    practitionerId: string, 
    explanation: string
  ) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(match => {
        if (match.practitioner_id === practitionerId) {
          return {
            ...match,
            explanation,
            explanation_status: 'complete' as const
          };
        }
        return match;
      })
    }));
  }, []);

  const actions = useMemo(() => ({
    startSearch,
    cancelSearch,
    retry,
    updateExplanation
  }), [startSearch, cancelSearch, retry, updateExplanation]);

  return {
    state,
    actions
  };
};