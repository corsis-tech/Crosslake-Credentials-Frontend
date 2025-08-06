import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Collapse,
  Alert,
  Divider,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  AccountTree as ProjectIcon,
  CheckCircle as ExplicitIcon,
  Lightbulb as InferredIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

interface StructuredExplanationProps {
  explanation: string;
}

interface ParsedExplanation {
  linkedInExplicit: string[];
  linkedInInferred: string[];
  linkedInScore: number;
  crosslakeExplicit: string[];
  crosslakeInferred: string[];
  crosslakeScore: number;
}

const StructuredExplanationV2: React.FC<StructuredExplanationProps> = ({ explanation }) => {
  const theme = useTheme();
  const [linkedInExpanded, setLinkedInExpanded] = React.useState(true);
  const [crosslakeExpanded, setCrosslakeExpanded] = React.useState(true);

  // Parse the explanation
  const parseExplanation = (text: string): ParsedExplanation => {
    const result: ParsedExplanation = {
      linkedInExplicit: [],
      linkedInInferred: [],
      linkedInScore: 0,
      crosslakeExplicit: [],
      crosslakeInferred: [],
      crosslakeScore: 0,
    };

    const sections = text.split('#').map(s => s.trim()).filter(s => s);
    
    sections.forEach(section => {
      const lines = section.split('\n').map(line => line.trim()).filter(line => line);
      const sectionTitle = lines[0];
      
      if (sectionTitle.includes('Explicit LinkedIn Matches:')) {
        result.linkedInExplicit = lines.slice(1)
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim())
          .filter(line => !line.includes('[') && line !== 'No explicit matches found');
      } else if (sectionTitle.includes('Inferred LinkedIn Matches:')) {
        result.linkedInInferred = lines.slice(1)
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim())
          .filter(line => !line.includes('['));
      } else if (sectionTitle.includes('LinkedIn Relevance Score:')) {
        const scoreLine = lines.find(line => /\d+/.test(line));
        if (scoreLine) {
          const match = scoreLine.match(/(\d+)/);
          result.linkedInScore = match ? parseInt(match[1]) : 0;
        }
      } else if (sectionTitle.includes('Explicit Crosslake Matches:')) {
        result.crosslakeExplicit = lines.slice(1)
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim())
          .filter(line => !line.includes('[') && line !== 'No explicit Crosslake matches found');
      } else if (sectionTitle.includes('Inferred Crosslake Matches:')) {
        result.crosslakeInferred = lines.slice(1)
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim())
          .filter(line => !line.includes('['));
      } else if (sectionTitle.includes('Crosslake History Score:')) {
        const scoreLine = lines.find(line => /\d+/.test(line));
        if (scoreLine) {
          const match = scoreLine.match(/(\d+)/);
          result.crosslakeScore = match ? parseInt(match[1]) : 0;
        }
      }
    });

    return result;
  };

  const parsed = parseExplanation(explanation);
  const combinedScore = Math.round((parsed.linkedInScore + parsed.crosslakeScore) / 2);

  const getScoreColor = (score: number) => {
    if (score >= 8) return theme.palette.success.main;
    if (score >= 5) return theme.palette.warning.main;
    return theme.palette.text.secondary;
  };

  const getMatchQuality = (score: number) => {
    if (score >= 8) return 'Excellent Match';
    if (score >= 5) return 'Good Match';
    return 'Fair Match';
  };

  // Section component for LinkedIn/Crosslake
  const MatchSection = ({
    title,
    icon,
    score,
    explicit,
    inferred,
    expanded,
    onToggle,
  }: {
    title: string;
    icon: React.ReactNode;
    score: number;
    explicit: string[];
    inferred: string[];
    expanded: boolean;
    onToggle: () => void;
  }) => (
    <Box sx={{ mb: 3 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {icon}
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600 }}>
            {title}
          </Typography>
          <Chip
            label={`${score}/10`}
            size="small"
            sx={{
              backgroundColor: alpha(getScoreColor(score), 0.1),
              color: getScoreColor(score),
              fontWeight: 600,
            }}
          />
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Section Content */}
      <Collapse in={expanded}>
        <Stack spacing={2}>
          {/* Explicit Matches */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ExplicitIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Direct Matches
              </Typography>
              {explicit.length === 0 && (
                <Chip label="None found" size="small" variant="outlined" />
              )}
            </Box>
            {explicit.length > 0 ? (
              <Stack spacing={1} sx={{ ml: 3.5 }}>
                {explicit.map((match, idx) => (
                  <Typography key={idx} variant="body2" sx={{ color: theme.palette.text.primary }}>
                    • {match}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                No direct keyword matches found
              </Typography>
            )}
          </Box>

          {/* Inferred Matches */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <InferredIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Inferred Experience
              </Typography>
              <Tooltip title="Related experience that suggests relevant expertise">
                <InfoIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
              </Tooltip>
              {inferred.length === 0 && (
                <Chip label="None found" size="small" variant="outlined" />
              )}
            </Box>
            {inferred.length > 0 ? (
              <Stack spacing={1} sx={{ ml: 3.5 }}>
                {inferred.map((match, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      • {match}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 3.5 }}>
                No inferred matches identified
              </Typography>
            )}
          </Box>
        </Stack>
      </Collapse>
    </Box>
  );

  // Empty state
  if (!explanation) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        No match analysis available
      </Alert>
    );
  }

  // Loading state (would be used if data is being fetched)
  // if (loading) {
  //   return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />;
  // }

  return (
    <Box>

      {/* LinkedIn Section */}
      <MatchSection
        title="LinkedIn Work History"
        icon={<LinkedInIcon sx={{ color: '#0e76a8', fontSize: 24 }} />}
        score={parsed.linkedInScore}
        explicit={parsed.linkedInExplicit}
        inferred={parsed.linkedInInferred}
        expanded={linkedInExpanded}
        onToggle={() => setLinkedInExpanded(!linkedInExpanded)}
      />

      {/* Crosslake Section */}
      <MatchSection
        title="Crosslake Project History"
        icon={<ProjectIcon sx={{ color: theme.palette.secondary.main, fontSize: 24 }} />}
        score={parsed.crosslakeScore}
        explicit={parsed.crosslakeExplicit}
        inferred={parsed.crosslakeInferred}
        expanded={crosslakeExpanded}
        onToggle={() => setCrosslakeExpanded(!crosslakeExpanded)}
      />
    </Box>
  );
};

export default StructuredExplanationV2;