import React from 'react';
import { Box, Typography, Chip, Stack, Tooltip, Paper, Alert } from '@mui/material';
import { 
  CheckCircle as ExplicitIcon, 
  Lightbulb as InferredIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material';

interface MatchEvidenceProps {
  explanation: string;
}

interface ParsedExplanation {
  explicitLinkedIn: string[];
  inferredLinkedIn: string[];
  linkedInScore: string;
  explicitCrosslake: string[];
  inferredCrosslake: string[];
  crosslakeScore: string;
}

export const MatchEvidenceDisplay: React.FC<MatchEvidenceProps> = ({ explanation }) => {
  // Debug logging
  console.log('MatchEvidenceDisplay received explanation:', explanation);
  console.log('Explanation type:', typeof explanation);
  console.log('Explanation length:', explanation ? explanation.length : 0);
  
  // Handle empty or invalid explanation
  if (!explanation || typeof explanation !== 'string' || explanation.trim().length === 0) {
    console.warn('MatchEvidenceDisplay: No valid explanation provided');
    return (
      <Alert severity="warning">
        <Typography variant="body2">
          Match analysis information is not available. The AI service may be experiencing issues or the explanation format is invalid.
        </Typography>
      </Alert>
    );
  }
  
  // Parse the structured explanation
  const parseExplanation = (text: string): ParsedExplanation => {
    const result: ParsedExplanation = {
      explicitLinkedIn: [],
      inferredLinkedIn: [],
      linkedInScore: '',
      explicitCrosslake: [],
      inferredCrosslake: [],
      crosslakeScore: ''
    };

    // More robust parsing that handles variations in formatting
    // First try to split by # for sections
    let sections = text.split('#').map(s => s.trim()).filter(s => s);
    
    // If no # sections found, try splitting by newline patterns
    if (sections.length <= 1) {
      console.log('No # sections found, trying alternative parsing');
      sections = text.split(/\n(?=[A-Z])/).map(s => s.trim()).filter(s => s);
    }
    
    console.log('Found sections:', sections.length);
    
    sections.forEach((section, idx) => {
      console.log(`Processing section ${idx}:`, section.substring(0, 50) + '...');
      
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      const sectionTitle = lines[0].toLowerCase();
      
      // More flexible matching for section titles
      if (sectionTitle.includes('explicit') && sectionTitle.includes('linkedin')) {
        result.explicitLinkedIn = lines.slice(1)
          .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => !line.includes('[') && !line.toLowerCase().includes('no explicit matches'));
      } else if (sectionTitle.includes('inferred') && sectionTitle.includes('linkedin')) {
        result.inferredLinkedIn = lines.slice(1)
          .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => !line.includes('[') && !line.toLowerCase().includes('no inferred matches'));
      } else if (sectionTitle.includes('linkedin') && (sectionTitle.includes('score') || sectionTitle.includes('relevance'))) {
        // Look for a number in the section
        const scoreMatch = section.match(/\b(\d+)\b/);
        if (scoreMatch) {
          result.linkedInScore = scoreMatch[1];
        }
      } else if (sectionTitle.includes('explicit') && sectionTitle.includes('crosslake')) {
        result.explicitCrosslake = lines.slice(1)
          .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => !line.includes('[') && !line.toLowerCase().includes('no explicit'));
      } else if (sectionTitle.includes('inferred') && sectionTitle.includes('crosslake')) {
        result.inferredCrosslake = lines.slice(1)
          .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => !line.includes('[') && !line.toLowerCase().includes('no inferred'));
      } else if (sectionTitle.includes('crosslake') && (sectionTitle.includes('score') || sectionTitle.includes('history'))) {
        // Look for a number in the section
        const scoreMatch = section.match(/\b(\d+)\b/);
        if (scoreMatch) {
          result.crosslakeScore = scoreMatch[1];
        }
      }
    });

    return result;
  };

  const parsed = parseExplanation(explanation);
  
  // Debug logging
  console.log('MatchEvidenceDisplay parsed result:', parsed);
  console.log('Parsed LinkedIn explicit matches:', parsed.explicitLinkedIn);
  console.log('Parsed LinkedIn inferred matches:', parsed.inferredLinkedIn);
  console.log('Parsed Crosslake explicit matches:', parsed.explicitCrosslake);
  console.log('Parsed Crosslake inferred matches:', parsed.inferredCrosslake);
  
  const hasLinkedInMatches = parsed.explicitLinkedIn.length > 0 || parsed.inferredLinkedIn.length > 0;
  const hasCrosslakeMatches = parsed.explicitCrosslake.length > 0 || parsed.inferredCrosslake.length > 0;
  
  // If no matches were parsed, show the raw explanation
  if (!hasLinkedInMatches && !hasCrosslakeMatches && !parsed.linkedInScore && !parsed.crosslakeScore) {
    console.warn('No structured data could be parsed from explanation. Showing raw text.');
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            Match Analysis (Raw Format)
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {explanation}
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* LinkedIn Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            color: '#0e76a8'
          }}
        >
          <WorkIcon sx={{ mr: 1 }} />
          LinkedIn Experience Analysis
          {parsed.linkedInScore && (
            <Chip 
              label={`Score: ${parsed.linkedInScore}/10`}
              size="small"
              color="primary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>

        {/* Explicit LinkedIn Matches */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 1.5, 
              display: 'flex', 
              alignItems: 'center',
              color: '#2e7d32' 
            }}
          >
            <ExplicitIcon sx={{ mr: 1, fontSize: 20 }} />
            Direct Matches
            <Tooltip title="Exact keyword matches found in the practitioner's profile">
              <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: '#999' }} />
            </Tooltip>
          </Typography>
          
          {parsed.explicitLinkedIn.length > 0 ? (
            <Stack spacing={1}>
              {parsed.explicitLinkedIn.map((match, idx) => (
                <Paper
                  key={idx} 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #4caf50',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <ExplicitIcon 
                      sx={{ 
                        color: '#4caf50', 
                        fontSize: 18, 
                        mr: 1, 
                        mt: 0.2 
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {match}
                    </Typography>
                    <Chip 
                      label="Verified" 
                      size="small" 
                      color="success" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: '#f5f5f5' }}>
              No direct keyword matches found in LinkedIn profile
            </Alert>
          )}
        </Box>

        {/* Inferred LinkedIn Matches */}
        <Box>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              mb: 1.5, 
              display: 'flex', 
              alignItems: 'center',
              color: '#1976d2'
            }}
          >
            <InferredIcon sx={{ mr: 1, fontSize: 20 }} />
            Inferred Experience
            <Tooltip title="Related experience that suggests relevant expertise">
              <InfoIcon sx={{ ml: 0.5, fontSize: 16, color: '#999' }} />
            </Tooltip>
          </Typography>
          
          {parsed.inferredLinkedIn.length > 0 ? (
            <Stack spacing={1}>
              {parsed.inferredLinkedIn.map((match, idx) => (
                <Paper
                  key={idx} 
                  elevation={0}
                  sx={{ 
                    p: 2,
                    backgroundColor: '#e3f2fd',
                    border: '1px dashed #2196f3',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InferredIcon 
                      sx={{ 
                        color: '#2196f3', 
                        fontSize: 18, 
                        mr: 1, 
                        mt: 0.2 
                      }} 
                    />
                    <Typography variant="body2" sx={{ flex: 1, fontStyle: 'italic' }}>
                      {match}
                    </Typography>
                    <Chip 
                      label="Inferred" 
                      size="small" 
                      color="info" 
                      variant="outlined"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Alert severity="info" sx={{ backgroundColor: '#f5f5f5' }}>
              No inferred matches identified
            </Alert>
          )}
        </Box>
      </Box>

      {/* Crosslake Section */}
      <Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            color: '#f57c00'
          }}
        >
          <BusinessIcon sx={{ mr: 1 }} />
          Crosslake Project History
          {parsed.crosslakeScore && (
            <Chip 
              label={`Score: ${parsed.crosslakeScore}/10`}
              size="small"
              color="secondary"
              sx={{ ml: 2 }}
            />
          )}
        </Typography>

        {hasCrosslakeMatches ? (
          <>
            {/* Explicit Crosslake Matches */}
            {parsed.explicitCrosslake.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ fontWeight: 600, mb: 1, color: '#2e7d32' }}
                >
                  Direct Project Matches
                </Typography>
                <Stack spacing={1}>
                  {parsed.explicitCrosslake.map((match, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{ 
                        p: 1.5,
                        backgroundColor: '#fff3e0',
                        border: '1px solid #ff9800',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2">
                        • {match}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Inferred Crosslake Matches */}
            {parsed.inferredCrosslake.length > 0 && (
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ fontWeight: 600, mb: 1, color: '#1976d2' }}
                >
                  Related Project Experience
                </Typography>
                <Stack spacing={1}>
                  {parsed.inferredCrosslake.map((match, idx) => (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{ 
                        p: 1.5,
                        backgroundColor: '#fce4ec',
                        border: '1px dashed #e91e63',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                        • {match}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ backgroundColor: '#f5f5f5' }}>
            No Crosslake project history available
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default MatchEvidenceDisplay;