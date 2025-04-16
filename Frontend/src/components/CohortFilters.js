import React from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import Button from 'react-bootstrap/esm/Button';
const AncestryFilter = ({ selectedAncestry, onAncestryChange }) => {
    const ancestries = ['EUR', 'AFR', 'META', 'AGR'];
  
    return (
      <div className="mb-3">
        {ancestries.map((ancestry) => (
          <Button
            key={ancestry}
            variant={selectedAncestry === ancestry ? "primary" : "outline-primary"}
            onClick={() => onAncestryChange(ancestry)}
            className="me-2"
          >
            {ancestry}
          </Button>
        ))}
      </div>
    );
  };

export default AncestryFilter;