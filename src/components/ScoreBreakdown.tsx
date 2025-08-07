import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Paper,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Search as SearchIcon,
  Psychology as AIIcon,
  CheckCircle as CheckIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

interface ScoreBreakdownProps {
  matchScore: number;
  keywordScore?: number;
  vectorScore?: number;
  matchedKeywords?: string[];
  boostFactor?: number;
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  matchScore,
  keywordScore,
  vectorScore,
  matchedKeywords = [],
  boostFactor = 1.0,
}) => {
  // Calculate percentage scores
  const keywordPercent = keywordScore ? Math.round(keywordScore * 100) : 0;
  const vectorPercent = vectorScore ? Math.round(vectorScore * 100) : 0;
  const overallPercent = Math.round(matchScore);

  // Determine match quality
  const getMatchQuality = (score: number) => {
    if (score >= 80) return { label: 'Excellent Match', color: '#4caf50' };
    if (score >= 60) return { label: 'Good Match', color: '#ff9800' };
    if (score >= 40) return { label: 'Fair Match', color: '#2196f3' };
    return { label: 'Weak Match', color: '#9e9e9e' };
  };

  const matchQuality = getMatchQuality(overallPercent);

  // Group keywords by type (compound phrases vs individual words)
  const phraseKeywords = matchedKeywords.filter(kw => kw.includes(' '));
  const wordKeywords = matchedKeywords.filter(kw => !kw.includes(' '));

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(matchQuality.color, 0.05)} 0%, ${alpha(matchQuality.color, 0.02)} 100%)`,
        border: `1px solid ${alpha(matchQuality.color, 0.2)}`,
      }}
    >
      {/* Overall Score Header */}
      <Box sx={{ mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon sx={{ color: matchQuality.color }} />
            Match Score Analysis
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: matchQuality.color }}>
              {overallPercent}%
            </Typography>
            <Typography variant="caption" sx={{ color: matchQuality.color, fontWeight: 600 }}>
              {matchQuality.label}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Score Components */}
      <Stack spacing={2.5}>
        {/* Keyword Score */}
        {keywordScore !== undefined && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SearchIcon sx={{ fontSize: 20, color: '#2196f3' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Keyword Match Score
                </Typography>
                <Tooltip title="Based on exact matches with your search terms (70% weight)">
                  <Typography variant="caption" sx={{ 
                    px: 1, 
                    py: 0.25, 
                    borderRadius: 1, 
                    bgcolor: alpha('#2196f3', 0.1),
                    color: '#2196f3',
                    fontWeight: 600 
                  }}>
                    70% weight
                  </Typography>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#2196f3' }}>
                {keywordPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={keywordPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha('#2196f3', 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2196f3',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Vector Score */}
        {vectorScore !== undefined && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AIIcon sx={{ fontSize: 20, color: '#9c27b0' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  AI Similarity Score
                </Typography>
                <Tooltip title="Based on semantic understanding of experience (30% weight)">
                  <Typography variant="caption" sx={{ 
                    px: 1, 
                    py: 0.25, 
                    borderRadius: 1, 
                    bgcolor: alpha('#9c27b0', 0.1),
                    color: '#9c27b0',
                    fontWeight: 600 
                  }}>
                    30% weight
                  </Typography>
                </Tooltip>
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#9c27b0' }}>
                {vectorPercent}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={vectorPercent}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha('#9c27b0', 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#9c27b0',
                  borderRadius: 4,
                },
              }}
            />
          </Box>
        )}

        {/* Matched Keywords */}
        {matchedKeywords.length > 0 && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckIcon sx={{ fontSize: 20, color: '#4caf50' }} />
              Matched Keywords ({matchedKeywords.length})
            </Typography>
            
            {/* Phrase matches (higher priority) */}
            {phraseKeywords.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Exact Phrases:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {phraseKeywords.map((keyword, idx) => (
                    <Chip
                      key={`phrase-${idx}`}
                      label={keyword}
                      size="small"
                      icon={<CheckIcon />}
                      sx={{
                        backgroundColor: alpha('#4caf50', 0.1),
                        color: '#4caf50',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: '#4caf50',
                          fontSize: 16,
                        },
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
            
            {/* Individual word matches */}
            {wordKeywords.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                  Individual Terms:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                  {wordKeywords.map((keyword, idx) => (
                    <Chip
                      key={`word-${idx}`}
                      label={keyword}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: alpha('#2196f3', 0.3),
                        color: '#2196f3',
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        )}

        {/* Boost Factor (if significant) */}
        {boostFactor > 1.1 && (
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 1, 
            bgcolor: alpha('#ff9800', 0.05),
            border: `1px solid ${alpha('#ff9800', 0.2)}`,
          }}>
            <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>
              🚀 Score boosted {Math.round((boostFactor - 1) * 100)}% due to strong keyword matches
            </Typography>
          </Box>
        )}
      </Stack>

      {/* Scoring Explanation */}
      <Box sx={{ 
        mt: 2, 
        pt: 2, 
        borderTop: `1px solid ${alpha(matchQuality.color, 0.1)}`,
      }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          <strong>How scoring works:</strong> The final score combines keyword matches (70% weight) 
          with AI semantic similarity (30% weight). Strong keyword matches can boost the score further.
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScoreBreakdown;