import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Grid,
  Divider,
  IconButton,
  Link,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Email,
  LinkedIn,
  LocationOn,
  Business,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { practitionerApi } from '../utils/api';

interface PractitionerDetail {
  practitioner_id: string;
  name: string;
  email?: string;
  linkedin_url?: string;
  location?: string;
  headline?: string;
  summary?: string;
  skills?: string[];
  crosslake_projects?: Array<{
    project_id: string;
    project_name: string;
    role?: string;
    start_date?: string;
    end_date?: string;
  }>;
  crosslake_projects_count: number;
  linkedin_data_char_count: number;
  indexed_in_pinecone: boolean;
  has_linkedin_data: boolean;
  has_enrichment_data: boolean;
  seniority_level?: string;
  linkedin_data?: {
    experience?: any[];
    education?: any[];
    certifications?: any[];
  };
  enrichment_data?: {
    skills?: string[];
    languages?: string[];
  };
}

const PractitionerDetail: React.FC = () => {
  const { practitionerId } = useParams<{ practitionerId: string }>();
  const navigate = useNavigate();
  const [practitioner, setPractitioner] = useState<PractitionerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (practitionerId) {
      fetchPractitionerDetail(practitionerId);
    }
  }, [practitionerId]);

  const fetchPractitionerDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/practitioners/${id}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch practitioner: ${response.statusText}`);
      }

      const data = await response.json();
      setPractitioner(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practitioner details');
      console.error('Error fetching practitioner:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !practitioner) {
    return (
      <Box sx={{ p: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/practitioners')}
          sx={{ mb: 2 }}
        >
          Back to Practitioners
        </Button>
        <Alert severity="error">{error || 'Practitioner not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/practitioners')}
        sx={{ mb: 3 }}
      >
        Back to Practitioners
      </Button>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          {/* Header Section */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {practitioner.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                {practitioner.indexed_in_pinecone ? (
                  <Chip
                    icon={<CheckCircle />}
                    label="Indexed"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    icon={<Cancel />}
                    label="Not Indexed"
                    color="error"
                    size="small"
                  />
                )}
                {practitioner.seniority_level && (
                  <Chip
                    label={practitioner.seniority_level}
                    color="primary"
                    size="small"
                  />
                )}
              </Stack>
            </Box>

            {practitioner.headline && (
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {practitioner.headline}
              </Typography>
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              {practitioner.location && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn sx={{ mr: 0.5, fontSize: 20 }} color="action" />
                  <Typography variant="body2">{practitioner.location}</Typography>
                </Box>
              )}
              {practitioner.email && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email sx={{ mr: 0.5, fontSize: 20 }} color="action" />
                  <Link href={`mailto:${practitioner.email}`} underline="hover">
                    <Typography variant="body2">{practitioner.email}</Typography>
                  </Link>
                </Box>
              )}
              {practitioner.linkedin_url && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinkedIn sx={{ mr: 0.5, fontSize: 20 }} color="action" />
                  <Link
                    href={practitioner.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                  >
                    <Typography variant="body2">LinkedIn Profile</Typography>
                  </Link>
                </Box>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Summary Section */}
          {practitioner.summary && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body1" paragraph>
                  {practitioner.summary}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
            </>
          )}

          {/* Stats Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Data Overview
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Crosslake Projects
                  </Typography>
                  <Typography variant="h5">
                    {practitioner.crosslake_projects_count}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    LinkedIn Data
                  </Typography>
                  <Typography variant="h5">
                    {practitioner.linkedin_data_char_count > 0
                      ? `${(practitioner.linkedin_data_char_count / 1000).toFixed(1)}K chars`
                      : 'No data'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data Sources
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    {practitioner.has_linkedin_data && (
                      <Chip label="LinkedIn" size="small" color="info" />
                    )}
                    {practitioner.has_enrichment_data && (
                      <Chip label="Enrichment" size="small" color="success" />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Skills Section */}
          {practitioner.skills && practitioner.skills.length > 0 && (
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="h6" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {practitioner.skills.slice(0, 10).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                  {practitioner.skills.length > 10 && (
                    <Chip
                      label={`+${practitioner.skills.length - 10} more`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Crosslake Projects Section */}
          {practitioner.crosslake_projects && practitioner.crosslake_projects.length > 0 && (
            <>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Crosslake Projects ({practitioner.crosslake_projects.length})
                </Typography>
                <Stack spacing={2}>
                  {practitioner.crosslake_projects.map((project) => (
                    <Paper key={project.project_id} sx={{ p: 2 }} variant="outlined">
                      <Typography variant="subtitle1" fontWeight={500}>
                        {project.project_name}
                      </Typography>
                      {project.role && (
                        <Typography variant="body2" color="text.secondary">
                          Role: {project.role}
                        </Typography>
                      )}
                      {(project.start_date || project.end_date) && (
                        <Typography variant="body2" color="text.secondary">
                          {project.start_date} - {project.end_date || 'Present'}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Grid>
            </>
          )}

        </Grid>
      </Paper>
    </Box>
  );
};

export default PractitionerDetail;