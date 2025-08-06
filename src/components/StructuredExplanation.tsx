import React from 'react';
import { Box, Typography, Chip, Rating, Stack, Card, CardContent, Divider, Tooltip, Paper, LinearProgress, Grid } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

interface ParsedMatch {
  text: string;
  type: 'explicit' | 'inferred';
  source: 'linkedin' | 'crosslake';
}

interface ParsedExplanation {
  linkedinMatches: ParsedMatch[];
  linkedinScore: number;
  crosslakeMatches: ParsedMatch[];
  crosslakeScore: number;
}

const MainCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  transition: 'box-shadow 0.3s ease',
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.1rem',
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const MatchCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  position: 'relative',
  transition: 'all 0.2s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.02),
  },
  '&.explicit': {
    borderLeft: `4px solid ${theme.palette.success.main}`,
    backgroundColor: alpha(theme.palette.success.main, 0.03),
  },
  '&.inferred': {
    borderLeft: `4px solid ${theme.palette.info.main}`,
    backgroundColor: alpha(theme.palette.info.main, 0.03),
  },
}));

const MatchTypeBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  height: 24,
  fontSize: '0.75rem',
  fontWeight: 600,
  '&.explicit': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.success.contrastText,
    },
  },
  '&.inferred': {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    '& .MuiChip-icon': {
      color: theme.palette.info.contrastText,
    },
  },
}));

const ScoreSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const ScoreDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const ScoreValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1,
  '&.high': {
    color: theme.palette.success.main,
  },
  '&.medium': {
    color: theme.palette.warning.main,
  },
  '&.low': {
    color: theme.palette.grey[600],
  },
}));

const ProgressBarContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: 200,
}));

const NoMatchesBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.grey[50],
  borderRadius: theme.spacing(1),
}));

const InfoTooltip = styled(Tooltip)(({ theme }) => ({
  '& .MuiTooltip-tooltip': {
    backgroundColor: theme.palette.grey[800],
    color: 'white',
    fontSize: '0.875rem',
    maxWidth: 300,
    padding: theme.spacing(1.5),
  },
}));

function parseExplanation(explanation: string): ParsedExplanation {
  const lines = explanation.split('\n').map(line => line.trim()).filter(Boolean);
  
  const result: ParsedExplanation = {
    linkedinMatches: [],
    linkedinScore: 0,
    crosslakeMatches: [],
    crosslakeScore: 0,
  };
  
  let currentSection = '';
  let currentType: 'explicit' | 'inferred' = 'explicit';
  
  for (const line of lines) {
    // Handle both old and new format headers
    if (line.startsWith('# Relevant LinkedIn History:') || line.startsWith('# Explicit LinkedIn Matches:')) {
      currentSection = 'linkedin';
      currentType = 'explicit';
    } else if (line.startsWith('# Inferred LinkedIn Matches:')) {
      currentSection = 'linkedin';
      currentType = 'inferred';
    } else if (line.startsWith('# LinkedIn Relevance Score:')) {
      const scoreMatch = line.match(/(\d+)/);
      if (scoreMatch) {
        result.linkedinScore = parseInt(scoreMatch[1], 10);
      }
      currentSection = '';
    } else if (line.startsWith('# Relevant Crosslake History:') || line.startsWith('# Explicit Crosslake Matches:')) {
      currentSection = 'crosslake';
      currentType = 'explicit';
    } else if (line.startsWith('# Inferred Crosslake Matches:')) {
      currentSection = 'crosslake';
      currentType = 'inferred';
    } else if (line.startsWith('# Crosslake History Score:')) {
      const scoreMatch = line.match(/(\d+)/);
      if (scoreMatch) {
        result.crosslakeScore = parseInt(scoreMatch[1], 10);
      }
      currentSection = '';
    } else if (line.startsWith('- ')) {
      const content = line.substring(2).trim();
      
      // Skip placeholder text and "No matches found" entries
      const skipPatterns = [
        '[List specific companies',
        '[List specific Crosslake',
        '[List ONLY items',
        '[List related experience',
        '[List ONLY Crosslake',
        '[List Crosslake experience',
        'No explicit matches found',
        'No explicit Crosslake matches found'
      ];
      
      if (!skipPatterns.some(pattern => content.includes(pattern))) {
        const match: ParsedMatch = {
          text: content,
          type: currentType,
          source: currentSection as 'linkedin' | 'crosslake'
        };
        
        if (currentSection === 'linkedin') {
          result.linkedinMatches.push(match);
        } else if (currentSection === 'crosslake') {
          result.crosslakeMatches.push(match);
        }
      }
    }
  }
  
  return result;
}

interface StructuredExplanationProps {
  explanation: string;
}

export default function StructuredExplanation({ explanation }: StructuredExplanationProps) {
  // Debug logging
  console.log('StructuredExplanation received:', explanation);
  
  const parsed = parseExplanation(explanation);
  
  // Debug logging
  console.log('Parsed result:', parsed);
  
  const getScoreClass = (score: number) => {
    if (score >= 7) return 'high';
    if (score >= 4) return 'medium';
    return 'low';
  };
  
  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Strong Match';
    if (score >= 4) return 'Moderate Match';
    return 'Weak Match';
  };
  
  const explicitLinkedInMatches = parsed.linkedinMatches.filter(m => m.type === 'explicit');
  const inferredLinkedInMatches = parsed.linkedinMatches.filter(m => m.type === 'inferred');
  const explicitCrosslakeMatches = parsed.crosslakeMatches.filter(m => m.type === 'explicit');
  const inferredCrosslakeMatches = parsed.crosslakeMatches.filter(m => m.type === 'inferred');
  
  const renderMatches = (matches: ParsedMatch[], type: 'explicit' | 'inferred') => {
    if (matches.length === 0) {
      return (
        <NoMatchesBox>
          <Typography variant="body2">
            No {type} matches found
          </Typography>
        </NoMatchesBox>
      );
    }
    
    return matches.map((match, index) => (
      <MatchCard key={index} className={match.type} elevation={0}>
        <MatchTypeBadge
          icon={match.type === 'explicit' ? <CheckCircleIcon fontSize="small" /> : <LightbulbIcon fontSize="small" />}
          label={match.type === 'explicit' ? 'Explicit' : 'Inferred'}
          size="small"
          className={match.type}
        />
        <Typography variant="body2" sx={{ pr: 10, lineHeight: 1.7 }}>
          {match.text}
        </Typography>
      </MatchCard>
    ));
  };
  
  const renderScoreSection = (score: number, maxScore: number = 10) => {
    const percentage = (score / maxScore) * 100;
    const scoreClass = getScoreClass(score);
    
    return (
      <ScoreSection>
        <ScoreDisplay>
          <AssessmentIcon color="action" />
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Relevance Score
            </Typography>
            <Box display="flex" alignItems="baseline" gap={1}>
              <ScoreValue className={scoreClass}>
                {score}
              </ScoreValue>
              <Typography variant="body2" color="text.secondary">
                / {maxScore}
              </Typography>
            </Box>
          </Box>
        </ScoreDisplay>
        
        <ProgressBarContainer>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              {getScoreLabel(score)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {percentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                backgroundColor: 
                  scoreClass === 'high' ? 'success.main' : 
                  scoreClass === 'medium' ? 'warning.main' : 
                  'grey.400'
              }
            }}
          />
        </ProgressBarContainer>
        
        <Rating 
          value={score / 2} 
          max={5} 
          precision={0.5} 
          size="medium" 
          readOnly
          icon={<StarIcon sx={{ color: 'warning.main' }} />}
          emptyIcon={<StarIcon sx={{ color: 'grey.300' }} />}
        />
      </ScoreSection>
    );
  };
  
  // Calculate overall match quality
  const totalScore = parsed.linkedinScore + parsed.crosslakeScore;
  const overallPercentage = (totalScore / 20) * 100;
  const overallClass = totalScore >= 14 ? 'high' : totalScore >= 8 ? 'medium' : 'low';
  const overallLabel = totalScore >= 14 ? 'Excellent Match' : totalScore >= 8 ? 'Good Match' : 'Fair Match';
  
  return (
    <Box>
      {/* Overall Match Summary */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          p: 2.5, 
          background: `linear-gradient(135deg, ${
            overallClass === 'high' ? 'rgba(46, 125, 50, 0.08)' : 
            overallClass === 'medium' ? 'rgba(245, 124, 0, 0.08)' : 
            'rgba(0, 0, 0, 0.04)'
          } 0%, rgba(255, 255, 255, 0) 100%)`,
          border: '1px solid',
          borderColor: overallClass === 'high' ? 'success.light' : 
                       overallClass === 'medium' ? 'warning.light' : 
                       'grey.300',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="text.secondary" display="block">
              Overall Match Quality
            </Typography>
            <Typography variant="h5" fontWeight={700} color={
              overallClass === 'high' ? 'success.dark' : 
              overallClass === 'medium' ? 'warning.dark' : 
              'text.primary'
            }>
              {overallLabel}
            </Typography>
            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <Typography variant="body2" color="text.secondary">
                Combined Score:
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {totalScore}/20
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ({overallPercentage.toFixed(0)}%)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <LinkedInIcon fontSize="small" sx={{ color: '#0077B5' }} />
                  <Typography variant="body2">LinkedIn Match</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {parsed.linkedinScore}/10
                  </Typography>
                  <Rating 
                    value={parsed.linkedinScore / 2} 
                    max={5} 
                    size="small" 
                    readOnly 
                  />
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <AccountTreeIcon fontSize="small" sx={{ color: 'primary.main' }} />
                  <Typography variant="body2">Crosslake Match</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography variant="body2" fontWeight={600}>
                    {parsed.crosslakeScore}/10
                  </Typography>
                  <Rating 
                    value={parsed.crosslakeScore / 2} 
                    max={5} 
                    size="small" 
                    readOnly 
                  />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* LinkedIn History Section */}
      <MainCard>
        <CardContent>
          <SectionHeader>
            <LinkedInIcon sx={{ fontSize: 28, color: '#0077B5' }} />
            <SectionTitle>
              LinkedIn Work History
              <InfoTooltip 
                title="We analyze the practitioner's LinkedIn profile to identify relevant experience that matches your requirements"
                placement="top"
              >
                <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', ml: 0.5 }} />
              </InfoTooltip>
            </SectionTitle>
          </SectionHeader>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Explicit Matches
                </Typography>
                <InfoTooltip 
                  title="Direct mentions of your search terms found in their profile (e.g., exact skills, technologies, or roles)"
                  placement="top"
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                </InfoTooltip>
              </Box>
              {renderMatches(explicitLinkedInMatches, 'explicit')}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <LightbulbIcon sx={{ color: 'info.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Inferred Matches
                </Typography>
                <InfoTooltip 
                  title="Related experience that suggests relevant expertise based on similar roles, industries, or transferable skills"
                  placement="top"
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                </InfoTooltip>
              </Box>
              {renderMatches(inferredLinkedInMatches, 'inferred')}
            </Grid>
          </Grid>
          
          {renderScoreSection(parsed.linkedinScore)}
        </CardContent>
      </MainCard>
      
      {/* Crosslake History Section */}
      <MainCard>
        <CardContent>
          <SectionHeader>
            <AccountTreeIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <SectionTitle>
              Crosslake Project History
              <InfoTooltip 
                title="Previous Crosslake projects and engagements that demonstrate relevant experience"
                placement="top"
              >
                <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', ml: 0.5 }} />
              </InfoTooltip>
            </SectionTitle>
          </SectionHeader>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Explicit Matches
                </Typography>
                <InfoTooltip 
                  title="Crosslake projects that directly match your search criteria"
                  placement="top"
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                </InfoTooltip>
              </Box>
              {renderMatches(explicitCrosslakeMatches, 'explicit')}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <LightbulbIcon sx={{ color: 'info.main', fontSize: 20 }} />
                <Typography variant="subtitle2" fontWeight={600}>
                  Inferred Matches
                </Typography>
                <InfoTooltip 
                  title="Related Crosslake experience that suggests capability in your required areas"
                  placement="top"
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ color: 'action.active', fontSize: 16 }} />
                </InfoTooltip>
              </Box>
              {renderMatches(inferredCrosslakeMatches, 'inferred')}
            </Grid>
          </Grid>
          
          {renderScoreSection(parsed.crosslakeScore)}
        </CardContent>
      </MainCard>
    </Box>
  );
}