import React from 'react';

interface InfoIconProps {
  tooltipContent: string;
  ariaLabel: string;
  verticalOffset?: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ 
  tooltipContent, 
  ariaLabel, 
  verticalOffset = '-0.1em'
}) => (
  <span 
    className={`inline-flex items-center justify-center w-3.5 h-3.5 bg-gray-400 text-white rounded-full text-[10px] leading-none cursor-help ml-1 align-[0.1em] relative`}
    style={{ top: verticalOffset }}
    data-tooltip-id="react-tooltip"
    data-tooltip-content={tooltipContent}
    aria-label={ariaLabel}
  >
    ?
  </span>
);

export default InfoIcon;
