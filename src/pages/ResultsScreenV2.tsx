import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Chip,
  Stack,
  Paper,
  Skeleton,
  Fade,
  Grow,
  alpha,
} from '@mui/material';
import { 
  ArrowBack,
  ViewModule,
  ViewList,
  Search,
  Timer,
  Person,
  Star,
  LocationOn,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { ExtendedMatchResponse, PractitionerMatch } from '../types/types';
import PractitionerDetailModal from '../components/PractitionerDetailModal';

// Styled Components following FocusLock design system
const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#FFFFFF',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(6),
}));

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  borderBottom: `1px solid ${alpha('#000000', 0.08)}`,
  paddingBottom: theme.spacing(3),
}));

const SearchSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: alpha('#1A73E8', 0.04),
  border: `1px solid ${alpha('#1A73E8', 0.12)}`,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const ResultsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
}));

const PractitionerCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 8,
  border: `1px solid ${alpha('#000000', 0.08)}`,
  transition: 'all 150ms ease-out',
  cursor: 'pointer',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  maxWidth: 500, // Prevent cards from being too wide
  margin: '0 auto', // Center in grid cell
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    borderColor: '#1A73E8',
  },
}));

const MatchScoreBadge = styled(Box)<{ score: number }>(({ score }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.25rem',
  color: '#FFFFFF',
  backgroundColor: score >= 80 ? '#00C853' : score >= 60 ? '#FF6D00' : '#1A73E8',
  boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
  flexShrink: 0,
}));

const CardHeader = styled(Box)({
  display: 'flex',
  gap: 12,
  marginBottom: 12,
});

const CardInfo = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const Name = styled(Typography)({
  fontSize: '1.125rem',
  fontWeight: 600,
  lineHeight: 1.2,
  marginBottom: 4,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const Title = styled(Typography)({
  fontSize: '0.875rem',
  color: 'rgba(0, 0, 0, 0.7)',
  lineHeight: 1.4,
  marginBottom: 8,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

const CurrentTitle = styled(Typography)({
  fontSize: '0.875rem',
  fontWeight: 500,
  color: '#1A73E8',
  lineHeight: 1.3,
  marginBottom: 12,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
});

const ScoreBadgeContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
});

const ScoreLabel = styled(Typography)({
  fontSize: '0.625rem',
  fontWeight: 500,
  color: 'rgba(0, 0, 0, 0.6)',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

const ScoreSection = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: 8,
  marginLeft: 'auto',
});

const CompositeScore = styled(Box)<{ score: number }>(({ score }) => ({
  width: 56,
  height: 56,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.25rem',
  color: '#FFFFFF',
  backgroundColor: score >= 5 ? '#00C853' : score >= 3 ? '#FF6D00' : '#1A73E8',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
}));

const DualScoreBadge = styled(Box)({
  display: 'flex',
  gap: 6,
});

const MiniScoreBadge = styled(Box)<{ score: number }>(({ score }) => ({
  width: 36,
  height: 36,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  color: '#FFFFFF',
  backgroundColor: score >= 2.5 ? '#00C853' : score >= 1.5 ? '#FF6D00' : '#1A73E8',
  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
}))

const MetaInfo = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  marginBottom: 12,
  flexWrap: 'wrap',
});

const MetaItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  fontSize: '0.875rem',
  color: 'rgba(0, 0, 0, 0.6)',
});

const ExperienceWrapper = styled(Box)({
  marginTop: 'auto',
});

const ExperienceSection = styled(Box)({
  marginBottom: 12,
});

const ExperienceTitle = styled(Typography)({
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'rgba(0, 0, 0, 0.8)',
  marginBottom: 4,
  textTransform: 'uppercase',
});

const ExperienceItem = styled(Typography)({
  fontSize: '0.8125rem',
  color: 'rgba(0, 0, 0, 0.7)',
  lineHeight: 1.4,
  marginBottom: 2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const ProjectChip = styled(Chip)({
  height: 20,
  fontSize: '0.6875rem',
  borderRadius: 3,
  backgroundColor: alpha('#00C853', 0.08),
  marginRight: 4,
  marginBottom: 4,
  '& .MuiChip-label': {
    paddingLeft: 6,
    paddingRight: 6,
  },
});

const ViewToggle = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginLeft: 'auto',
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 2),
}));

// Loading skeleton component
const CardSkeleton = () => (
  <Box>
    <Box display="flex" gap={1.5} mb={2}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box flex={1}>
        <Skeleton width="60%" height={24} sx={{ mb: 0.5 }} />
        <Skeleton width="90%" height={20} />
      </Box>
    </Box>
    <Skeleton width="100%" height={20} sx={{ mb: 1.5 }} />
    <Box display="flex" gap={1}>
      <Skeleton width={80} height={24} />
      <Skeleton width={60} height={24} />
      <Skeleton width={70} height={24} />
    </Box>
  </Box>
);

interface LocationState {
  mode: 'single' | 'compare';
  result?: ExtendedMatchResponse;
}

export default function ResultsScreenV2() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isLoading] = useState(false);
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerMatch | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Redirect if no state
  React.useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  const sortedMatches = useMemo(() => {
    if (!state?.result?.matches) return [];
    return [...state.result.matches].sort((a, b) => b.match_score - a.match_score);
  }, [state?.result?.matches]);

  if (!state || !state.result) {
    return null;
  }

  const { result } = state;

  const handleBack = () => {
    navigate('/');
  };

  const handleOpenDetail = (practitioner: PractitionerMatch) => {
    setSelectedPractitioner(practitioner);
    setDetailModalOpen(true);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);
  };

  const renderPractitionerCard = (practitioner: PractitionerMatch, index: number) => {
    // Get current title from work history
    const currentTitle = practitioner.work_history?.[0]?.title || practitioner.headline;
    const currentCompany = practitioner.work_history?.[0]?.company || '';
    
    // Get LinkedIn and Crosslake scores from match breakdown (1-6 scale)
    const linkedinScore = practitioner.match_breakdown?.enhanced_score?.linkedin_match || 0;
    const crosslakeScore = practitioner.match_breakdown?.enhanced_score?.project_match || 0;
    const compositeScore = practitioner.match_breakdown?.enhanced_score?.total_score || 1;
    
    // Get last 3 LinkedIn positions
    const recentPositions = practitioner.work_history?.slice(0, 3) || [];
    
    // Get last 3 Crosslake projects
    const recentProjects = practitioner.project_history?.recent_projects?.slice(0, 3) || [];

    return (
      <Grow in key={practitioner.practitioner_id} timeout={300 + index * 50}>
        <PractitionerCard elevation={0} onClick={() => handleOpenDetail(practitioner)}>
          <CardHeader>
            <CardInfo>
              <Name>{practitioner.name}</Name>
              <Title>{practitioner.headline}</Title>
              {currentTitle && currentTitle !== practitioner.headline && (
                <CurrentTitle>
                  {currentTitle}
                  {currentCompany && ` at ${currentCompany}`}
                </CurrentTitle>
              )}
            </CardInfo>
            <ScoreSection>
              <CompositeScore score={compositeScore}>
                {compositeScore}
              </CompositeScore>
              <DualScoreBadge>
                <ScoreBadgeContainer>
                  <MiniScoreBadge score={linkedinScore}>
                    {Math.round(linkedinScore)}
                  </MiniScoreBadge>
                  <ScoreLabel>LinkedIn</ScoreLabel>
                </ScoreBadgeContainer>
                <ScoreBadgeContainer>
                  <MiniScoreBadge score={crosslakeScore}>
                    {Math.round(crosslakeScore)}
                  </MiniScoreBadge>
                  <ScoreLabel>Crosslake</ScoreLabel>
                </ScoreBadgeContainer>
              </DualScoreBadge>
            </ScoreSection>
          </CardHeader>

          <MetaInfo>
            {practitioner.location && (
              <MetaItem>
                <LocationOn sx={{ fontSize: 16 }} />
                {practitioner.location}
              </MetaItem>
            )}
            {practitioner.seniority_level && (
              <MetaItem>
                <Star sx={{ fontSize: 16 }} />
                {practitioner.seniority_level}
              </MetaItem>
            )}
          </MetaInfo>

          <ExperienceWrapper>
            {recentPositions.length > 0 && (
              <ExperienceSection>
                <ExperienceTitle>Recent LinkedIn Experience</ExperienceTitle>
                {recentPositions.map((position, idx) => (
                  <ExperienceItem key={idx}>
                    {position.title} • {position.company}
                  </ExperienceItem>
                ))}
              </ExperienceSection>
            )}
            
            {recentProjects.length > 0 && (
              <ExperienceSection>
                <ExperienceTitle>Recent Crosslake Projects</ExperienceTitle>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {recentProjects.map((project, idx) => (
                    <ProjectChip
                      key={idx}
                      label={`${project.project_type} - ${project.industry}`}
                      size="small"
                    />
                  ))}
                </Box>
              </ExperienceSection>
            )}
          </ExperienceWrapper>
        </PractitionerCard>
      </Grow>
    );
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <Container maxWidth="lg">
          <Header>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Back to Search
            </Button>
          </Header>
          <ResultsGrid>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Paper key={i} sx={{ p: 2, borderRadius: 2 }}>
                <CardSkeleton />
              </Paper>
            ))}
          </ResultsGrid>
        </Container>
      </PageWrapper>
    );
  }

  if (result.matches.length === 0) {
    return (
      <PageWrapper>
        <Container maxWidth="lg">
          <Header>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              Back to Search
            </Button>
          </Header>
          <EmptyState>
            <Search sx={{ fontSize: 64, color: 'rgba(0,0,0,0.2)', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              No practitioners found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or using different keywords
            </Typography>
            <Button
              variant="contained"
              onClick={handleBack}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
                px: 4,
              }}
            >
              Try New Search
            </Button>
          </EmptyState>
        </Container>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Container maxWidth="lg">
        <Header>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBack}
              sx={{
                borderRadius: 8,
                textTransform: 'none',
              }}
            >
              Back to Search
            </Button>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 600, 
              fontSize: { xs: '1.5rem', md: '2rem' },
              ml: 2,
            }}>
              Search Results
            </Typography>
          </Stack>
        </Header>

        <SearchSummary elevation={0}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Typography variant="body2" color="text.secondary">
              Query:
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              "{result.query}"
            </Typography>
            <Chip
              icon={<Person />}
              label={`${result.total_results} matches`}
              size="small"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              icon={<Timer />}
              label={`${(result.processing_time_ms / 60000).toFixed(1)} min`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
          </Stack>
          <ViewToggle>
            <IconButton
              size="small"
              onClick={() => setViewMode('grid')}
              color={viewMode === 'grid' ? 'primary' : 'default'}
            >
              <ViewModule />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setViewMode('list')}
              color={viewMode === 'list' ? 'primary' : 'default'}
            >
              <ViewList />
            </IconButton>
          </ViewToggle>
        </SearchSummary>

        {viewMode === 'grid' ? (
          <ResultsGrid>
            {sortedMatches.map((practitioner, index) => 
              renderPractitionerCard(practitioner, index)
            )}
          </ResultsGrid>
        ) : (
          <Stack spacing={2}>
            {sortedMatches.map((practitioner, index) => (
              <Fade in key={practitioner.practitioner_id} timeout={300}>
                <Box>{renderPractitionerCard(practitioner, index)}</Box>
              </Fade>
            ))}
          </Stack>
        )}

        <PractitionerDetailModal
          open={detailModalOpen}
          onClose={handleCloseDetail}
          practitioner={selectedPractitioner}
          query={result.query}
        />
      </Container>
    </PageWrapper>
  );
}