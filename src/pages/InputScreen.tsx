import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Collapse,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import StorageIcon from '@mui/icons-material/Storage';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { styled } from '@mui/material/styles';
import { matchingApi } from '../utils/api';
// ExtendedMatchResponse no longer needed since we only use streaming
// import type { MatchingSystem, IndexType, MatchQuery, ExtendedMatchResponse } from '../types/types';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: 'transparent',
  borderRadius: 0,
  boxShadow: 'none',
  border: 'none',
}));

// Default prompt no longer used since we switched to streaming mode
// const defaultPrompt = `...`;

const sampleQuestions = [
  "Who has worked for a competitor of HSCBC bank and has expertise with payment platforms?",
  "Anyone familiar with 'pipeline-less' AppSec tools",
  "I am looking for practitioners who have knowledge on government technology/government platforms. I.e.: GovOS, OpenGov, CivicPlus, Granicus, Clariti, Accela",
  "Looking for an expert / experience in Inflight Communications (IFC) / inflight Wi-Fi",
  "I'm looking for an SME with experience in networking, particularly in SD-WAN",
  "Looking for SMEs with student loan business/process/product experience. Not including roles where they were a borrower or payer",
  "Anyone has Cobol expertise and /or expertise with IBM mainframe?",
  "Does anyone have experience of working with Pharma Quality software - QMS systems and adjacencies such as Veeva, MasterControl, ZenQMS, BlueMountain, Valgenesis, for example",
  "I'm looking to identify an architect with strong frontend architecture experience with React for an engineering optimization assessment",
  "Anyone have strong data/AI understanding, and/or a background in physics and energy sector (particularly heating modules)?",
  "Anyone have experience with building B2C-type portals in HubSpot or with job/applicant/skills/ATS systems and the matchmaking domain and with the AI that's increasingly utilized in recruitment?",
  "Looking for people who have experience with CPQ and similar pricing tools",
  "Do we have an insurance SME, with market awareness of companies like Instanda, FaktorZehn, Sapiens, Guidewire, MSG",
  "Does anyone have experience with firms such as S-RM, Kroll and Control Risk - intelligence service firms",
  "Does anyone have experience within ecommerce enablement, specifically with the likes of Shopify and competitive platforms?",
  "Does anyone have particular experience within the real estate technology / residential block management technology?",
  "Show me the top experts with health tech experience",
  "Looking for anyone with Aviation software experience, specifically software used by the pilots of the planes.",
  "Which profiles have strong DevOps and AWS experience?",
  "Who has the most experience in wealth management tech?"
];

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#0066CC',
  color: 'white',
  borderRadius: '4px',
  padding: '12px 32px',
  fontSize: '16px',
  fontWeight: 400,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': {
    backgroundColor: '#004499',
    boxShadow: 'none',
  },
  '&:disabled': {
    backgroundColor: '#CCCCCC',
  },
}));

export default function InputScreen() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSamples, setShowSamples] = useState(false);
  const [practitionerStats, setPractitionerStats] = useState<{
    estimated_unique_practitioners: number;
    total_vectors: number;
  } | null>(null);
  // Streaming mode is now the default and only option
  
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch practitioner statistics on component mount
    const fetchStats = async () => {
      try {
        const stats = await matchingApi.getPractitionerStats();
        setPractitionerStats(stats);
      } catch (error) {
        console.error('Failed to fetch practitioner stats:', error);
      }
    };
    fetchStats();
  }, []);

  // Removed all mode change handlers as they are no longer needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate input
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Navigate to streaming results page (now the default and only method)
      navigate('/streaming-results', {
        state: {
          query: {
            query: query.trim(),
            limit: 10,
            include_explanations: true
          }
        }
      });
    } catch (err) {
      setError('Failed to process query. Please try again.');
      console.error('Query error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 3,
        backgroundColor: '#F5F5F7',
      }}>
        {/* Header Section - More Compact */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            component="img"
            src="/crosslake-logo-128x24-4x.webp"
            alt="Crosslake Logo"
            sx={{
              height: { xs: '32px', sm: '40px', md: '48px' },
              width: 'auto',
              mb: 3,
              display: 'block',
              mx: 'auto',
            }}
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 300,
              color: '#666666',
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              fontSize: { xs: '20px', sm: '24px', md: '28px' },
              lineHeight: 1.4,
            }}
          >
            Find the perfect consultant for your project with AI-powered matching
          </Typography>
          {practitionerStats && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<StorageIcon />}
                label={`${practitionerStats.estimated_unique_practitioners.toLocaleString()} practitioners`}
                variant="outlined"
                size="small"
                sx={{ 
                  fontWeight: 400,
                  borderColor: '#E0E0E0',
                  color: '#666666',
                  '& .MuiChip-icon': { color: '#0066CC' }
                }}
              />
              <Chip
                icon={<SmartToyIcon />}
                label="Enhanced with LinkedIn + AI"
                variant="filled"
                size="small"
                sx={{ 
                  fontWeight: 400,
                  backgroundColor: '#0066CC',
                  color: '#FFFFFF',
                  '& .MuiChip-icon': { color: '#FFFFFF' }
                }}
              />
            </Box>
          )}
        </Box>

        <StyledPaper elevation={0} sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {/* Compact Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SearchIcon sx={{ color: '#0066CC', mr: 1.5, fontSize: 28 }} />
              <Typography variant="h4" sx={{ fontWeight: 300, color: '#333333', fontSize: '24px' }}>
                What are you looking for?
              </Typography>
            </Box>

            {/* Free text search input */}
            <Box sx={{ mb: 3 }}>
              {/* Sample Questions - Moved here for better UX */}
              <Box sx={{ mb: 2 }}>
                <Button
                  startIcon={<LightbulbIcon />}
                  endIcon={showSamples ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setShowSamples(!showSamples)}
                  color="primary"
                  variant="text"
                  size="small"
                  sx={{ mb: 1 }}
                >
                  {showSamples ? 'Hide' : 'Show'} Sample Questions
                </Button>
                
                <Collapse in={showSamples}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      bgcolor: 'grey.50',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'grey.200',
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Click on any question to use it:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {sampleQuestions.slice(0, 8).map((question, index) => (
                        <Chip
                          key={index}
                          label={question}
                          onClick={() => setQuery(question)}
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ 
                            maxWidth: '100%',
                            height: 'auto',
                            whiteSpace: 'normal',
                            padding: '4px 8px',
                            '& .MuiChip-label': {
                              display: 'block',
                              whiteSpace: 'normal',
                              textAlign: 'left',
                              fontSize: '0.75rem',
                            },
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Collapse>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={5}
                variant="outlined"
                label="Enter your query"
                placeholder="Example: I need a COBOL expert with banking experience for a mainframe modernization project..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                error={!!error}
                helperText={error || 'Press Ctrl+Enter to search'}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />

            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
              <PrimaryButton
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
                {loading ? 'Searching...' : 'Find Practitioners'}
              </PrimaryButton>
              
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/practitioners')}
                sx={{
                  borderColor: '#0066CC',
                  color: '#0066CC',
                  borderRadius: '4px',
                  padding: '12px 32px',
                  fontSize: '16px',
                  fontWeight: 400,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#004499',
                    color: '#004499',
                    backgroundColor: 'rgba(0, 102, 204, 0.04)',
                  },
                }}
              >
                View All Practitioners
              </Button>
            </Box>
          </form>
        </StyledPaper>
      </Box>
    </Container>
  );
}