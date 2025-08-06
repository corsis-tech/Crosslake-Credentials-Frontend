import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  Star as StarIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import type { PitchResumeResponse, PractitionerMatch, ApiError } from '../types/types';
import { pitchResumeService } from '../services/pitchResumeService';

interface PitchResumeModalProps {
  open: boolean;
  onClose: () => void;
  practitioner: PractitionerMatch;
  query: string;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: '800px',
    width: '90vw',
    maxHeight: '90vh',
  },
}));

const ResumeContent = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(2),
  backgroundColor: '#fafafa',
  border: '1px solid rgba(0, 0, 0, 0.08)',
  fontFamily: 'Georgia, serif',
  lineHeight: 1.6,
  whiteSpace: 'pre-line',
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    color: '#1a1a1a',
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(2),
  },
  '& p': {
    marginBottom: theme.spacing(1),
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(1),
    paddingLeft: theme.spacing(3),
  },
  '& li': {
    marginBottom: theme.spacing(0.5),
  },
}));

const HighlightChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: '#e3f2fd',
  color: '#1976d2',
  fontWeight: 500,
}));

export default function PitchResumeModal({ open, onClose, practitioner, query }: PitchResumeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pitchResume, setPitchResume] = useState<PitchResumeResponse | null>(null);
  const [customClient, setCustomClient] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customRequirements, setCustomRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleGenerate = async (useCustom = false) => {
    setLoading(true);
    setError(null);
    
    try {
      let response: PitchResumeResponse;
      
      if (useCustom && customClient && customRole) {
        response = await pitchResumeService.generateSimplePitchResume(
          practitioner.practitioner_id,
          customClient,
          customRole,
          customRequirements,
          'professional',
          true
        );
      } else {
        response = await pitchResumeService.generatePitchResumeFromQuery(
          practitioner.practitioner_id,
          query,
          customClient || undefined,
          customRequirements
        );
      }
      
      setPitchResume(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to generate pitch resume');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (pitchResume) {
      try {
        await navigator.clipboard.writeText(pitchResume.pitch_resume);
        // You might want to show a success message here
      } catch (err) {
        console.error('Failed to copy to clipboard:', err);
      }
    }
  };

  const handleDownload = () => {
    if (pitchResume) {
      const blob = new Blob([pitchResume.pitch_resume], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${practitioner.name.replace(/\s+/g, '_')}_pitch_resume.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim() && !customRequirements.includes(newRequirement.trim())) {
      setCustomRequirements([...customRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (requirement: string) => {
    setCustomRequirements(customRequirements.filter(req => req !== requirement));
  };

  const handleClose = () => {
    setPitchResume(null);
    setError(null);
    setShowCustomForm(false);
    setCustomClient('');
    setCustomRole('');
    setCustomRequirements([]);
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="body"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 1, color: '#2196F3' }} />
          <Typography variant="h6" component="div">
            Generate Pitch Resume
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <BusinessIcon sx={{ mr: 1, color: '#2196F3' }} />
            For: {practitioner.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {practitioner.headline}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Custom Parameters Section */}
        <Accordion expanded={showCustomForm} onChange={(_, expanded) => setShowCustomForm(!!expanded)}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Custom Parameters (Optional)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <TextField
                label="Client Name"
                value={customClient}
                onChange={(e) => setCustomClient(e.target.value)}
                fullWidth
                size="small"
                placeholder="Enter client name (or leave blank to extract from query)"
              />
              
              <TextField
                label="Role Description"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Enter role description (or leave blank to use search query)"
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Key Requirements to Emphasize:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {customRequirements.map((requirement, index) => (
                    <Chip
                      key={index}
                      label={requirement}
                      onDelete={() => handleRemoveRequirement(requirement)}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="Add a key requirement"
                    size="small"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement()}
                    sx={{ flex: 1 }}
                  />
                  <Button
                    onClick={handleAddRequirement}
                    variant="outlined"
                    size="small"
                    disabled={!newRequirement.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Box sx={{ my: 3 }}>
          <Button
            variant="contained"
            onClick={() => handleGenerate(showCustomForm && !!(customClient || customRole))}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <DescriptionIcon />}
            fullWidth
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1976D2 0%, #1BA8D9 100%)',
              },
            }}
          >
            {loading ? 'Generating Resume...' : 'Generate Pitch Resume'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {pitchResume && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Generated Resume</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<CopyIcon />}
                  onClick={handleCopy}
                  size="small"
                  variant="outlined"
                >
                  Copy
                </Button>
                <Button
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                  size="small"
                  variant="outlined"
                >
                  Download
                </Button>
              </Stack>
            </Box>

            {pitchResume.key_highlights && pitchResume.key_highlights.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <StarIcon sx={{ mr: 1, color: '#ff9800' }} />
                  Key Highlights:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {pitchResume.key_highlights.map((highlight, index) => (
                    <HighlightChip key={index} label={highlight} />
                  ))}
                </Box>
              </Box>
            )}

            <ResumeContent elevation={0}>
              <Typography variant="body1" sx={{ fontSize: '0.95rem' }}>
                {pitchResume.pitch_resume}
              </Typography>
            </ResumeContent>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Generated for: {pitchResume.client_name} • Processing time: {pitchResume.processing_time_ms.toFixed(0)}ms
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {pitchResume && (
          <Button
            startIcon={<EmailIcon />}
            onClick={() => {
              const subject = `Pitch Resume - ${practitioner.name}`;
              const body = pitchResume.pitch_resume;
              const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              window.open(mailtoLink);
            }}
            variant="outlined"
          >
            Email Resume
          </Button>
        )}
        <Button onClick={handleClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}