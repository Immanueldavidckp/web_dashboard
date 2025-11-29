import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
  InputAdornment,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  GetApp as GetAppIcon,
  PictureAsPdf as PictureAsPdfIcon,
} from '@mui/icons-material';

// Mock Data
const mockInvoices = [
  {
    id: 'INV-001',
    customer: 'Customer A',
    device: 'Device 1',
    date: '2023-05-01',
    amount: 150.0,
    status: 'Paid',
    usage: '10 hours',
  },
  {
    id: 'INV-002',
    customer: 'Customer B',
    device: 'Device 2',
    date: '2023-05-05',
    amount: 200.0,
    status: 'Pending',
    usage: '15 hours',
  },
  {
    id: 'INV-003',
    customer: 'Customer A',
    device: 'Device 3',
    date: '2023-05-10',
    amount: 75.0,
    status: 'Paid',
    usage: '5 hours',
  },
  {
    id: 'INV-004',
    customer: 'Customer C',
    device: 'Device 1',
    date: '2023-05-12',
    amount: 300.0,
    status: 'Overdue',
    usage: '20 hours',
  },
  {
    id: 'INV-005',
    customer: 'Customer B',
    device: 'Device 4',
    date: '2023-05-18',
    amount: 120.0,
    status: 'Paid',
    usage: '8 hours',
  },
  {
    id: 'INV-006',
    customer: 'Customer D',
    device: 'Device 5',
    date: '2023-05-20',
    amount: 250.0,
    status: 'Pending',
    usage: '18 hours',
  },
  {
    id: 'INV-007',
    customer: 'Customer A',
    device: 'Device 2',
    date: '2023-05-25',
    amount: 180.0,
    status: 'Paid',
    usage: '12 hours',
  },
  {
    id: 'inv-005',
    customer: 'Customer E',
    date: '2023-05-15',
    amount: 2500,
    status: 'Paid',
  },
];

const headCells = [
  { id: 'id', label: 'Invoice ID' },
  { id: 'customer', label: 'Customer' },
  { id: 'device', label: 'Device' },
  { id: 'date', label: 'Date' },
  { id: 'amount', label: 'Amount' },
  { id: 'status', label: 'Status' },
  { id: 'usage', label: 'Usage' },
  { id: 'actions', label: 'Actions' },
];

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('date');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filter, setFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleOpenViewModal = (invoice) => {
    setSelectedInvoice(invoice);
    setViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleOpenMenu = (event, invoice) => {
    setAnchorEl(event.currentTarget);
    setSelectedInvoice(invoice);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedInvoice(null);
  };

  const handleOpenFilterMenu = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    handleCloseFilterMenu();
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesFilter =
        (invoice.id && invoice.id.toLowerCase().includes(filter.toLowerCase())) ||
        (invoice.customer && invoice.customer.toLowerCase().includes(filter.toLowerCase())) ||
        (invoice.device && invoice.device.toLowerCase().includes(filter.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
      return matchesFilter && matchesStatus;
    });
  }, [invoices, filter, statusFilter]);

  const sortedInvoices = useMemo(() => {
    return stableSort(filteredInvoices, getComparator(order, orderBy));
  }, [filteredInvoices, order, orderBy]);

  const paginatedInvoices = useMemo(() => {
    return sortedInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedInvoices, page, rowsPerPage]);

  const getStatusChip = (status) => {
    let color;
    switch (status) {
      case 'Paid':
        color = 'success';
        break;
      case 'Pending':
        color = 'warning';
        break;
      case 'Overdue':
        color = 'error';
        break;
      default:
        color = 'default';
    }
    return (
      <Box
        sx={{
          display: 'inline-block',
          px: 1.5,
          py: 0.5,
          borderRadius: '12px',
          color: `${color}.contrastText`,
          backgroundColor: `${color}.main`,
          fontSize: '0.875rem',
          fontWeight: '500',
        }}
      >
        {status}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Billing & Invoices
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Toolbar>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search invoices..."
            value={filter}
            onChange={handleFilterChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, mr: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<FilterListIcon />}
            onClick={handleOpenFilterMenu}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleCloseFilterMenu}
          >
            <MenuItem onClick={() => handleStatusFilterChange('All')}>All</MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('Paid')}>Paid</MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('Pending')}>Pending</MenuItem>
            <MenuItem onClick={() => handleStatusFilterChange('Overdue')}>Overdue</MenuItem>
          </Menu>
        </Toolbar>
        <TableContainer>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((headCell) => (
                    <TableCell
                      key={headCell.id}
                      sortDirection={orderBy === headCell.id ? order : false}
                    >
                      {headCell.id !== 'actions' ? (
                        <TableSortLabel
                          active={orderBy === headCell.id}
                          direction={orderBy === headCell.id ? order : 'asc'}
                          onClick={(e) => handleRequestSort(e, headCell.id)}
                        >
                          {headCell.label}
                        </TableSortLabel>
                      ) : (
                        headCell.label
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.device}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                    <TableCell>{getStatusChip(invoice.status)}</TableCell>
                    <TableCell>{invoice.usage}</TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleOpenMenu(e, invoice)}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedInvoice?.id === invoice.id}
                        onClose={handleCloseMenu}
                      >
                        <MenuItem onClick={() => handleOpenViewModal(invoice)}>
                          View Details
                        </MenuItem>
                        <MenuItem>
                          <GetAppIcon sx={{ mr: 1 }} />
                          Download CSV
                        </MenuItem>
                        <MenuItem>
                          <PictureAsPdfIcon sx={{ mr: 1 }} />
                          Download PDF
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* View Invoice Modal */}
      <Dialog open={isViewModalOpen} onClose={handleCloseViewModal} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Typography variant="h6">Invoice ID: {selectedInvoice.id}</Typography>
              <Typography>Customer: {selectedInvoice.customer}</Typography>
              <Typography>Device: {selectedInvoice.device}</Typography>
              <Typography>Date: {selectedInvoice.date}</Typography>
              <Typography>Amount: ${selectedInvoice.amount.toFixed(2)}</Typography>
              <Typography>Status: {getStatusChip(selectedInvoice.status)}</Typography>
              <Typography>Usage: {selectedInvoice.usage}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingPage;