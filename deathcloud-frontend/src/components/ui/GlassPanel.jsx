import React from 'react';
import PropTypes from 'prop-types';

const GlassPanel = ({ children, className = '', active = false }) => {
  return (
    <div className={`glass-panel ${active ? 'glass-active' : ''} ${className}`}>
      {children}
    </div>
  );
};

GlassPanel.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  active: PropTypes.bool,
};

export default GlassPanel;
