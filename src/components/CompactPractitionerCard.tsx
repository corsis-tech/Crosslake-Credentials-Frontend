import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  LocationOn as LocationOnIcon,
  ExpandMore as ExpandMoreIcon,
  WorkOutline as WorkOutlineIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { PractitionerMatch } from '../types/types';

interface CompactPractitionerCardProps {
  practitioner: PractitionerMatch;
  index: number;
  onExpand?: (practitioner: PractitionerMatch) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ScoreBadge = styled(Box)<{ category: 'High' | 'Medium' | 'Low' }>(({ category }) => ({
  position: 'absolute',
  top: 12,
  right: 12,
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1.25rem',
  color: 'white',
  backgroundColor: category === 'High' ? '#4CAF50' : category === 'Medium' ? '#FFC107' : '#F44336',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
}));

const CompanyChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.25),
  height: 24,
  '& .MuiChip-label': {
    paddingLeft: 8,
    paddingRight: 8,
  },
}));

const CompactPractitionerCard: React.FC<CompactPractitionerCardProps> = ({
  practitioner,
  onExpand,
}) => {
  const [workHistoryExpanded, setWorkHistoryExpanded] = useState(false);

  // Calculate 1-6 score from percentage (or use enhanced score if available)
  const getMatchScore = () => {
    if (practitioner.match_breakdown?.enhanced_score) {
      return {
        score: practitioner.match_breakdown.enhanced_score.total_score,
        category: practitioner.match_breakdown.enhanced_score.category,
      };
    }
    // Fallback: convert percentage to 1-6 scale
    const percentage = practitioner.match_score;
    const score = Math.max(1, Math.min(6, Math.round((percentage / 100) * 6)));
    let category: 'High' | 'Medium' | 'Low' = 'Low';
    if (score >= 5) category = 'High';
    else if (score >= 3) category = 'Medium';
    return { score, category };
  };

  const { score, category } = getMatchScore();

  // Get top skills
  const topSkills = practitioner.enriched_skills?.slice(0, 4) || 
    practitioner.skills.slice(0, 4).map(skill => ({ name: skill, proficiency: 'Unknown' as const, source: 'CV' as const }));
  const remainingSkillsCount = (practitioner.enriched_skills?.length || practitioner.skills.length) - 4;

  // Get work history (limited to 3 for compact view)
  // Filter out any entries that might duplicate the headline
  const filteredWorkHistory = practitioner.work_history?.filter(job => {
    const headlineText = practitioner.headline.toLowerCase();
    const jobText = `${job.title} at ${job.company}`.toLowerCase();
    return !headlineText.includes(jobText) && jobText !== headlineText;
  }) || [];
  
  const displayedWorkHistory = filteredWorkHistory.slice(0, 3);
  const remainingWorkCount = filteredWorkHistory.length - 3;

  return (
    <StyledCard>
      <CardContent sx={{ position: 'relative', pb: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Score Badge */}
        <ScoreBadge category={category}>
          {score}
        </ScoreBadge>

        {/* Header */}
        <Box sx={{ pr: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            lineHeight: 1.2,
            color: (practitioner.name === 'Unknown' || practitioner.name.startsWith('Practitioner ')) ? 'warning.main' : 'inherit'
          }}>
            {practitioner.name === 'Unknown' ? (
              <>
                Unknown Profile
                <Tooltip title="This practitioner's name could not be retrieved. Contact system administrator if this persists.">
                  <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : practitioner.name.startsWith('Practitioner ') ? (
              <>
                {practitioner.name}
                <Tooltip title="Name resolution used fallback ID. This practitioner's full name may not be available.">
                  <IconButton size="small" sx={{ ml: 0.5, p: 0.25 }}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : practitioner.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1, 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
              minHeight: '2.6em',
            }}
          >
            {practitioner.headline}
          </Typography>
        </Box>

        {/* Location and Contact */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
          {practitioner.location && (
            <Chip
              icon={<LocationOnIcon />}
              label={practitioner.location}
              size="small"
              variant="outlined"
              sx={{ height: 24, '& .MuiChip-label': { px: 1 } }}
            />
          )}
          <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
            {practitioner.email && (
              <Tooltip title={practitioner.email}>
                <IconButton size="small" sx={{ p: 0.5 }}>
                  <EmailIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {practitioner.linkedin_url && (
              <Tooltip title="LinkedIn Profile">
                <IconButton 
                  size="small" 
                  sx={{ p: 0.5 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(practitioner.linkedin_url, '_blank');
                  }}
                >
                  <LinkedInIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Stack>

        {/* Skills */}
        <Box sx={{ mb: 1.5 }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {topSkills.map((skill, idx) => (
              <Chip
                key={idx}
                label={skill.name}
                size="small"
                sx={{ 
                  height: 22,
                  fontSize: '0.75rem',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            ))}
            {remainingSkillsCount > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                +{remainingSkillsCount} more
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Work History Accordion */}
        {practitioner.work_history && practitioner.work_history.length > 0 && (
          <Accordion 
            expanded={workHistoryExpanded}
            onChange={(_, isExpanded) => setWorkHistoryExpanded(isExpanded)}
            sx={{ 
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&:before': { display: 'none' },
              mb: 1.5,
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ 
                minHeight: 36,
                '&.Mui-expanded': { minHeight: 36 },
                '& .MuiAccordionSummary-content': { margin: '8px 0' },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <WorkOutlineIcon fontSize="small" />
                <Typography variant="body2">
                  Work History ({practitioner.work_history.length})
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 1 }}>
              <Stack spacing={1}>
                {displayedWorkHistory.map((job, idx) => (
                  <Box key={idx}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem' }}>
                      {job.title}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title={job.company_description || job.company}>
                        <CompanyChip
                          label={job.company}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Tooltip>
                      {job.date_range && (
                        <Typography variant="caption" color="text.secondary">
                          {job.date_range}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                ))}
                {remainingWorkCount > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    +{remainingWorkCount} more positions
                  </Typography>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        )}

        {/* Match Quality Indicators */}
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <Stack direction="row" spacing={0.5} sx={{ mb: 1 }}>
            <Chip 
              label={`${category} Match`}
              size="small"
              color={category === 'High' ? 'success' : category === 'Medium' ? 'warning' : 'error'}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
            {practitioner.match_breakdown?.enhanced_score && (
              <>
                <Chip 
                  label={`LinkedIn: ${practitioner.match_breakdown.enhanced_score.linkedin_match}/3`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
                <Chip 
                  label={`Projects: ${practitioner.match_breakdown.enhanced_score.project_match}/3`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </>
            )}
          </Stack>
        </Box>

        {/* Expand Button */}
        <Button
          fullWidth
          size="small"
          variant="outlined"
          endIcon={<OpenInFullIcon />}
          onClick={() => onExpand?.(practitioner)}
          sx={{ mt: 1, textTransform: 'none' }}
        >
          View Full Details
        </Button>
      </CardContent>
    </StyledCard>
  );
};

export default CompactPractitionerCard;