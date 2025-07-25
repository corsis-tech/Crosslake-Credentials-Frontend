import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

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
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PractitionerAllData: React.FC = () => {
  const { practitionerId } = useParams<{ practitionerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (practitionerId) {
      fetchAllData();
    }
  }, [practitionerId]);

  const fetchAllData = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/practitioners/${practitionerId}/all-data`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Practitioner not found');
        }
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const allData = await response.json();
      setData(allData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practitioner data');
      console.error('Error fetching practitioner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderJSON = (obj: any, title: string) => {
    if (!obj || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
      return (
        <Typography variant="body2" color="text.secondary">
          No {title.toLowerCase()} data available
        </Typography>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
        <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto' }}>
          {JSON.stringify(obj, null, 2)}
        </pre>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/practitioners')}
          sx={{ mt: 2 }}
        >
          Back to Practitioners
        </Button>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, sources } = data;

  return (
    <Box sx={{ width: '100%' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/practitioners')}
        sx={{ mb: 2 }}
      >
        Back to Practitioners
      </Button>

      <Typography variant="h4" gutterBottom>
        {summary.name || 'Unknown Practitioner'}
      </Typography>

      {/* Summary Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Practitioner ID" 
                    secondary={data.practitioner_id}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={summary.email || 'Not available'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Location" 
                    secondary={summary.location || 'Not available'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="LinkedIn URL" 
                    secondary={
                      summary.linkedin_url ? (
                        <a href={summary.linkedin_url} target="_blank" rel="noopener noreferrer">
                          {summary.linkedin_url}
                        </a>
                      ) : 'Not available'
                    }
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="Crosslake Projects" 
                    secondary={summary.crosslake_projects_count}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="LinkedIn Data Size" 
                    secondary={`${summary.linkedin_data_char_count.toLocaleString()} characters`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Indexed in Pinecone" 
                    secondary={
                      <Chip
                        icon={summary.indexed_in_pinecone ? <CheckIcon /> : <CloseIcon />}
                        label={summary.indexed_in_pinecone ? 'Yes' : 'No'}
                        color={summary.indexed_in_pinecone ? 'success' : 'error'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle2" gutterBottom>
            Data Completeness
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(summary.data_completeness).map(([source, hasData]) => (
              <Chip
                key={source}
                label={source}
                color={(hasData as boolean) ? 'success' : 'default'}
                variant={(hasData as boolean) ? 'filled' : 'outlined'}
                size="small"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Data Sources Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="data sources tabs">
            <Tab label="Registry" />
            <Tab label="Pinecone" />
            <Tab label="LinkedIn" />
            <Tab label="Enhanced" />
            <Tab label="Projects" />
            <Tab label="Integrated" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Registry Data (people.csv)
          </Typography>
          {renderJSON(sources.registry, 'Registry')}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Pinecone Vector Database
          </Typography>
          {data.indexed_in_pinecone ? (
            renderJSON(sources.pinecone, 'Pinecone')
          ) : (
            <Alert severity="warning">
              This practitioner is not indexed in Pinecone.
              {data.pinecone_error && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Error: {data.pinecone_error}
                </Typography>
              )}
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            LinkedIn Profile Data
          </Typography>
          {renderJSON(sources.linkedin, 'LinkedIn')}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Enhanced/Enriched Data
          </Typography>
          {renderJSON(sources.enhanced, 'Enhanced')}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Crosslake Project History
          </Typography>
          {renderJSON(sources.project_history, 'Project history')}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Integrated Profile
          </Typography>
          {sources.integrated_profile?.content ? (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Profile Content (Markdown)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <pre style={{ margin: 0, fontSize: '0.875rem', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {sources.integrated_profile.content}
                  </pre>
                </Paper>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No integrated profile content available
            </Typography>
          )}
          
          {sources.integrated_profile?.metadata && (
            <Accordion sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Profile Metadata</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderJSON(sources.integrated_profile.metadata, 'Metadata')}
              </AccordionDetails>
            </Accordion>
          )}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PractitionerAllData;