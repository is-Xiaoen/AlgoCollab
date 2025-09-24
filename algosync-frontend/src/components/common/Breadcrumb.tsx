import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="面包屑导航">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg 
              className="w-4 h-4 mx-2 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 5l7 7-7 7" 
              />
            </svg>
          )}
          
          {item.href && !item.active ? (
            <Link 
              to={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span 
              className={`${
                item.active 
                  ? 'text-gray-900 font-medium' 
                  : 'text-gray-500'
              }`}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;