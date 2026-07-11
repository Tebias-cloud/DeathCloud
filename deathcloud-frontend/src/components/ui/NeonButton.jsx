import React from 'react';
import PropTypes from 'prop-types';

const NeonButton = ({ children, onClick, className = '', type = 'button', variant = 'primary' }) => {
  const baseClasses = "neon-button px-8 py-3 rounded-md shadow-neon border border-[#00f3ff]/50 hover:bg-[#00f3ff]/10 focus:outline-none flex items-center justify-center gap-2 transition-all";
  const primaryClasses = variant === 'primary' ? 'bg-[#040812] text-[#00f3ff]' : 'bg-transparent text-white border-white/20 hover:border-white/50 hover:shadow-none hover:bg-white/10';

  return (
    <button
      type={type}
      className={`${baseClasses} ${primaryClasses} ${className}`}
      onClick={onClick}
    >
      <span className="relative z-10 neon-text">{children}</span>
    </button>
  );
};

NeonButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.string,
};

export default NeonButton;
