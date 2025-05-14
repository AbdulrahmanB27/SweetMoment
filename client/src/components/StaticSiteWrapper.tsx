/**
 * StaticSiteWrapper Component
 * 
 * This component conditionally renders content based on whether we're in static site mode.
 * It allows for:
 * 1. Completely different content in static vs. dynamic modes
 * 2. Optional hiding of specific functionality in static mode
 * 3. Providing fallback content when necessary
 */

import React, { ReactNode } from 'react';
import { useStaticData } from '@/context/StaticDataContext';

interface StaticSiteWrapperProps {
  /**
   * Content to render in dynamic mode (or both modes if staticContent is not provided)
   */
  children: ReactNode;
  
  /**
   * Optional content to render only in static mode
   */
  staticContent?: ReactNode;
  
  /**
   * If true, children will not be rendered in static mode (used for features that should be disabled)
   */
  hideInStaticMode?: boolean;
  
  /**
   * Optional content to render in static mode when hideInStaticMode is true
   */
  fallback?: ReactNode;
  
  /**
   * Optional features list that this component requires (for documentation purposes)
   */
  requiredFeatures?: string[];
}

/**
 * A component that conditionally renders content based on static/dynamic mode
 */
const StaticSiteWrapper: React.FC<StaticSiteWrapperProps> = ({
  children,
  staticContent,
  hideInStaticMode = false,
  fallback,
  requiredFeatures,
}) => {
  // Get the static mode flag from context
  const { isStatic } = useStaticData();
  
  // If not in static mode, always render children
  if (!isStatic) {
    return <>{children}</>;
  }
  
  // In static mode with specific static content
  if (staticContent !== undefined) {
    return <>{staticContent}</>;
  }
  
  // In static mode, but this component should be hidden
  if (hideInStaticMode) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // Default case: render children in static mode too
  return <>{children}</>;
};

/**
 * A component that only renders in dynamic mode
 */
export const DynamicOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({
  children,
  fallback,
}) => {
  return (
    <StaticSiteWrapper hideInStaticMode fallback={fallback}>
      {children}
    </StaticSiteWrapper>
  );
};

/**
 * A component that only renders in static mode
 */
export const StaticOnly: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isStatic } = useStaticData();
  
  if (isStatic) {
    return <>{children}</>;
  }
  
  return null;
};

export default StaticSiteWrapper;