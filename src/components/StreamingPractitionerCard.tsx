/**
 * Practitioner card component optimized for streaming results.
 * Shows basic info immediately with progressive explanation loading.
 */

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Skeleton,
  Button,
  LinearProgress,
  Tooltip,
  alpha,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocationOn,
  Email,
  LinkedIn,
  Speed,
  CheckCircle,
  Schedule,
  Error as ErrorIcon,
} from '@mui/icons-material';
import type { BasicMatch } from '../services/streamingApi';

const StyledCard = styled(Card)(() => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  border: '1px solid rgba(0, 0, 0, 0.08)',
  transition: 'all 200ms ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    borderColor: '#1976D2',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #1976D2 0%, #42A5F5 100%)',
    opacity: 0,
    transition: 'opacity 200ms ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const ScoreChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  minWidth: 60,
}));

const StatusIndicator = styled(Box)<{ status: string }>(({ theme, status }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  borderRadius: 16,
  fontSize: '0.75rem',
  fontWeight: 500,
  backgroundColor: 
    status === 'complete' ? alpha(theme.palette.success.main, 0.1) :
    status === 'error' ? alpha(theme.palette.error.main, 0.1) :
    alpha(theme.palette.warning.main, 0.1),
  color:
    status === 'complete' ? theme.palette.success.main :
    status === 'error' ? theme.palette.error.main :
    theme.palette.warning.main,
}));

const KeywordChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.7rem',
  height: 24,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const PhraseChip = styled(Chip)(({ theme }) => ({
  fontSize: '0.7rem',
  height: 24,
  backgroundColor: alpha(theme.palette.success.main, 0.15),
  color: theme.palette.success.main,
  border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
  fontWeight: 600,
  '&:hover': {
    backgroundColor: alpha(theme.palette.success.main, 0.25),
  },
}));

interface StreamingPractitionerCardProps {
  match: BasicMatch;
  queryContext: string;
  isLoadingExplanation: boolean;
  onViewDetails?: () => void;
}

export const StreamingPractitionerCard: React.FC<StreamingPractitionerCardProps> = ({
  match,
  isLoadingExplanation,
  onViewDetails
}) => {
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle sx={{ fontSize: 14 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 14 }} />;
      case 'pending':
      case 'loading':
      default:
        return <Schedule sx={{ fontSize: 14 }} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'complete':
        return 'Analysis ready';
      case 'error':
        return 'Analysis failed';
      case 'loading':
        return 'Analyzing...';
      case 'pending':
      default:
        return 'Analysis pending';
    }
  };

  const hasKeywords = (match.phrase_matches && match.phrase_matches.length > 0) || 
                      (match.word_matches && match.word_matches.length > 0) ||
                      (match.matched_keywords && match.matched_keywords.length > 0);

  return (
    <StyledCard onClick={onViewDetails}>
      <CardContent sx={{ p: 2.5, pb: 1.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ 
              fontWeight: 600, 
              mb: 0.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {match.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              mb: 1,
            }}>
              {match.headline}
            </Typography>
          </Box>
          <ScoreChip
            label={`${Math.round(match.match_score)}%`}
            color={getScoreColor(match.match_score)}
            size="small"
          />
        </Box>

        {/* Contact Info */}
        <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
          {match.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {match.location}
              </Typography>
            </Box>
          )}
          {match.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                Available
              </Typography>
            </Box>
          )}
          {match.linkedin_url && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LinkedIn sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                LinkedIn
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Skills Preview */}
        {match.skills.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
              Key Skills
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {match.skills.slice(0, 4).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              ))}
              {match.skills.length > 4 && (
                <Chip
                  label={`+${match.skills.length - 4} more`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Matched Keywords with Phrase Priority */}
        {hasKeywords && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>
              Matching Keywords
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {(() => {
                // Prioritize phrase matches first, then individual words
                const phraseMatches = match.phrase_matches || [];
                const wordMatches = match.word_matches || [];
                const allKeywords = [...phraseMatches, ...wordMatches];
                const displayKeywords = allKeywords.slice(0, 3);
                
                return displayKeywords.map((keyword, index) => {
                  const isPhrase = phraseMatches.includes(keyword);
                  const ChipComponent = isPhrase ? PhraseChip : KeywordChip;
                  
                  return (
                    <ChipComponent
                      key={index}
                      label={keyword}
                      size="small"
                      variant="outlined"
                    />
                  );
                });
              })()}
              {(() => {
                const phraseMatches = match.phrase_matches || [];
                const wordMatches = match.word_matches || [];
                const totalKeywords = phraseMatches.length + wordMatches.length;
                
                return totalKeywords > 3 && (
                  <KeywordChip
                    label={`+${totalKeywords - 3}`}
                    size="small"
                    variant="outlined"
                  />
                );
              })()}
            </Stack>
          </Box>
        )}

        {/* Explanation Section */}
        <Box sx={{ mt: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              AI Analysis
            </Typography>
            <StatusIndicator status={match.explanation_status}>
              {getStatusIcon(match.explanation_status)}
              {getStatusText(match.explanation_status)}
            </StatusIndicator>
          </Box>

          {/* Loading State */}
          {isLoadingExplanation && (
            <Box>
              <LinearProgress sx={{ mb: 1, height: 3, borderRadius: 1.5 }} />
              <Stack spacing={0.5}>
                <Skeleton variant="text" width="100%" height={16} />
                <Skeleton variant="text" width="80%" height={16} />
                <Skeleton variant="text" width="60%" height={16} />
              </Stack>
            </Box>
          )}

          {/* Explanation Content */}
          {match.explanation && match.explanation_status === 'complete' && (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.5,
                  display: showFullExplanation ? 'block' : '-webkit-box',
                  WebkitLineClamp: showFullExplanation ? 'none' : 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {match.explanation}
              </Typography>

              {match.explanation.length > 200 && (
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullExplanation(!showFullExplanation);
                  }}
                  sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
                >
                  {showFullExplanation ? 'Show less' : 'Read more'}
                </Button>
              )}
            </Box>
          )}

          {/* Error State */}
          {match.explanation_status === 'error' && (
            <Typography variant="body2" color="error.main" sx={{ fontStyle: 'italic' }}>
              Unable to generate analysis. Basic match information is available.
            </Typography>
          )}
        </Box>

        {/* Performance Boost Indicator */}
        {match.boost_factor && match.boost_factor > 1 && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title={`Boosted by ${Math.round((match.boost_factor - 1) * 100)}% for keyword matches`}>
              <Chip
                icon={<Speed sx={{ fontSize: 14 }} />}
                label="Boosted"
                size="small"
                color="primary"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StreamingPractitionerCard;