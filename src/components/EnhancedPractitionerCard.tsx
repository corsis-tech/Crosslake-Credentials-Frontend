import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Button,
  alpha,
  Collapse,
  LinearProgress,
  Tooltip,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  LocationOn as LocationOnIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Psychology as PsychologyIcon,
  Description as DescriptionIcon,
  WorkOutline as WorkOutlineIcon,
  CheckCircle as CheckCircleIcon,
  CardMembership as CertificateIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { PractitionerMatch } from '../types/types';
import PitchResumeModal from './PitchResumeModal';
import ScoringExplanationTooltip from './ScoringExplanationTooltip';
import HowScoringWorksModal from './HowScoringWorksModal';
import StructuredExplanationV2 from './StructuredExplanationV2';

interface EnhancedPractitionerCardProps {
  practitioner: PractitionerMatch;
  query: string;
  index: number;
  systemLabel?: string;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
    borderColor: '#2196F3',
  },
}));

const MatchScoreBox = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1.25rem',
  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
    opacity: 0.3,
    zIndex: -1,
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.5, 4),
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
  },
}));

const getProficiencyColor = (proficiency: string) => {
  switch (proficiency) {
    case 'Expert': return '#4caf50';
    case 'Advanced': return '#ff9800';
    case 'Proficient': return '#2196f3';
    default: return '#9e9e9e';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#4caf50';
  if (score >= 60) return '#ff9800';
  if (score >= 40) return '#f44336';
  return '#9e9e9e';
};

const ScoreBar: React.FC<{ 
  label: string; 
  score: number; 
  icon: React.ReactNode; 
  scoreType?: 'skill' | 'seniority' | 'project' | 'industry';
  matchBreakdown?: any;
}> = ({ label, score, icon, scoreType, matchBreakdown }) => {
  const content = (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="body2" sx={{ ml: 1, flex: 1 }}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="bold" color={getScoreColor(score)}>
          {score.toFixed(0)}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: '#f0f0f0',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getScoreColor(score),
            borderRadius: 3,
          },
        }}
      />
    </Box>
  );

  if (scoreType && matchBreakdown) {
    return (
      <ScoringExplanationTooltip
        matchBreakdown={matchBreakdown}
        scoreType={scoreType}
      >
        <Box sx={{ cursor: 'help' }}>
          {content}
        </Box>
      </ScoringExplanationTooltip>
    );
  }

  return content;
};

export default function EnhancedPractitionerCard({ 
  practitioner, 
  query,
  systemLabel 
}: EnhancedPractitionerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [scoringModalOpen, setScoringModalOpen] = useState(false);
  
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleGeneratePitch = () => {
    setPitchModalOpen(true);
  };

  const handleClosePitchModal = () => {
    setPitchModalOpen(false);
  };

  const handleOpenScoringModal = () => {
    setScoringModalOpen(true);
  };

  const handleCloseScoringModal = () => {
    setScoringModalOpen(false);
  };

  const hasEnrichedData = practitioner.enriched_skills && practitioner.enriched_skills.length > 0;
  const breakdown = practitioner.match_breakdown;

  return (
    <StyledCard elevation={1}>
      <CardContent sx={{ p: 4 }}>
        {systemLabel && (
          <Chip
            label={systemLabel}
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
        )}
        
        {/* Header with prominent match score */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ flex: 1, pr: 3 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1, lineHeight: 1.2 }}>
              {practitioner.name}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 400 }}>
              {practitioner.headline}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <ScoringExplanationTooltip
              matchBreakdown={breakdown}
              enhancedScore={breakdown?.enhanced_score}
              scoreType="overall"
            >
              <MatchScoreBox sx={{ cursor: 'help' }}>
                {Math.round(practitioner.match_score)}%
              </MatchScoreBox>
            </ScoringExplanationTooltip>
            <Button
              size="small"
              startIcon={<HelpIcon />}
              onClick={handleOpenScoringModal}
              sx={{ 
                textTransform: 'none',
                fontSize: '0.75rem',
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent',
                }
              }}
            >
              How scoring works
            </Button>
          </Box>
        </Box>


        {/* Contact Info */}
        <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          {practitioner.location && (
            <Chip
              icon={<LocationOnIcon />}
              label={practitioner.location}
              variant="outlined"
              size="medium"
              sx={{ borderRadius: 3, fontWeight: 500 }}
            />
          )}
          {practitioner.email && (
            <Chip
              icon={<EmailIcon />}
              label={practitioner.email}
              variant="outlined"
              size="medium"
              sx={{ borderRadius: 3, fontWeight: 500 }}
            />
          )}
          {practitioner.linkedin_url && (
            <Chip
              icon={<LinkedInIcon />}
              label="LinkedIn Profile"
              variant="outlined"
              size="medium"
              component="a"
              href={practitioner.linkedin_url}
              target="_blank"
              clickable
              sx={{ 
                borderRadius: 3, 
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  borderColor: '#2196F3',
                }
              }}
            />
          )}
        </Stack>

        {/* Matched Keywords Display */}
        {practitioner.matched_keywords && practitioner.matched_keywords.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block', fontWeight: 600 }}>
              🎯 Matched Keywords:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
              {practitioner.matched_keywords.slice(0, 5).map((keyword, idx) => (
                <Chip
                  key={idx}
                  label={keyword}
                  size="small"
                  icon={<CheckCircleIcon />}
                  sx={{
                    backgroundColor: alpha('#4caf50', 0.1),
                    color: '#4caf50',
                    fontWeight: 600,
                    '& .MuiChip-icon': {
                      color: '#4caf50',
                      fontSize: 14,
                    },
                  }}
                />
              ))}
              {practitioner.matched_keywords.length > 5 && (
                <Chip
                  label={`+${practitioner.matched_keywords.length - 5} more`}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: '#4caf50', color: '#4caf50' }}
                />
              )}
            </Stack>
          </Box>
        )}

        {/* Match Score Breakdown */}
        {breakdown?.enhanced_score && (
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <ScoringExplanationTooltip
                matchBreakdown={breakdown}
                enhancedScore={breakdown.enhanced_score}
                scoreType="linkedin"
              >
                <Chip
                  icon={<LinkedInIcon />}
                  label={`LinkedIn Match: ${breakdown.enhanced_score.linkedin_match}/3`}
                  color="primary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 600,
                    cursor: 'help',
                    '&:hover': {
                      backgroundColor: 'primary.50',
                      borderColor: 'primary.main',
                    }
                  }}
                />
              </ScoringExplanationTooltip>
              
              <ScoringExplanationTooltip
                matchBreakdown={breakdown}
                enhancedScore={breakdown.enhanced_score}
                scoreType="crosslake"
              >
                <Chip
                  icon={<BusinessIcon />}
                  label={`Crosslake History: ${breakdown.enhanced_score.project_match}/3`}
                  color="secondary"
                  variant="outlined"
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 600,
                    cursor: 'help',
                    '&:hover': {
                      backgroundColor: 'secondary.50',
                      borderColor: 'secondary.main',
                    }
                  }}
                />
              </ScoringExplanationTooltip>
              
              <Chip
                label={`Category: ${breakdown.enhanced_score.category}`}
                color={
                  breakdown.enhanced_score.category === 'High' ? 'success' : 
                  breakdown.enhanced_score.category === 'Medium' ? 'warning' : 
                  'default'
                }
                sx={{ borderRadius: 3, fontWeight: 600 }}
              />
            </Stack>
          </Box>
        )}

        {/* Enhanced Data Summary */}
        {hasEnrichedData && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            {practitioner.seniority_level && (
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, flex: '1 1 calc(50% - 8px)', minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Seniority</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a1a1a' }}>{practitioner.seniority_level}</Typography>
              </Paper>
            )}
            {practitioner.leadership_level && (
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, flex: '1 1 calc(50% - 8px)', minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Leadership</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a1a1a' }}>{practitioner.leadership_level}</Typography>
              </Paper>
            )}
            {practitioner.remote_work_suitability && (
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, flex: '1 1 calc(50% - 8px)', minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Remote Work</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a1a1a' }}>{practitioner.remote_work_suitability}</Typography>
              </Paper>
            )}
            {practitioner.enriched_skills && (
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, flex: '1 1 calc(50% - 8px)', minWidth: 120 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>Skills</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#1a1a1a' }}>{practitioner.enriched_skills.length}</Typography>
              </Paper>
            )}
          </Box>
        )}


        {/* Match Analysis Preview - moved to summary section above */}

        {/* Action Buttons */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<DescriptionIcon />}
              onClick={handleGeneratePitch}
              sx={{ 
                background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976D2 0%, #1BA8D9 100%)',
                },
              }}
            >
              Generate Pitch Resume
            </ActionButton>
            <ActionButton
              variant="outlined"
              color="primary"
              onClick={handleExpandClick}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ borderRadius: 3, fontWeight: 500 }}
            >
              {expanded ? 'Show Less' : 'View Details'}
            </ActionButton>
          </Stack>
        </Box>

        {/* Moved to action buttons section above */}

        {/* Expanded Content */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 4 }} />
            
            {/* Work History Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <WorkOutlineIcon sx={{ mr: 1, color: '#2196F3' }} />
                Professional Experience
              </Typography>
              
              <Grid container spacing={3}>
                {/* LinkedIn Work History */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                      LinkedIn Work History
                    </Typography>
                    {practitioner.work_history && practitioner.work_history.length > 0 ? (
                      (() => {
                        const nonCrosslakeJobs = practitioner.work_history.filter(
                          job => !job.company.toLowerCase().includes('crosslake')
                        );
                        
                        if (nonCrosslakeJobs.length === 0) {
                          return (
                            <Typography variant="body2" color="text.secondary">
                              No non-Crosslake work history available
                            </Typography>
                          );
                        }
                        
                        return (
                          <Stack spacing={2}>
                            {nonCrosslakeJobs.map((job, idx) => (
                              <Box key={idx} sx={{ borderBottom: idx < nonCrosslakeJobs.length - 1 ? '1px solid #e0e0e0' : 'none', pb: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                  {job.title}
                                </Typography>
                                <Typography variant="body2" color="primary" sx={{ mb: 0.5 }}>
                                  {job.company}
                                </Typography>
                                {job.date_range && (
                                  <Typography variant="caption" color="text.secondary">
                                    {job.date_range}
                                  </Typography>
                                )}
                                {job.description && (
                                  <Typography variant="body2" sx={{ mt: 1, color: '#2c3e50' }}>
                                    {job.description}
                                  </Typography>
                                )}
                              </Box>
                            ))}
                          </Stack>
                        );
                      })()
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No LinkedIn work history available
                      </Typography>
                    )}
                  </Paper>
                </Grid>
                
                {/* Crosslake Project History */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#1a1a1a' }}>
                      Crosslake Project History
                    </Typography>
                    {practitioner.project_history && practitioner.project_history.total_projects > 0 ? (
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Total Projects
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 600, color: '#2196F3' }}>
                            {practitioner.project_history.total_projects}
                          </Typography>
                        </Box>
                        
                        {practitioner.project_history.project_types.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Project Types
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {practitioner.project_history.project_types.map((type, idx) => (
                                <Chip key={idx} label={type} size="small" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {practitioner.project_history.roles_performed.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Roles Performed
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {practitioner.project_history.roles_performed.map((role, idx) => (
                                <Chip key={idx} label={role} size="small" color="primary" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {practitioner.project_history.industries.length > 0 && (
                          <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Industries
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {practitioner.project_history.industries.map((industry, idx) => (
                                <Chip key={idx} label={industry} size="small" color="secondary" variant="outlined" />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No Crosslake project history available
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
            
            {/* LinkedIn Accomplishments Section */}
            {(practitioner.linkedin_accomplishments?.length || 
              practitioner.linkedin_about || 
              practitioner.linkedin_certifications?.length ||
              practitioner.linkedin_honors_awards?.length ||
              practitioner.linkedin_languages?.length) && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <LinkedInIcon sx={{ mr: 1, color: '#0e76a8' }} />
                  LinkedIn Profile Highlights
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                  <Stack spacing={3}>
                    {/* About Section */}
                    {practitioner.linkedin_about && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                          Professional Summary
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: '#555',
                          lineHeight: 1.8,
                          backgroundColor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          borderLeft: '4px solid #0e76a8'
                        }}>
                          {practitioner.linkedin_about}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Key Accomplishments */}
                    {practitioner.linkedin_accomplishments && practitioner.linkedin_accomplishments.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5, color: '#1a1a1a' }}>
                          Notable Accomplishments
                        </Typography>
                        <Stack spacing={1.5}>
                          {practitioner.linkedin_accomplishments.map((accomplishment, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CheckCircleIcon sx={{ 
                                color: '#4caf50', 
                                fontSize: 20, 
                                mr: 1, 
                                mt: 0.2,
                                flexShrink: 0 
                              }} />
                              <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                                {accomplishment}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    )}
                    
                    {/* Certifications and Awards */}
                    {(practitioner.linkedin_certifications?.length || practitioner.linkedin_honors_awards?.length) && (
                      <Box>
                        {practitioner.linkedin_certifications?.length && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                              Certifications
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {practitioner.linkedin_certifications?.map((cert, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={cert} 
                                  color="primary" 
                                  variant="outlined"
                                  size="small"
                                  icon={<CertificateIcon />}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        {practitioner.linkedin_honors_awards?.length && (
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                              Honors & Awards
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {practitioner.linkedin_honors_awards?.map((award, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={award} 
                                  color="secondary" 
                                  variant="outlined"
                                  size="small"
                                  icon={<StarIcon />}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    )}
                    
                    {/* Languages */}
                    {practitioner.linkedin_languages?.length && (
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
                          Languages
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#555' }}>
                          {practitioner.linkedin_languages?.join(' • ')}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              </Box>
            )}
            
            {/* Match Evidence Display */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <PsychologyIcon sx={{ mr: 1, color: '#2196F3' }} />
                Match Summary
              </Typography>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                {practitioner.explanation ? (
                  <StructuredExplanationV2 
                    explanation={practitioner.explanation}
                    matchScore={practitioner.match_score}
                    keywordScore={practitioner.keyword_score}
                    vectorScore={practitioner.vector_score}
                    matchedKeywords={practitioner.matched_keywords}
                    boostFactor={practitioner.boost_factor}
                  />
                ) : (
                  <Box>
                    {/* Fallback display when no AI explanation is available */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        AI-generated match analysis is currently unavailable. Showing basic match information based on search results.
                      </Typography>
                    </Alert>
                    
                    {/* Basic match information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#0e76a8' }}>
                        Overall Match Quality
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {practitioner.name} shows a <strong>{Math.round(practitioner.match_score)}%</strong> match based on:
                      </Typography>
                      <ul style={{ marginLeft: '20px' }}>
                        <li>Skills and expertise alignment</li>
                        <li>Professional experience relevance</li>
                        <li>Industry and domain knowledge</li>
                        <li>Seniority and leadership level fit</li>
                      </ul>
                    </Box>
                    
                    {/* LinkedIn Information */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#0e76a8' }}>
                        LinkedIn Work History
                      </Typography>
                      {practitioner.work_history && practitioner.work_history.length > 0 ? (
                        <ul style={{ marginLeft: '20px' }}>
                          {practitioner.work_history.slice(0, 3).map((job, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">
                                <strong>{job.title}</strong> at {job.company}
                                {job.date_range && ` (${job.date_range})`}
                              </Typography>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No work history information available
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Crosslake Project History */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2, color: '#f57c00' }}>
                        Crosslake Project History
                      </Typography>
                      {practitioner.project_history && practitioner.project_history.total_projects > 0 ? (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>{practitioner.project_history.total_projects}</strong> total projects
                          </Typography>
                          {practitioner.project_history.project_types.length > 0 && (
                            <Typography variant="body2">
                              Project types: {practitioner.project_history.project_types.slice(0, 3).join(', ')}
                              {practitioner.project_history.project_types.length > 3 && '...'}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No Crosslake project history available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
            
            {/* Detailed Match Breakdown */}
            {breakdown && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <TrendingUpIcon sx={{ mr: 1, color: '#2196F3' }} />
                  Detailed Match Analysis
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                      <ScoreBar 
                        label="Skills Alignment" 
                        score={breakdown.skill_match_score} 
                        icon={<StarIcon fontSize="small" />}
                        scoreType="skill"
                        matchBreakdown={breakdown}
                      />
                      <ScoreBar 
                        label="Seniority Fit" 
                        score={breakdown.seniority_match_score} 
                        icon={<TrendingUpIcon fontSize="small" />}
                        scoreType="seniority"
                        matchBreakdown={breakdown}
                      />
                    </Box>
                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                      <ScoreBar 
                        label="Project Type Fit" 
                        score={breakdown.project_fit_score} 
                        icon={<AssignmentIcon fontSize="small" />}
                        scoreType="project"
                        matchBreakdown={breakdown}
                      />
                      <ScoreBar 
                        label="Industry Match" 
                        score={breakdown.industry_match_score} 
                        icon={<BusinessIcon fontSize="small" />}
                        scoreType="industry"
                        matchBreakdown={breakdown}
                      />
                    </Box>
                  </Box>
                </Paper>

                {/* Strengths and Gaps */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
                  <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                    <Alert severity="success">
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Strengths:</Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {breakdown.strengths.map((strength, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{strength}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  </Box>
                  {breakdown.gaps.length > 0 && (
                    <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                      <Alert severity="warning">
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>Areas to Consider:</Typography>
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {breakdown.gaps.map((gap, idx) => (
                            <li key={idx}>
                              <Typography variant="body2">{gap}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    </Box>
                  )}
                </Box>

                {/* Perfect Match Criteria */}
                {breakdown.perfect_match_criteria.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Alert severity="info">
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                        For a 100% match, look for:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {breakdown.perfect_match_criteria.map((criteria, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{criteria}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  </Box>
                )}
              </Box>
            )}

            {/* All Enhanced Skills */}
            {practitioner.enriched_skills && practitioner.enriched_skills.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Complete Skills Profile</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {practitioner.enriched_skills.map((skill, idx) => (
                    <Tooltip key={idx} title={`${skill.proficiency} level from ${skill.source}`}>
                      <Chip
                        label={`${skill.name} (${skill.proficiency})`}
                        size="small"
                        sx={{
                          backgroundColor: getProficiencyColor(skill.proficiency),
                          color: 'white',
                          fontWeight: 500,
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}

            {/* Project Recommendations */}
            {practitioner.good_for_projects && practitioner.good_for_projects.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <AssignmentIcon sx={{ mr: 1 }} />
                  Recommended Project Types
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {practitioner.good_for_projects.map((project, idx) => (
                    <Chip
                      key={idx}
                      label={project}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Industry & Specializations */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {practitioner.industry_tags && practitioner.industry_tags.length > 0 && (
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1 }} />
                    Industries
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {practitioner.industry_tags.map((industry, idx) => (
                      <Chip
                        key={idx}
                        label={industry}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {practitioner.specializations && practitioner.specializations.length > 0 && (
                <Box sx={{ flex: '1 1 calc(50% - 12px)', minWidth: 250 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Specializations
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {practitioner.specializations.map((spec, idx) => (
                      <Chip
                        key={idx}
                        label={spec}
                        variant="outlined"
                        size="small"
                        color="secondary"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            {/* AI Summary */}
            {practitioner.ai_summary && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Professional Summary
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">
                    {practitioner.ai_summary}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Removed duplicate explanation section - moved to top of expanded content */}
          </Box>
        </Collapse>
      </CardContent>
      
      {/* Pitch Resume Modal */}
      <PitchResumeModal
        open={pitchModalOpen}
        onClose={handleClosePitchModal}
        practitioner={practitioner}
        query={query}
      />
      
      {/* How Scoring Works Modal */}
      <HowScoringWorksModal
        open={scoringModalOpen}
        onClose={handleCloseScoringModal}
      />
    </StyledCard>
  );
}