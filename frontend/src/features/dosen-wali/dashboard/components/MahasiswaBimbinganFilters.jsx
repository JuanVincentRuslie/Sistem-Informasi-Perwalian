import SearchIcon from '@mui/icons-material/Search';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { STATUS_FILTERS } from './statusConfig.js';

function MahasiswaBimbinganFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        mb: 2,
      }}
    >
      <TextField
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        placeholder="Cari nama atau NIM"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ minWidth: { md: 320 } }}
      />

      <ToggleButtonGroup
        exclusive
        size="small"
        value={statusFilter}
        onChange={(_event, nextValue) => {
          if (nextValue) onStatusFilterChange(nextValue);
        }}
        aria-label="Filter status rencana studi"
      >
        {STATUS_FILTERS.map((filter) => (
          <ToggleButton key={filter.value} value={filter.value}>
            {filter.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}

export default MahasiswaBimbinganFilters;
