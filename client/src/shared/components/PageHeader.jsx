import React from "react";
import PropTypes from "prop-types";

/**
 * PageHeader — A standard header for module pages.
 * 
 * @param {string} title - Primary page title (supports text-gradient)
 * @param {string} subtitle - Secondary descriptive text
 * @param {string} className - Extra Tailwind classes for the container
 * @param {React.ReactNode} action - Optional action button or component in the header
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  className = "",
  action
}) => {
  return (
    <div className={`text-center space-y-4 mb-12 ${className}`}>
      <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
      {action && <div className="pt-4">{action}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  action: PropTypes.node,
};

export default PageHeader;
