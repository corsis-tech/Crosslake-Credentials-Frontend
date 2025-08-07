/**
 * Streaming results component with progressive loading of explanations.
 * Provides immediate display of matches with explanations loading in the background.
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Skeleton,
  Grow,
  LinearProgress,
  Chip,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArrowBack,
  Refresh,
  Speed,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useStreamingSearch } from '../hooks/useStreamingSearch';
import type { StreamingSearchState } from '../hooks/useStreamingSearch';
import type { StreamingMatchQuery, BasicMatch } from '../services/streamingApi';
import StreamingPractitionerCard from './StreamingPractitionerCard';
import PractitionerDetailModal from './PractitionerDetailModal';

const PageWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: '#FAFBFC',
  minHeight: '100vh',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
}));

const StatusBanner = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(1),
}));

const ResultsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const MetricsRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
}));

export const StreamingResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Modal state for detailed practitioner view
  const [selectedPractitioner, setSelectedPractitioner] = useState<BasicMatch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Get query from location state
  const query = location.state?.query as StreamingMatchQuery;
  
  // Redirect if no query provided
  useEffect(() => {
    if (!query) {
      navigate('/');
    }
  }, [query, navigate]);
  const { state, actions } = useStreamingSearch();

  useEffect(() => {
    if (query && !state.isSearching && !state.isStreamActive) {
      console.log('Starting streaming search with query:', query);
      actions.startSearch(query);
      
      return () => {
        actions.cancelSearch();
      };
    }
  }, [query?.query]); // Remove 'actions' from dependencies to prevent multiple requests

  // Show loading while redirecting if no query
  if (!query) {
    return (
      <PageWrapper>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </PageWrapper>
    );
  }

  const getStatusColor = (stage: StreamingSearchState['currentStage']) => {
    switch (stage) {
      case 'search': return 'info';
      case 'explanations': return 'warning';
      case 'complete': return 'success';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getStatusIcon = (stage: StreamingSearchState['currentStage']) => {
    switch (stage) {
      case 'search':
      case 'explanations':
        return <CircularProgress size={20} />;
      case 'complete':
        return <CheckCircle color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return null;
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Handler for opening practitioner detail modal
  const handleViewDetails = (practitioner: BasicMatch) => {
    console.log('StreamingResults - Opening modal for practitioner:', practitioner);
    console.log('Practitioner match score:', practitioner.match_score);
    console.log('Practitioner explanation:', practitioner.explanation?.substring(0, 200) + '...');
    console.log('Practitioner explanation status:', practitioner.explanation_status);
    setSelectedPractitioner(practitioner);
    setModalOpen(true);
  };

  // Handler for closing modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPractitioner(null);
  };

  const getProgressValue = () => {
    if (state.currentStage === 'complete') return 100;
    if (state.currentStage === 'explanations' && state.explanationsTotal > 0) {
      return (state.explanationsCompleted / state.explanationsTotal) * 100;
    }
    if (state.matches.length > 0) return 50; // Basic matches loaded
    return 10; // Searching
  };

  return (
    <PageWrapper>
      <Container maxWidth="xl">
        {/* Header with back button */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Practitioner Search Results
          </Typography>
          {state.currentStage !== 'idle' && (
            <Button
              startIcon={<Refresh />}
              onClick={actions.retry}
              disabled={state.isStreamActive}
              variant="outlined"
            >
              Retry Search
            </Button>
          )}
        </Box>

        {/* Status Banner */}
        <StatusBanner>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {getStatusIcon(state.currentStage)}
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Query: "{state.query}"
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {state.currentStatus}
              </Typography>
            </Box>
            <Chip
              label={state.currentStage.charAt(0).toUpperCase() + state.currentStage.slice(1)}
              color={getStatusColor(state.currentStage)}
              size="small"
            />
          </Box>

          {/* Progress Bar */}
          {state.isStreamActive && (
            <ProgressSection>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary">
                {Math.round(getProgressValue())}%
              </Typography>
            </ProgressSection>
          )}

          {/* Search Terms and Metrics */}
          {(state.matches.length > 0 || state.searchTime > 0) && (
            <MetricsRow>
              {/* LLM Search Terms */}
              {state.llmSearchTerms && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
                    LLM Search Terms:
                  </Typography>
                  {state.llmSearchTerms.primary_concepts.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {state.llmSearchTerms.primary_concepts.map((term, index) => (
                        <Chip
                          key={index}
                          label={term}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  )}
                  {state.llmSearchTerms.expanded_terms.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {state.llmSearchTerms.expanded_terms.slice(0, 5).map((term, index) => (
                        <Chip
                          key={index}
                          label={term}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{ height: 24, fontSize: '0.7rem' }}
                        />
                      ))}
                    </Box>
                  )}
                  {state.llmSearchTerms.domain_context && state.llmSearchTerms.domain_context !== 'general' && (
                    <Chip
                      label={`Domain: ${state.llmSearchTerms.domain_context}`}
                      size="small"
                      variant="filled"
                      color="info"
                      sx={{ height: 24, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              )}
              
              {/* Only keep total processing time */}
              {state.totalProcessingTime > 0 && (
                <Chip
                  label={`Total: ${formatTime(state.totalProcessingTime)}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </MetricsRow>
          )}
        </StatusBanner>

        {/* Error Display */}
        {state.error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3 }} action={
              <Button color="inherit" size="small" onClick={actions.retry}>
                Try Again
              </Button>
            }>
              {state.error}
            </Alert>
          </Fade>
        )}

        {/* Results Grid */}
        {state.matches.length > 0 && (
          <ResultsGrid>
            {state.matches.map((match, index) => (
              <Grow
                in={true}
                key={match.practitioner_id}
                style={{ transformOrigin: '0 0 0' }}
                timeout={300 + (index * 100)}
              >
                <Box>
                  <StreamingPractitionerCard
                    match={match}
                    queryContext={state.query}
                    isLoadingExplanation={
                      match.explanation_status === 'pending' || 
                      match.explanation_status === 'loading'
                    }
                    onViewDetails={() => handleViewDetails(match)}
                  />
                </Box>
              </Grow>
            ))}
          </ResultsGrid>
        )}

        {/* Loading State */}
        {state.isSearching && state.matches.length === 0 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Searching for practitioners...
            </Typography>
            <ResultsGrid>
              {Array.from({ length: 6 }).map((_, index) => (
                <Paper
                  key={index}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    height: 300,
                  }}
                >
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" height={32} />
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="rectangular" height={60} />
                    <Skeleton variant="text" width="40%" height={20} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rounded" width={60} height={32} />
                      <Skeleton variant="rounded" width={80} height={32} />
                      <Skeleton variant="rounded" width={70} height={32} />
                    </Box>
                  </Stack>
                </Paper>
              ))}
            </ResultsGrid>
          </Box>
        )}

        {/* Empty State */}
        {!state.isSearching && state.matches.length === 0 && !state.error && (
          <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No practitioners found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your search query or criteria
            </Typography>
            <Button
              variant="outlined"
              onClick={actions.retry}
              sx={{ mt: 2 }}
            >
              Try Different Search
            </Button>
          </Paper>
        )}

        {/* Practitioner Detail Modal */}
        {selectedPractitioner && (
          <PractitionerDetailModal
            open={modalOpen}
            onClose={handleCloseModal}
            practitioner={{
              practitioner_id: selectedPractitioner.practitioner_id,
              name: selectedPractitioner.name,
              headline: selectedPractitioner.headline,
              email: selectedPractitioner.email,
              linkedin_url: selectedPractitioner.linkedin_url,
              location: selectedPractitioner.location,
              skills: selectedPractitioner.skills,
              match_score: selectedPractitioner.match_score,
              explanation: selectedPractitioner.explanation || 'Analysis pending...',
              explanation_status: selectedPractitioner.explanation_status,
              // Scoring metadata for transparency
              matched_keywords: selectedPractitioner.matched_keywords,
              keyword_score: selectedPractitioner.keyword_score,
              vector_score: selectedPractitioner.vector_score,
              boost_factor: selectedPractitioner.boost_factor,
              // Basic fields that are available from streaming
              linkedin_about: selectedPractitioner.about,
              ai_summary: selectedPractitioner.about
              // Note: Removed hardcoded empty arrays - let modal fetch detailed data via API
            }}
            query={state.query}
          />
        )}
      </Container>
    </PageWrapper>
  );
};

export default StreamingResults;