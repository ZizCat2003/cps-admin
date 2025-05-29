import React from 'react';
import TablePagination from '@mui/material/TablePagination';

const TablePaginationDemo = ({
  count,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
}) => {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      labelRowsPerPage="Rows per page:"
      labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
      sx={{
        '& .MuiTablePagination-displayedRows': {
          textAlign: 'left',
          color: 'var(--primarySecond)',
          fontFamily: 'Noto Sans Lao, sans-serif',
        },
        '& .MuiTablePagination-actions button': {
          borderRadius: '6px',
          color: 'var(--primarySecond)',
        },
        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows, & .MuiTablePagination-actions': {
          color: 'var(--primarySecond)',
        },
        '& .MuiTablePagination-selectLabel.dark, & .MuiTablePagination-displayedRows.dark, & .MuiTablePagination-actions.dark': {
          color: 'white',
        },
      }}
      className="text-primarySecond dark:text-white"
    />
  );
};

export default TablePaginationDemo;
