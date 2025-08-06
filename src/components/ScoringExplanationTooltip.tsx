import React from 'react';
import {
  Tooltip,
  Box,
  Typography,
  Divider,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { MatchBreakdown, EnhancedMatchScore } from '../types/types';

interface ScoringExplanationTooltipProps {
  children: React.ReactElement;
  matchBreakdown?: MatchBreakdown;
  enhancedScore?: EnhancedMatchScore;
  scoreType?: 'overall' | 'linkedin' | 'crosslake' | 'skill' | 'seniority' | 'project' | 'industry';
  explanation?: string;
}

const TooltipContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  maxWidth: 400,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: theme.shadows[8],
}));

const ScoreSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1.5),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  if (score >= 40) return '#f44336';
  return '#9e9e9e';
};

export default function ScoringExplanationTooltip({
  children,
  matchBreakdown,
  enhancedScore,
  scoreType = 'overall',
  explanation,
}: ScoringExplanationTooltipProps) {
  const renderTooltipContent = () => {
    if (!matchBreakdown && !enhancedScore) {
      return (
        <Typography variant="body2">
          Score information not available
        </Typography>
      );
    }

    switch (scoreType) {
      case 'overall':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Overall Match Score Breakdown
            </Typography>
            <Divider sx={{ my: 1 }} />
            
            {explanation && (
              <>
                <ScoreSection>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <PsychologyIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        Match Summary
                      </Typography>
                      <Typography variant="body2">
                        {explanation}
                      </Typography>
                    </Box>
                  </Box>
                </ScoreSection>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            
            {enhancedScore && (
              <>
                <ScoreSection>
                  <Typography variant="caption" color="text.secondary">
                    Enhanced Scoring (1-6 scale)
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Chip
                      label={`LinkedIn: ${enhancedScore.linkedin_match}/3`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Crosslake: ${enhancedScore.project_match}/3`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      label={`Total: ${enhancedScore.total_score}/6`}
                      size="small"
                      color={enhancedScore.category === 'High' ? 'success' : enhancedScore.category === 'Medium' ? 'warning' : 'default'}
                    />
                  </Stack>
                </ScoreSection>
                <Divider sx={{ my: 1 }} />
              </>
            )}
            
            <ScoreSection>
              <Typography variant="caption" color="text.secondary">
                Score Components
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Skills Match:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={getScoreColor(matchBreakdown?.skill_match_score || 0)}>
                    {matchBreakdown?.skill_match_score?.toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Seniority Fit:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={getScoreColor(matchBreakdown?.seniority_match_score || 0)}>
                    {matchBreakdown?.seniority_match_score?.toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Project Fit:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={getScoreColor(matchBreakdown?.project_fit_score || 0)}>
                    {matchBreakdown?.project_fit_score?.toFixed(0)}%
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Industry Match:</Typography>
                  <Typography variant="body2" fontWeight="bold" color={getScoreColor(matchBreakdown?.industry_match_score || 0)}>
                    {matchBreakdown?.industry_match_score?.toFixed(0)}%
                  </Typography>
                </Box>
              </Stack>
            </ScoreSection>
            
            {matchBreakdown?.scoring_methodology && (
              <>
                <Divider sx={{ my: 1 }} />
                <ScoreSection>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <InfoIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Scoring Method
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                    {matchBreakdown.scoring_methodology}
                  </Typography>
                </ScoreSection>
              </>
            )}
          </TooltipContent>
        );

      case 'linkedin':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              LinkedIn Profile Match
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {enhancedScore?.linkedin_match}/3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on professional experience, skills, and profile information from LinkedIn.
              This score reflects how well the practitioner's background aligns with the search requirements.
            </Typography>
          </TooltipContent>
        );

      case 'crosslake':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Crosslake Project History Match
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {enhancedScore?.project_match}/3
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on internal project history and performance at Crosslake.
              Higher scores indicate successful completion of similar projects.
            </Typography>
          </TooltipContent>
        );

      case 'skill':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Skills Alignment Score
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {matchBreakdown?.skill_match_score?.toFixed(0)}%
            </Typography>
            {matchBreakdown?.skill_match_rationale && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <PsychologyIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {matchBreakdown.skill_match_rationale}
                  </Typography>
                </Box>
              </>
            )}
          </TooltipContent>
        );

      case 'seniority':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Seniority Level Match
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {matchBreakdown?.seniority_match_score?.toFixed(0)}%
            </Typography>
            {matchBreakdown?.seniority_match_rationale && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <PsychologyIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {matchBreakdown.seniority_match_rationale}
                  </Typography>
                </Box>
              </>
            )}
          </TooltipContent>
        );

      case 'project':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Project Type Fit
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {matchBreakdown?.project_fit_score?.toFixed(0)}%
            </Typography>
            {matchBreakdown?.project_fit_rationale && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <PsychologyIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {matchBreakdown.project_fit_rationale}
                  </Typography>
                </Box>
              </>
            )}
          </TooltipContent>
        );

      case 'industry':
        return (
          <TooltipContent>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Industry Experience Match
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" paragraph>
              Score: {matchBreakdown?.industry_match_score?.toFixed(0)}%
            </Typography>
            {matchBreakdown?.industry_match_rationale && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <PsychologyIcon fontSize="small" sx={{ color: 'primary.main', mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {matchBreakdown.industry_match_rationale}
                  </Typography>
                </Box>
              </>
            )}
          </TooltipContent>
        );

      default:
        return null;
    }
  };

  return (
    <Tooltip
      title={renderTooltipContent()}
      placement="top"
      arrow
      enterDelay={200}
      leaveDelay={200}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'transparent',
            maxWidth: 'none',
          },
        },
      }}
    >
      {children}
    </Tooltip>
  );
}