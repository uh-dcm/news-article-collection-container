import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

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
  <Tooltip.Root>
    <Tooltip.Trigger asChild>
      <span 
        className="inline-flex items-center justify-center w-3.5 h-3.5 bg-muted text-muted-foreground rounded-full text-[10px] leading-none cursor-help ml-1 align-[0.1em] relative"
        style={{ top: verticalOffset }}
        aria-label={ariaLabel}
      >
        ?
      </span>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        className="bg-popover text-popover-foreground px-3 py-1.5 rounded-md text-sm shadow-md z-50"
        sideOffset={5}
      >
        {tooltipContent}
        <Tooltip.Arrow className="fill-popover" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);

export default InfoIcon;
