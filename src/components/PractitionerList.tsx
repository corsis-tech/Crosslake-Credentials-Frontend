import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Typography,
  Link,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import { Info as InfoIcon, Check as CheckIcon, Close as CloseIcon, LinkedIn, Search as SearchIcon } from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
import { useNavigate } from 'react-router-dom';

interface PractitionerListItem {
  practitioner_id: string;
  name: string;
  email?: string;
  linkedin_url?: string;
  location?: string;
  headline?: string;
  crosslake_projects_count: number;
  linkedin_data_char_count: number;
  indexed_in_pinecone: boolean;
  has_linkedin_data: boolean;
  has_enrichment_data: boolean;
  seniority_level?: string;
}

type Order = 'asc' | 'desc';

interface HeadCell {
  id: keyof PractitionerListItem | 'actions';
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'name', numeric: false, label: 'Name', sortable: true },
  { id: 'location', numeric: false, label: 'Location', sortable: true },
  { id: 'headline', numeric: false, label: 'Headline', sortable: false },
  { id: 'crosslake_projects_count', numeric: true, label: 'Projects', sortable: true },
  { id: 'linkedin_data_char_count', numeric: true, label: 'LinkedIn Data', sortable: true },
  { id: 'indexed_in_pinecone', numeric: false, label: 'Indexed', sortable: true },
  { id: 'has_linkedin_data', numeric: false, label: 'Data Sources', sortable: true },
  { id: 'actions', numeric: false, label: 'Actions', sortable: false },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  
  if (aValue === undefined || aValue === null) return 1;
  if (bValue === undefined || bValue === null) return -1;
  
  if (bValue < aValue) {
    return -1;
  }
  if (bValue > aValue) {
    return 1;
  }
  return 0;
}

function getComparator(
  order: Order,
  orderBy: keyof PractitionerListItem,
): (
  a: PractitionerListItem,
  b: PractitionerListItem,
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const PractitionerList: React.FC = () => {
  const navigate = useNavigate();
  const [practitioners, setPractitioners] = useState<PractitionerListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof PractitionerListItem>('name');

  useEffect(() => {
    fetchPractitioners();
  }, []);

  const fetchPractitioners = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all practitioners (no pagination)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/practitioners-comprehensive?limit=1000`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch practitioners: ${response.statusText}`);
      }

      const data: PractitionerListItem[] = await response.json();
      setPractitioners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load practitioners');
      console.error('Error fetching practitioners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (property: keyof PractitionerListItem) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleRowClick = (practitionerId: string) => {
    navigate(`/practitioner/${practitionerId}`);
  };

  const sortedPractitioners = useMemo(
    () => [...practitioners].sort(getComparator(order, orderBy)),
    [order, orderBy, practitioners]
  );

  const formatCharCount = (count: number): string => {
    if (count === 0) return '0';
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  if (loading && practitioners.length === 0) {
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
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          All Practitioners ({practitioners.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/')}
        >
          Back to Search
        </Button>
      </Box>
      
      <Paper sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader size="small" sx={{ minWidth: 750 }} aria-label="practitioners table">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    key={headCell.id}
                    align={headCell.numeric ? 'right' : 'left'}
                    sortDirection={orderBy === headCell.id ? order : false}
                    sx={{ fontWeight: 600, backgroundColor: 'background.paper' }}
                  >
                    {headCell.sortable ? (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id as keyof PractitionerListItem)}
                      >
                        {headCell.label}
                        {orderBy === headCell.id ? (
                          <Box component="span" sx={visuallyHidden}>
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </Box>
                        ) : null}
                      </TableSortLabel>
                    ) : (
                      headCell.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedPractitioners.map((practitioner) => (
                <TableRow
                  key={practitioner.practitioner_id}
                  hover
                  onClick={() => handleRowClick(practitioner.practitioner_id)}
                  sx={{ cursor: 'pointer', '& .MuiTableCell-root': { py: 0.5 } }}
                >
                  <TableCell component="th" scope="row">
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {practitioner.name || 'Unknown'}
                      </Typography>
                      {practitioner.email && (
                        <Typography variant="caption" color="text.secondary">
                          {practitioner.email}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap>
                      {practitioner.location || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      maxWidth: 300,
                    }}>
                      {practitioner.headline || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={practitioner.crosslake_projects_count > 0 ? 500 : 400}>
                      {practitioner.crosslake_projects_count}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={practitioner.linkedin_data_char_count > 0 ? 500 : 400}>
                      {formatCharCount(practitioner.linkedin_data_char_count)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ px: 1 }}>
                    {practitioner.indexed_in_pinecone ? (
                      <CheckIcon color="success" sx={{ fontSize: 18 }} />
                    ) : (
                      <CloseIcon color="error" sx={{ fontSize: 18 }} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.25, justifyContent: 'center' }}>
                      {practitioner.has_linkedin_data && (
                        <Chip label="L" size="small" color="info" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                      {practitioner.has_enrichment_data && (
                        <Chip label="E" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()} sx={{ px: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0, justifyContent: 'center' }}>
                      <Tooltip title="View all data">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/practitioner/${practitioner.practitioner_id}/all-data`, '_blank');
                          }}
                          sx={{ p: 0.5 }}
                        >
                          <InfoIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      {practitioner.linkedin_url && (
                        <Tooltip title="View LinkedIn profile">
                          <IconButton
                            size="small"
                            component={Link}
                            href={practitioner.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            sx={{ p: 0.5 }}
                          >
                            <LinkedIn sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default PractitionerList;