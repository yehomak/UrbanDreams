// src/components/ExpandableMenu.tsx
import React, { useState, useRef, useEffect } from 'react';

interface MenuItem {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

interface ExpandableMenuProps {
  items: MenuItem[];
  className?: string;
}

export const ExpandableMenu: React.FC<ExpandableMenuProps> = ({ 
  items, 
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuItemClick = (item: MenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className={`menu-button-container ${className}`} ref={menuRef}>
      <button
        className={`menu-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="More options"
        aria-expanded={isOpen}
      >
        ⋯
      </button>
      
      <div className={`menu-expandable ${isOpen ? 'active' : ''}`}>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <button
              className="menu-item"
              onClick={() => handleMenuItemClick(item)}
              disabled={item.disabled}
            >
              <span className="icon">{item.icon}</span>
              <span className="label">{item.label}</span>
            </button>
            {index < items.length - 1 && <div className="menu-divider" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};