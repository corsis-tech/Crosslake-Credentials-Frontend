import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Alert,
  Grid,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import SpeedIcon from '@mui/icons-material/Speed';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { styled } from '@mui/material/styles';
import type { PractitionerMatch, ExtendedMatchResponse, ComparisonResult } from '../types/types';
import EnhancedPractitionerCard from '../components/EnhancedPractitionerCard';
import CompactPractitionerCard from '../components/CompactPractitionerCard';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface LocationState {
  mode: 'single' | 'compare';
  result?: ExtendedMatchResponse;
  comparison?: ComparisonResult;
}

const BackButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(3),
  textTransform: 'none',
  fontWeight: 500,
  padding: theme.spacing(1, 3),
  '&:hover': {
    backgroundColor: '#f5f5f5',
  },
}));

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
      id={`comparison-tabpanel-${index}`}
      aria-labelledby={`comparison-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  const [comparisonTab, setComparisonTab] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerMatch | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Use useEffect to handle navigation to avoid React warning
  React.useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  // If no state, return null while redirect happens
  if (!state) {
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setComparisonTab(newValue);
  };

  const handleViewModeChange = (_event: React.MouseEvent<HTMLElement>, newMode: 'grid' | 'list' | null) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleOpenDetails = (practitioner: PractitionerMatch) => {
    setSelectedPractitioner(practitioner);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  // Render function for practitioner cards (used in both modes)
  const renderPractitionerCard = (
    practitioner: PractitionerMatch, 
    index: number,
    systemLabel?: string
  ) => {
    if (viewMode === 'grid') {
      return (
        <CompactPractitionerCard
          key={practitioner.practitioner_id || index}
          practitioner={practitioner}
          index={index}
          onExpand={handleOpenDetails}
        />
      );
    }
    
    return (
      <EnhancedPractitionerCard
        key={practitioner.practitioner_id || index}
        practitioner={practitioner}
        query={state.result?.query || state.comparison?.original.query || ''}
        index={index}
        systemLabel={systemLabel}
      />
    );
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      py: 4,
    }}>
      <Container maxWidth="xl">
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          sx={{ mb: 4 }}
        >
          New Search
        </BackButton>

        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: '#1a1a1a',
            }}
          >
            {state.mode === 'compare' ? 'System Comparison Results' : 'Search Results'}
          </Typography>
        </Box>
        
        {state.mode === 'single' && state.result && (
          <>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                mb: 4, 
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Your search query
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    "{state.result.query}"
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Chip 
                    icon={<PersonIcon />}
                    label={`${state.result.total_results} practitioner${state.result.total_results !== 1 ? 's' : ''} found`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    icon={state.result.system_used === 'original' ? <StorageIcon /> : <SmartToyIcon />}
                    label={`${state.result.system_used === 'original' ? 'Standard Search' : 'AI Multi-Agent'}${
                      state.result.index_used ? ` (Enhanced Data)` : ''
                    }`}
                    color={state.result.system_used === 'original' ? 'default' : 'primary'}
                  />
                  {state.result.processing_time_ms && (
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SpeedIcon fontSize="small" />
                      Search completed in {state.result.processing_time_ms.toFixed(0)}ms
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Paper>

            {/* View Mode Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
              >
                <ToggleButton value="grid">
                  <ViewModuleIcon sx={{ mr: 1 }} />
                  Grid View
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon sx={{ mr: 1 }} />
                  List View
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {viewMode === 'grid' ? (
              <Grid container spacing={2}>
                {state.result.matches
                  .slice()
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((practitioner, index) => (
                    <Grid item xs={12} md={6} lg={4} key={practitioner.practitioner_id || index}>
                      {renderPractitionerCard(practitioner, index)}
                    </Grid>
                  ))}
              </Grid>
            ) : (
              <Stack spacing={4}>
                {state.result.matches
                  .slice()
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((practitioner, index) => 
                    renderPractitionerCard(practitioner, index)
                  )}
              </Stack>
            )}
          </>
        )}

        {state.mode === 'compare' && state.comparison && (
          <>
            <Alert severity="info" sx={{ mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Comparison Results
              </Typography>
              <Typography variant="body2">
                Query: "{state.comparison.original.query}"
              </Typography>
              <Typography variant="body2">
                Original System: {state.comparison.original.total_results} results in {state.comparison.original.processing_time_ms.toFixed(0)}ms
              </Typography>
              <Typography variant="body2">
                Agentset System: {state.comparison.agentset.total_results} results in {state.comparison.agentset.processing_time_ms.toFixed(0)}ms
              </Typography>
            </Alert>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={comparisonTab} onChange={handleTabChange} aria-label="comparison tabs">
                <Tab 
                  icon={<StorageIcon />}
                  label={`Standard Search (${state.comparison.original.total_results})`} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<SmartToyIcon />}
                  label={`AI Multi-Agent (${state.comparison.agentset.total_results})`} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <TabPanel value={comparisonTab} index={0}>
              <Grid container spacing={2}>
                {state.comparison.original.matches
                  .slice()
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((practitioner, index) => (
                    <Grid item xs={12} md={6} lg={4} key={practitioner.practitioner_id || index}>
                      {renderPractitionerCard(practitioner, index, 'Standard Search')}
                    </Grid>
                  ))}
              </Grid>
            </TabPanel>

            <TabPanel value={comparisonTab} index={1}>
              <Grid container spacing={2}>
                {state.comparison.agentset.matches
                  .slice()
                  .sort((a, b) => b.match_score - a.match_score)
                  .map((practitioner, index) => (
                    <Grid item xs={12} md={6} lg={4} key={practitioner.practitioner_id || index}>
                      {renderPractitionerCard(practitioner, index, 'AI Multi-Agent')}
                    </Grid>
                  ))}
              </Grid>
            </TabPanel>
          </>
        )}

        {((state.mode === 'single' && (!state.result || state.result.matches.length === 0)) ||
          (state.mode === 'compare' && (!state.comparison || 
            (state.comparison.original.matches.length === 0 && state.comparison.agentset.matches.length === 0)))) && (
          <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No practitioners found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Try adjusting your search criteria or using different keywords.
            </Typography>
            <Button variant="outlined" onClick={handleBack}>
              Try New Search
            </Button>
          </Paper>
        )}

        {/* Full Details Dialog */}
        <Dialog
          open={detailsOpen}
          onClose={handleCloseDetails}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 2 }
          }}
        >
          <IconButton
            onClick={handleCloseDetails}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
          <DialogContent sx={{ pt: 4 }}>
            {selectedPractitioner && (
              <EnhancedPractitionerCard
                practitioner={selectedPractitioner}
                query={state.result?.query || state.comparison?.original.query || ''}
                index={0}
              />
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}