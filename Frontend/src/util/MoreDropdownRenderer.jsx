import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

const MoreDropdownRenderer = (props) => {
  const [hiddenColumns, setHiddenColumns] = useState([]);

  const updateHiddenColumns = () => {
    const hidden = props.columnApi
      .getAllColumns()
      .filter((col) => !col.isVisible() && col.getColId() !== 'more');
    setHiddenColumns(hidden);
  };

  useEffect(() => {
    updateHiddenColumns();
    // Listen for column visibility changes
    props.api.addEventListener('columnVisible', updateHiddenColumns);
    return () => {
      props.api.removeEventListener('columnVisible', updateHiddenColumns);
    };
  }, [props.api, props.columnApi]);

  const handleShowColumn = (col) => {
    console.log(`Showing column: ${col.getColDef().headerName}`);
    props.columnApi.setColumnVisible(col.getColId(), true);
    // Refresh the "More" column to update the dropdown list
    props.api.refreshCells({ columns: ['more'] });
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="secondary" size="sm">
        More
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {hiddenColumns.length === 0 ? (
          <Dropdown.Item disabled>No more columns</Dropdown.Item>
        ) : (
          hiddenColumns.map((col) => (
            <Dropdown.Item key={col.getColId()} onClick={() => handleShowColumn(col)}>
              {col.getColDef().headerName}
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default MoreDropdownRenderer;
