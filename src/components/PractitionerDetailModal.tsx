import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Divider,
  Button,
  Grid,
  alpha,
  CircularProgress,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Close,
  Email,
  LinkedIn,
  LocationOn,
  WorkOutline,
  Business,
  CheckCircle,
  Description,
  Print as PrintIcon,
  Share as ShareIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  Assignment as ProjectIcon,
  Psychology as SkillIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { PractitionerMatch } from '../types/types';
import PitchResumeModal from './PitchResumeModal';
import StructuredExplanationV2 from './StructuredExplanationV2';
import { practitionerApi } from '../utils/api';

interface PractitionerDetailModalProps {
  open: boolean;
  onClose: () => void;
  practitioner: PractitionerMatch | null;
  query: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`practitioner-tabpanel-${index}`}
      aria-labelledby={`practitioner-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `practitioner-tab-${index}`,
    'aria-controls': `practitioner-tabpanel-${index}`,
  };
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    maxWidth: 1200,
    width: '100%',
    height: '90vh',
    maxHeight: 800,
    [theme.breakpoints.down('md')]: {
      maxWidth: '95vw',
      height: '95vh',
      margin: 8,
    },
    '@media print': {
      maxWidth: 'none',
      width: '100%',
      height: 'auto',
      maxHeight: 'none',
      margin: 0,
      boxShadow: 'none',
      borderRadius: 0,
      '& .MuiDialogContent-root': {
        padding: '16px 24px',
      },
      '& .MuiDialogTitle-root': {
        padding: '16px 24px 8px',
      },
    },
  },
  '@media print': {
    '& .MuiBackdrop-root': {
      display: 'none',
    },
    position: 'relative !important' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    zIndex: 'auto !important' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    inset: 'auto !important' as any, // eslint-disable-line @typescript-eslint/no-explicit-any
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(2),
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const ScoreBadge = styled(Box)<{ score: number }>(({ score }) => ({
  width: 64,
  height: 64,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.25rem',
  color: '#FFFFFF',
  backgroundColor: score >= 8 ? '#00C853' : score >= 6 ? '#FF6D00' : '#1A73E8',
  boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
  flexShrink: 0,
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  backgroundColor: alpha(theme.palette.primary.main, 0.04),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  height: '100%',
}));

const SkillChip = styled(Chip)<{ proficiency?: string }>(({ proficiency }) => ({
  borderRadius: 4,
  backgroundColor: 
    proficiency === 'Expert' ? alpha('#00C853', 0.12) :
    proficiency === 'Advanced' ? alpha('#FF6D00', 0.12) :
    alpha('#1A73E8', 0.08),
  '& .MuiChip-label': {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: '0.875rem',
  },
}));

const WorkHistoryItem = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderLeft: `3px solid ${theme.palette.primary.main}`,
  marginBottom: theme.spacing(2),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const ProjectChip = styled(Chip)(() => ({
  height: 24,
  fontSize: '0.75rem',
  borderRadius: 4,
}));

// Parse scores from the structured explanation
const parseScoresFromExplanation = (explanation: string | undefined) => {
  if (!explanation) {
    return { linkedinScore: 0, crosslakeScore: 0 };
  }

  let linkedinScore = 0;
  let crosslakeScore = 0;
  
  const lines = explanation.split('\n');
  
  for (const line of lines) {
    if (line.includes('# LinkedIn Relevance Score:')) {
      const match = line.match(/(\d+)/);
      if (match) {
        linkedinScore = parseInt(match[1], 10);
      }
    } else if (line.includes('# Crosslake History Score:')) {
      const match = line.match(/(\d+)/);
      if (match) {
        crosslakeScore = parseInt(match[1], 10);
      }
    }
  }
  
  return { linkedinScore, crosslakeScore };
};

export default function PractitionerDetailModal({
  open,
  onClose,
  practitioner,
  query,
}: PractitionerDetailModalProps) {
  const [pitchModalOpen, setPitchModalOpen] = useState(false);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [detailedData, setDetailedData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchDetailedData = useCallback(async () => {
    if (!practitioner) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await practitionerApi.getPractitioner(practitioner.practitioner_id);
      
      // CRITICAL FIX: Merge API data with original streaming data
      // Preserve query-specific fields (match_score, explanation, explanation_status)
      const mergedData = {
        ...data, // API response with enriched data
        match_score: practitioner.match_score, // Preserve from streaming data
        explanation: practitioner.explanation, // Preserve from streaming data  
        explanation_status: practitioner.explanation_status // Preserve from streaming data
      };
      
      setDetailedData(mergedData);
    } catch (err) {
      console.error('Failed to fetch detailed practitioner data:', err);
      setError('Failed to load detailed information');
      // Use existing practitioner data as fallback
      setDetailedData(practitioner);
    } finally {
      setLoading(false);
    }
  }, [practitioner]);

  // Fetch detailed practitioner data when modal opens
  useEffect(() => {
    if (open && practitioner) {
      fetchDetailedData();
    }
  }, [open, practitioner, fetchDetailedData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  };

  const handlePrint = () => {
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * { visibility: hidden; }
        #practitioner-print-content, #practitioner-print-content * { visibility: visible; }
        #practitioner-print-content { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .MuiTab-root { display: none !important; }
        .MuiTabs-root { display: none !important; }
        [role="tabpanel"] { display: block !important; }
        .MuiDialogActions-root { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    // Show all tab panels for print
    setTabValue(-1);
    
    setTimeout(() => {
      window.print();
      document.head.removeChild(style);
      setTabValue(0); // Reset to first tab
    }, 100);
  };

  const handleShare = async () => {
    if (navigator.share && practitioner) {
      try {
        await navigator.share({
          title: `${practitioner.name} - Professional Profile`,
          text: `Check out ${practitioner.name}'s professional profile: ${practitioner.headline}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!practitioner) return null;
  
  // SAFETY: Ensure displayData always has the critical streaming fields
  const displayData = detailedData || practitioner;
  
  // Final safety check: ensure match_score and explanation are preserved
  const safeDisplayData = {
    ...displayData,
    match_score: displayData.match_score ?? practitioner.match_score ?? 0,
    explanation: displayData.explanation ?? practitioner.explanation ?? 'No explanation available',
    explanation_status: displayData.explanation_status ?? practitioner.explanation_status ?? 'pending'
  };

  const handleGeneratePitch = () => {
    setIsGeneratingPitch(true);
    // Simulate loading delay
    setTimeout(() => {
      setIsGeneratingPitch(false);
      setPitchModalOpen(true);
    }, 300);
  };
  
  // Calculate composite score - use actual match_score if available, otherwise parse from explanation
  const { linkedinScore, crosslakeScore } = parseScoresFromExplanation(safeDisplayData.explanation);
  const compositeScore = safeDisplayData.match_score > 0 
    ? safeDisplayData.match_score
    : (linkedinScore * 0.9) + (crosslakeScore * 0.1);
    
  // Debug logging
  console.log('PractitionerDetailModal safeDisplayData:', safeDisplayData);
  console.log('Match score from data:', safeDisplayData.match_score);
  console.log('Explanation status:', safeDisplayData.explanation_status);
  console.log('Explanation content:', safeDisplayData.explanation?.substring(0, 200) + '...');
  
  // Tab-specific data logging
  console.log('Experience tab data:');
  console.log('  - work_history:', safeDisplayData.work_history?.length || 0, 'entries');
  console.log('  - headline:', safeDisplayData.headline);
  console.log('Projects tab data:');
  console.log('  - project_history:', safeDisplayData.project_history);
  console.log('  - good_for_projects:', safeDisplayData.good_for_projects?.length || 0, 'entries');
  console.log('  - industry_tags:', safeDisplayData.industry_tags?.length || 0, 'entries');
  console.log('Skills tab data:');
  console.log('  - enriched_skills:', safeDisplayData.enriched_skills?.length || 0, 'entries');
  console.log('  - skills (basic):', safeDisplayData.skills?.length || 0, 'entries');
  console.log('LinkedIn tab data:');
  console.log('  - linkedin_about:', !!safeDisplayData.linkedin_about);
  console.log('  - linkedin_accomplishments:', safeDisplayData.linkedin_accomplishments?.length || 0, 'entries');
  console.log('  - linkedin_url:', !!safeDisplayData.linkedin_url);
  console.log('  - linkedin_certifications:', safeDisplayData.linkedin_certifications?.length || 0, 'entries');
  console.log('  - linkedin_current_position:', !!safeDisplayData.linkedin_current_position);

  return (
    <>
      <StyledDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="practitioner-detail-title"
        aria-describedby="practitioner-detail-description"
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
      >
        <DialogTitle sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 0 }}>
            <HeaderSection>
              <Box flex={1}>
                <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                  <Box flex={1}>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      id="practitioner-detail-title"
                      sx={{ fontWeight: 600, mb: 0.5, fontSize: 24, lineHeight: '32px' }}
                    >
                      {safeDisplayData.name}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      id="practitioner-detail-description"
                      sx={{ mb: 1, fontSize: 16, lineHeight: '24px' }}
                    >
                      {safeDisplayData.headline}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {safeDisplayData.location && (
                        <Chip
                          icon={<LocationOn sx={{ fontSize: 16 }} />}
                          label={safeDisplayData.location}
                          variant="outlined"
                          size="small"
                          sx={{ height: 24, borderRadius: '8px' }}
                        />
                      )}
                      {safeDisplayData.email && (
                        <Chip
                          icon={<Email sx={{ fontSize: 16 }} />}
                          label={safeDisplayData.email}
                          variant="outlined"
                          size="small"
                          onClick={() => window.location.href = `mailto:${safeDisplayData.email}`}
                          sx={{ height: 24, borderRadius: '8px' }}
                        />
                      )}
                      {safeDisplayData.linkedin_url && (
                        <Chip
                          icon={<LinkedIn sx={{ fontSize: 16 }} />}
                          label="LinkedIn"
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(safeDisplayData.linkedin_url, '_blank')}
                          sx={{ height: 24, borderRadius: '8px' }}
                        />
                      )}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScoreBadge score={compositeScore}>
                      {compositeScore.toFixed(1)}
                    </ScoreBadge>
                    <IconButton
                      aria-label="Close practitioner details"
                      onClick={onClose}
                      sx={{
                        ml: 1,
                        color: 'text.secondary',
                      }}
                      tabIndex={0}
                    >
                      <Close />
                    </IconButton>
                  </Stack>
                </Stack>
              </Box>
            </HeaderSection>
          </Box>
        </DialogTitle>
        <Divider sx={{ mt: 2, mb: 0 }} />
        
        <DialogContent sx={{ pt: 0, pb: 2, px: 0, display: 'flex', flexDirection: 'column' }} id="practitioner-print-content">
          {/* Action Buttons */}
          <Box sx={{ px: 3, pb: 2, display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }} className="no-print">
            <Button
              size="small"
              startIcon={<InfoIcon />}
              onClick={() => window.open(`/practitioner/${practitioner.practitioner_id}/all-data`, '_blank')}
              sx={{ minWidth: 'auto' }}
              aria-label="View all practitioner data"
            >
              {isSmallScreen ? '' : 'View All Data'}
            </Button>
            <Button
              size="small"
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{ minWidth: 'auto' }}
              aria-label="Share practitioner profile"
            >
              {isSmallScreen ? '' : 'Share'}
            </Button>
            <Button
              size="small"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              sx={{ minWidth: 'auto' }}
              aria-label="Print practitioner profile"
            >
              {isSmallScreen ? '' : 'Print'}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={isGeneratingPitch ? <CircularProgress size={16} /> : <Description />}
              onClick={handleGeneratePitch}
              disabled={isGeneratingPitch}
              aria-label={isGeneratingPitch ? 'Generating pitch resume' : 'Generate pitch resume'}
            >
              {isGeneratingPitch ? 'Generating...' : (isSmallScreen ? 'Pitch' : 'Generate Pitch')}
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Box sx={{ px: 3, pb: 2 }} className="no-print">
              <Alert severity="warning" variant="outlined">
                {error}. Showing available information.
              </Alert>
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="no-print">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons="auto"
              sx={{ px: 3 }}
              aria-label="Practitioner information tabs"
            >
              <Tab 
                icon={<InfoIcon />} 
                label={isSmallScreen ? '' : 'Overview'} 
                aria-label="Overview tab - general information and match analysis"
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<LinkedIn />} 
                label={isSmallScreen ? '' : 'LinkedIn'} 
                aria-label="LinkedIn tab - LinkedIn profile, skills, and experience"
                {...a11yProps(1)} 
              />
              <Tab 
                icon={<ProjectIcon />} 
                label={isSmallScreen ? '' : 'Projects'} 
                aria-label="Projects tab - Crosslake project history"
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <Box sx={{ px: 3, flex: 1, overflow: 'auto' }}>
            {/* Overview Tab */}
            <TabPanel value={tabValue} index={0}>
              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="text" width="100%" height={60} />
                  <Skeleton variant="rectangular" width="100%" height={120} />
                  <Skeleton variant="text" width="80%" height={40} />
                </Stack>
              ) : (
                <>
                  {/* Match Summary */}
                  <Section>
                    <SectionTitle>
                      <CheckCircle color="primary" />
                      Match Analysis
                    </SectionTitle>
                    <InfoCard elevation={0}>
                      {safeDisplayData.explanation_status === 'loading' || safeDisplayData.explanation_status === 'pending' ? (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">
                              {safeDisplayData.explanation_status === 'loading' 
                                ? 'Generating match analysis...' 
                                : 'Match analysis pending...'}
                            </Typography>
                          </Stack>
                        </Alert>
                      ) : safeDisplayData.explanation_status === 'error' ? (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            Unable to generate match analysis. The practitioner's basic information is still available above.
                          </Typography>
                        </Alert>
                      ) : safeDisplayData.explanation && safeDisplayData.explanation.trim() ? (
                        <StructuredExplanationV2 explanation={safeDisplayData.explanation} />
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          <Typography variant="body2">
                            No match analysis available for this practitioner.
                          </Typography>
                        </Alert>
                      )}
                    </InfoCard>
                  </Section>

                  {/* Key Metrics */}
                  <Section>
                    <SectionTitle>
                      <PersonIcon color="primary" />
                      Professional Summary
                    </SectionTitle>
                    <Grid container spacing={2}>
                      {safeDisplayData.seniority_level && (
                        <Grid item xs={6} sm={3}>
                          <InfoCard elevation={0}>
                            <Typography variant="caption" color="text.secondary">
                              Seniority
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {safeDisplayData.seniority_level}
                            </Typography>
                          </InfoCard>
                        </Grid>
                      )}
                      {safeDisplayData.leadership_level && (
                        <Grid item xs={6} sm={3}>
                          <InfoCard elevation={0}>
                            <Typography variant="caption" color="text.secondary">
                              Leadership
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {safeDisplayData.leadership_level}
                            </Typography>
                          </InfoCard>
                        </Grid>
                      )}
                      {safeDisplayData.remote_work_suitability && (
                        <Grid item xs={6} sm={3}>
                          <InfoCard elevation={0}>
                            <Typography variant="caption" color="text.secondary">
                              Remote Work
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {safeDisplayData.remote_work_suitability}
                            </Typography>
                          </InfoCard>
                        </Grid>
                      )}
                      <Grid item xs={6} sm={3}>
                        <InfoCard elevation={0}>
                          <Typography variant="caption" color="text.secondary">
                            Match Score
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {compositeScore.toFixed(1)}
                          </Typography>
                        </InfoCard>
                      </Grid>
                    </Grid>
                  </Section>

                  {/* AI Summary */}
                  {safeDisplayData.ai_summary && (
                    <Section>
                      <SectionTitle>
                        <InfoIcon color="primary" />
                        AI-Generated Summary
                      </SectionTitle>
                      <InfoCard elevation={0}>
                        <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                          {safeDisplayData.ai_summary}
                        </Typography>
                      </InfoCard>
                    </Section>
                  )}
                </>
              )}
            </TabPanel>

            {/* LinkedIn Tab (includes Experience, Skills, and LinkedIn data) */}
            <TabPanel value={tabValue} index={1}>
              {loading ? (
                <Stack spacing={2}>
                  <Skeleton variant="text" width="100%" height={60} />
                  <Skeleton variant="rectangular" width="100%" height={120} />
                </Stack>
              ) : (
                <>
                  {/* LinkedIn Profile Link */}
                  {safeDisplayData.linkedin_url && (
                    <Section>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          startIcon={<LinkedIn />}
                          href={safeDisplayData.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ 
                            borderColor: '#0e76a8', 
                            color: '#0e76a8',
                            '&:hover': {
                              borderColor: '#0e76a8',
                              backgroundColor: alpha('#0e76a8', 0.04)
                            }
                          }}
                        >
                          View Full LinkedIn Profile
                        </Button>
                      </Box>
                    </Section>
                  )}

                  {/* LinkedIn About */}
                  {safeDisplayData.linkedin_about && (
                    <Section>
                      <SectionTitle>
                        <LinkedIn color="primary" />
                        Professional Summary
                      </SectionTitle>
                      <InfoCard elevation={0}>
                        <Typography variant="body2" sx={{ 
                          lineHeight: 1.8,
                          backgroundColor: '#f8f9fa',
                          p: 2,
                          borderRadius: 1,
                          borderLeft: '4px solid #0e76a8'
                        }}>
                          {safeDisplayData.linkedin_about}
                        </Typography>
                      </InfoCard>
                    </Section>
                  )}

                  {/* Current Position */}
                  {safeDisplayData.linkedin_current_position && (
                    <Section>
                      <SectionTitle>
                        <WorkOutline color="primary" />
                        Current Position
                      </SectionTitle>
                      <InfoCard elevation={0}>
                        <Typography variant="body1" fontWeight={600} gutterBottom>
                          {safeDisplayData.linkedin_current_position.title}
                        </Typography>
                        <Typography variant="body2" color="primary" gutterBottom>
                          {safeDisplayData.linkedin_current_position.company}
                        </Typography>
                        {safeDisplayData.linkedin_current_position.duration && (
                          <Typography variant="caption" color="text.secondary">
                            {safeDisplayData.linkedin_current_position.duration}
                          </Typography>
                        )}
                      </InfoCard>
                    </Section>
                  )}

                  {/* Work History */}
                  <Section>
                    <SectionTitle>
                      <TimelineIcon color="primary" />
                      Work History
                    </SectionTitle>
                    {safeDisplayData.work_history && safeDisplayData.work_history.length > 0 ? (
                      <Stack spacing={2}>
                        {safeDisplayData.work_history.map((job: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                          <WorkHistoryItem key={idx}>
                            <Typography variant="body1" fontWeight={600} gutterBottom>
                              {job.title}
                            </Typography>
                            <Typography variant="body2" color="primary" gutterBottom>
                              {job.company}
                            </Typography>
                            {job.date_range && (
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                {job.date_range}
                              </Typography>
                            )}
                            {job.description && (
                              <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                {job.description}
                              </Typography>
                            )}
                            {job.company_description && (
                              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: '#888' }}>
                                Company: {job.company_description}
                              </Typography>
                            )}
                          </WorkHistoryItem>
                        ))}
                      </Stack>
                    ) : (
                      <Alert severity="info" variant="outlined">
                        <Typography variant="body2">
                          Work history information is not available for this practitioner. 
                          Please check their LinkedIn profile or contact them directly for detailed work experience.
                        </Typography>
                      </Alert>
                    )}
                  </Section>

                  {/* Professional Background Summary (if no detailed work history) */}
                  {(!safeDisplayData.work_history || safeDisplayData.work_history.length === 0) && safeDisplayData.headline && (
                    <Section>
                      <SectionTitle>
                        <PersonIcon color="primary" />
                        Professional Background
                      </SectionTitle>
                      <InfoCard elevation={0}>
                        <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
                          <strong>Current Role:</strong> {safeDisplayData.headline}
                        </Typography>
                        {safeDisplayData.location && (
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6, mt: 1 }}>
                            <strong>Location:</strong> {safeDisplayData.location}
                          </Typography>
                        )}
                        {safeDisplayData.seniority_level && (
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6, mt: 1 }}>
                            <strong>Seniority Level:</strong> {safeDisplayData.seniority_level}
                          </Typography>
                        )}
                        {safeDisplayData.leadership_level && (
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6, mt: 1 }}>
                            <strong>Leadership Level:</strong> {safeDisplayData.leadership_level}
                          </Typography>
                        )}
                      </InfoCard>
                    </Section>
                  )}

                  {/* Enhanced Skills with Proficiency */}
                  {safeDisplayData.enriched_skills && safeDisplayData.enriched_skills.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <SkillIcon color="primary" />
                        Skills & Proficiency
                      </SectionTitle>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {safeDisplayData.enriched_skills.map((skill: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                          <SkillChip
                            key={idx}
                            label={`${skill.name} • ${skill.proficiency}`}
                            proficiency={skill.proficiency}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Section>
                  )}
                  
                  {/* Fallback: Basic Skills (always available from streaming data) */}
                  {(!safeDisplayData.enriched_skills || safeDisplayData.enriched_skills.length === 0) && 
                   safeDisplayData.skills && safeDisplayData.skills.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <SkillIcon color="primary" />
                        Core Skills
                      </SectionTitle>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {safeDisplayData.skills.map((skill: string, idx: number) => (
                          <SkillChip
                            key={idx}
                            label={skill}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Section>
                  )}

                  {/* LinkedIn Accomplishments */}
                  {safeDisplayData.linkedin_accomplishments && safeDisplayData.linkedin_accomplishments.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <CheckCircle color="primary" />
                        Key Accomplishments
                      </SectionTitle>
                      <Stack spacing={1.5}>
                        {safeDisplayData.linkedin_accomplishments.map((accomplishment: string, idx: number) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CheckCircle sx={{ 
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
                    </Section>
                  )}

                  {/* Certifications */}
                  {safeDisplayData.linkedin_certifications && safeDisplayData.linkedin_certifications.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <CheckCircle color="primary" />
                        Certifications
                      </SectionTitle>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {safeDisplayData.linkedin_certifications.map((cert: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={cert}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              borderColor: '#0e76a8',
                              color: '#0e76a8',
                              '&:hover': {
                                backgroundColor: alpha('#0e76a8', 0.04)
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Section>
                  )}

                  {/* Languages */}
                  {safeDisplayData.linkedin_languages && safeDisplayData.linkedin_languages.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <LinkedIn color="primary" />
                        Languages
                      </SectionTitle>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {safeDisplayData.linkedin_languages.map((language: string, idx: number) => (
                          <Chip
                            key={idx}
                            label={language}
                            size="small"
                            sx={{ backgroundColor: alpha('#1976d2', 0.08) }}
                          />
                        ))}
                      </Box>
                    </Section>
                  )}

                  {/* Honors & Awards */}
                  {safeDisplayData.linkedin_honors_awards && safeDisplayData.linkedin_honors_awards.length > 0 && (
                    <Section>
                      <SectionTitle>
                        <CheckCircle color="primary" />
                        Honors & Awards
                      </SectionTitle>
                      <Stack spacing={1}>
                        {safeDisplayData.linkedin_honors_awards.map((award: string, idx: number) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <CheckCircle sx={{ 
                              color: '#ff9800', 
                              fontSize: 20, 
                              mr: 1, 
                              mt: 0.2,
                              flexShrink: 0 
                            }} />
                            <Typography variant="body2" sx={{ color: '#555', lineHeight: 1.6 }}>
                              {award}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Section>
                  )}

                  {/* Empty state message */}
                  {!safeDisplayData.linkedin_about && 
                   (!safeDisplayData.linkedin_accomplishments || safeDisplayData.linkedin_accomplishments.length === 0) &&
                   (!safeDisplayData.linkedin_certifications || safeDisplayData.linkedin_certifications.length === 0) &&
                   (!safeDisplayData.linkedin_languages || safeDisplayData.linkedin_languages.length === 0) &&
                   (!safeDisplayData.linkedin_honors_awards || safeDisplayData.linkedin_honors_awards.length === 0) &&
                   !safeDisplayData.linkedin_current_position &&
                   (!safeDisplayData.work_history || safeDisplayData.work_history.length === 0) &&
                   (!safeDisplayData.enriched_skills || safeDisplayData.enriched_skills.length === 0) &&
                   (!safeDisplayData.skills || safeDisplayData.skills.length === 0) && (
                    <Section>
                      <Alert severity="info" variant="outlined">
                        <Typography variant="body2">
                          LinkedIn profile information, work history, and skills data are not available for this practitioner. 
                          {safeDisplayData.linkedin_url ? 'View their full LinkedIn profile using the link above.' : 'Please check other sections or contact them directly for professional background.'}
                        </Typography>
                      </Alert>
                    </Section>
                  )}
                </>
              )}
            </TabPanel>

            {/* Projects Tab */}
            <TabPanel value={tabValue} index={2}>
              {loading ? (
                <Skeleton variant="rectangular" width="100%" height={300} />
              ) : (
                <>
                  {safeDisplayData.project_history && safeDisplayData.project_history.total_projects > 0 ? (
                    <>
                      {/* Project Overview */}
                      <Section>
                        <SectionTitle>
                          <Business color="primary" />
                          Crosslake Project History
                        </SectionTitle>
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6} md={4}>
                            <InfoCard elevation={0}>
                              <Box textAlign="center">
                                <Typography variant="h2" color="primary" fontWeight={700}>
                                  {safeDisplayData.project_history.total_projects}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Total Projects
                                </Typography>
                              </Box>
                            </InfoCard>
                          </Grid>
                          
                          <Grid item xs={12} sm={6} md={8}>
                            <Stack spacing={3}>
                              {/* Project Types */}
                              {safeDisplayData.project_history.project_types?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Project Types
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {safeDisplayData.project_history.project_types.map((type: string, idx: number) => (
                                      <ProjectChip key={idx} label={type} size="small" />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                              
                              {/* Roles Performed */}
                              {safeDisplayData.project_history.roles_performed?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Roles Performed
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {safeDisplayData.project_history.roles_performed.map((role: string, idx: number) => (
                                      <ProjectChip 
                                        key={idx} 
                                        label={role} 
                                        size="small" 
                                        color="primary"
                                        variant="outlined"
                                      />
                                    ))}
                                  </Box>
                                </Box>
                              )}
                              
                              {/* Industries */}
                              {safeDisplayData.project_history.industries?.length > 0 && (
                                <Box>
                                  <Typography variant="body2" fontWeight={600} gutterBottom>
                                    Industries Served
                                  </Typography>
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {safeDisplayData.project_history.industries.slice(0, 8).map((industry: string, idx: number) => (
                                      <ProjectChip 
                                        key={idx} 
                                        label={industry} 
                                        size="small" 
                                        color="secondary"
                                        variant="outlined"
                                      />
                                    ))}
                                    {safeDisplayData.project_history.industries.length > 8 && (
                                      <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                                        +{safeDisplayData.project_history.industries.length - 8} more
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              )}
                            </Stack>
                          </Grid>
                        </Grid>
                      </Section>

                      {/* Recent Projects */}
                      {safeDisplayData.project_history.recent_projects && safeDisplayData.project_history.recent_projects.length > 0 && (
                        <Section>
                          <SectionTitle>
                            <ProjectIcon color="primary" />
                            Recent Projects
                          </SectionTitle>
                          <Grid container spacing={2}>
                            {safeDisplayData.project_history.recent_projects.slice(0, 6).map((project: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                              <Grid item xs={12} md={6} key={idx}>
                                <InfoCard elevation={0} sx={{ height: '100%' }}>
                                  <Typography variant="body2" fontWeight={600} gutterBottom>
                                    {project.project_type}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    Role: {project.role}
                                  </Typography>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    <ProjectChip label={project.industry} size="small" color="secondary" variant="outlined" />
                                    {project.solution_type && (
                                      <ProjectChip label={project.solution_type} size="small" variant="outlined" />
                                    )}
                                  </Stack>
                                  {project.close_date && (
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                      Completed: {project.close_date}
                                    </Typography>
                                  )}
                                </InfoCard>
                              </Grid>
                            ))}
                          </Grid>
                        </Section>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Empty state with helpful information */}
                      <Section>
                        <SectionTitle>
                          <Business color="primary" />
                          Project Experience
                        </SectionTitle>
                        <Alert severity="info" variant="outlined">
                          <Typography variant="body2" gutterBottom>
                            No Crosslake project history is available for this practitioner. This could mean:
                          </Typography>
                          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 1 }}>
                            <Typography component="li" variant="body2">They are new to the Crosslake platform</Typography>
                            <Typography component="li" variant="body2">They haven't completed projects yet</Typography>
                            <Typography component="li" variant="body2">Their project data hasn't been synchronized</Typography>
                          </Box>
                          <Typography variant="body2">
                            Check their work history and LinkedIn profile for general project experience.
                          </Typography>
                        </Alert>
                      </Section>

                      {/* Show relevant skills as project indicators */}
                      {safeDisplayData.good_for_projects && safeDisplayData.good_for_projects.length > 0 && (
                        <Section>
                          <SectionTitle>
                            <ProjectIcon color="primary" />
                            Suitable Project Types
                          </SectionTitle>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {safeDisplayData.good_for_projects.map((projectType: string, idx: number) => (
                              <ProjectChip
                                key={idx}
                                label={projectType}
                                size="small"
                                color="primary"
                              />
                            ))}
                          </Box>
                        </Section>
                      )}

                      {/* Show industry tags as project context */}
                      {safeDisplayData.industry_tags && safeDisplayData.industry_tags.length > 0 && (
                        <Section>
                          <SectionTitle>
                            <Business color="primary" />
                            Industry Experience
                          </SectionTitle>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {safeDisplayData.industry_tags.map((tag: string, idx: number) => (
                              <ProjectChip
                                key={idx}
                                label={tag}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Section>
                      )}
                    </>
                  )}
                </>
              )}
            </TabPanel>

          </Box>
        </DialogContent>
      </StyledDialog>

      <PitchResumeModal
        open={pitchModalOpen}
        onClose={() => setPitchModalOpen(false)}
        practitioner={safeDisplayData}
        query={query}
      />
    </>
  );
}