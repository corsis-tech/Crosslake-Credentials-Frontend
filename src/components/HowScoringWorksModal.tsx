import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Paper,
  Stack,
  Chip,
  IconButton,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  Psychology as PsychologyIcon,
  Code as CodeIcon,
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface HowScoringWorksModalProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const Section = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const CodeBlock = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: '#f5f5f5',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  overflow: 'auto',
  maxHeight: 400,
  border: `1px solid ${theme.palette.divider}`,
}));

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scoring-tabpanel-${index}`}
      aria-labelledby={`scoring-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function HowScoringWorksModal({ open, onClose }: HowScoringWorksModalProps) {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <StyledDialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PsychologyIcon />
          <Typography variant="h6">How Scoring Works</Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'inherit' }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="scoring tabs">
          <Tab icon={<CalculateIcon />} label="Overview" />
          <Tab icon={<TimelineIcon />} label="Scoring Process" />
          <Tab icon={<CodeIcon />} label="Technical Details" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Section>
            <Typography variant="h6" gutterBottom>
              Two-Level Scoring System
            </Typography>
            <Typography variant="body2" paragraph>
              Our matching system uses a sophisticated two-level scoring approach to provide the most accurate practitioner recommendations:
            </Typography>
            
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  1. LinkedIn Profile Score (0-3 points)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on professional experience, skills, seniority level, and industry background from LinkedIn profiles.
                  This score reflects external professional credentials and experience.
                </Typography>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  2. Crosslake Project Score (0-3 points)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on internal project history, performance metrics, and successful deliveries at Crosslake.
                  This score reflects proven track record within the organization.
                </Typography>
              </Paper>
              
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'primary.50' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Combined Score (1-6 total)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Final score combines both components with a 90/10 weighting (90% LinkedIn, 10% Crosslake).
                  Practitioners are categorized as High (5-6), Medium (3-4), or Low (1-2) matches.
                </Typography>
              </Paper>
            </Stack>
          </Section>

          <Section>
            <Typography variant="h6" gutterBottom>
              Detailed Score Components
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Component</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Chip label="Skills Match" size="small" color="primary" />
                    </TableCell>
                    <TableCell>40%</TableCell>
                    <TableCell>Technical skills alignment with requirements</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Seniority Fit" size="small" color="secondary" />
                    </TableCell>
                    <TableCell>30%</TableCell>
                    <TableCell>Experience level appropriateness</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Project Fit" size="small" />
                    </TableCell>
                    <TableCell>20%</TableCell>
                    <TableCell>Relevance to project types</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <Chip label="Industry Match" size="small" />
                    </TableCell>
                    <TableCell>10%</TableCell>
                    <TableCell>Industry experience alignment</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Section>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Section>
            <Typography variant="h6" gutterBottom>
              AI-Powered Scoring Process
            </Typography>
            <Typography variant="body2" paragraph>
              Our system uses OpenAI's O3 AI model to analyze and score practitioners:
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info" icon={<PsychologyIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Step 1: Profile Analysis
                </Typography>
                <Typography variant="body2">
                  AI analyzes the practitioner's enriched profile data including skills, experience, project history, and specializations.
                </Typography>
              </Alert>
              
              <Alert severity="info" icon={<PsychologyIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Step 2: Requirement Matching
                </Typography>
                <Typography variant="body2">
                  The system compares profile attributes against search requirements, identifying specific skill matches and experience alignment.
                </Typography>
              </Alert>
              
              <Alert severity="info" icon={<PsychologyIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Step 3: Score Calculation
                </Typography>
                <Typography variant="body2">
                  Each component (skills, seniority, project fit, industry) is scored 0-100% with specific rationale for the score.
                </Typography>
              </Alert>
              
              <Alert severity="info" icon={<PsychologyIcon />}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Step 4: Final Scoring
                </Typography>
                <Typography variant="body2">
                  Scores are combined using our weighted formula to produce the final 1-6 score with detailed explanations.
                </Typography>
              </Alert>
            </Stack>
          </Section>

          <Section>
            <Typography variant="h6" gutterBottom>
              Scoring Factors
            </Typography>
            <Typography variant="body2" paragraph>
              The AI considers these specific factors when calculating scores:
            </Typography>
            
            <Box sx={{ pl: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                LinkedIn Experience (1-4 points max):
              </Typography>
              <ul>
                <li>+1: Strong domain expertise with matching skills</li>
                <li>+1: Strong industry context alignment</li>
                <li>+1: Recent relevant role experience</li>
                <li>+1: Multiple qualifying roles or positions</li>
              </ul>
              
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Crosslake Experience (1-3 points max):
              </Typography>
              <ul>
                <li>+2: 3+ relevant internal projects</li>
                <li>+1: Diverse project experience (avoiding overspecialization)</li>
              </ul>
            </Box>
          </Section>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Section>
            <Typography variant="h6" gutterBottom>
              AI Prompt Structure
            </Typography>
            <Typography variant="body2" paragraph>
              The system uses carefully crafted prompts to ensure consistent and accurate scoring:
            </Typography>
            
            <CodeBlock>
              <pre>{`Analyze technical competency alignment for a software project.

Project Requirements: [Extracted from search query]
Professional Profile:
- Core Skills: [List of skills with proficiency levels]
- Experience Level: [Senior/Lead/Principal etc.]
- Leadership Level: [Individual Contributor/Team Lead etc.]
- Project Types: [Types of projects good for]
- Industry Focus: [Industry experience]

Provide a comprehensive assessment in JSON format:
{
  "overall_score": 85.0,
  "skill_match_score": 90.0,
  "skill_match_rationale": "Explanation of skill score",
  "seniority_match_score": 80.0,
  "seniority_match_rationale": "Explanation of seniority score",
  "project_fit_score": 85.0,
  "project_fit_rationale": "Explanation of project fit",
  "industry_match_score": 75.0,
  "industry_match_rationale": "Explanation of industry match",
  "strengths": ["Key strengths"],
  "gaps": ["Potential gaps"],
  "perfect_match_criteria": ["What would make 100%"],
  "detailed_explanation": "Overall assessment",
  "scoring_methodology": "How scores are calculated"
}`}</pre>
            </CodeBlock>
          </Section>

          <Section>
            <Typography variant="h6" gutterBottom>
              Fallback Logic
            </Typography>
            <Typography variant="body2" paragraph>
              If the AI service is unavailable, the system uses rule-based scoring:
            </Typography>
            
            <ul>
              <li>Analyzes keyword matches between query and profile</li>
              <li>Compares seniority level requirements</li>
              <li>Evaluates project type alignment</li>
              <li>Checks industry experience overlap</li>
              <li>Provides transparent rationale for each score component</li>
            </ul>
          </Section>

          <Section>
            <Typography variant="h6" gutterBottom>
              Transparency Features
            </Typography>
            <Typography variant="body2" paragraph>
              Every score includes:
            </Typography>
            
            <Stack spacing={1}>
              <Chip label="Specific rationale for each component score" variant="outlined" size="small" />
              <Chip label="Clear explanation of strengths and gaps" variant="outlined" size="small" />
              <Chip label="Criteria for achieving a perfect match" variant="outlined" size="small" />
              <Chip label="Detailed overall assessment" variant="outlined" size="small" />
              <Chip label="Scoring methodology explanation" variant="outlined" size="small" />
            </Stack>
          </Section>
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}