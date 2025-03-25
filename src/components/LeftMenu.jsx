// LeftMenu.jsx - Avec ajustements
import React, { useState } from 'react';
import { 
  Newspaper, 
  Thermometer, 
  Wind, 
  ActivitySquare, 
  Users, 
  Lightbulb, 
  UtensilsCrossed, 
  Settings, 
  Globe,
  Cloud,
  Layers, 
  RotateCw,
  X,
  DollarSign,
  Satellite,
  PlaneIcon,
  CrownIcon
} from 'lucide-react';
import './LeftMenu.css';

const LeftMenu = () => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMenuHovered, setIsMenuHovered] = useState(false);

  const menuItems = [
    {
      id: 'news',
      icon: <Newspaper size={24} />,
      label: 'News Topics',
      subMenu: [
        { id: 'politics', label: 'Politics' },
        { id: 'science', label: 'Science' },
        { id: 'technology', label: 'Technology' },
        { id: 'environment', label: 'Environment' }
      ]
    },
    {
      id: 'weather',
      icon: <Thermometer size={24} />,
      label: 'Earth Weather',
      subMenu: [
        { id: 'temperature', label: 'Temperature', icon: <Thermometer size={18} /> },
        { id: 'wind', label: 'Wind Patterns', icon: <Wind size={18} /> },
        { id: 'earthquakes', label: 'Earthquakes', icon: <ActivitySquare size={18} /> }
      ]
    },
    {
      id: 'community',
      icon: <Lightbulb size={24} />,
      label: 'Community',
      subMenu: [
        { id: 'ideas', label: 'Ideas Exchange', icon: <Users size={18} /> },
        { id: 'recipes', label: 'Recipes', icon: <UtensilsCrossed size={18} /> },
        { id: 'holidays', label: 'Holidays', icon: <PlaneIcon size={18} /> },
        { id: 'discussions', label: 'Discussions', icon: <Users size={18} /> }
      ]
    },
    {
      id: 'layer',
      icon: <Layers size={24} />,
      label: 'Layers',
      subMenu: [
        { id: 'texture', label: 'Satellite Texture', icon: <Satellite size={18} /> },
        { id: 'cloud', label: 'Cloud', icon: <Cloud size={18} /> },
        { id: 'simple', label: 'Simple', icon: <Globe size={18} /> }
      ]
    },
    {
      id: 'config',
      icon: <Settings size={24} />,
      label: 'Configuration',
      subMenu: [
        { id: 'rotation', label: 'Rotation Speed', icon: <RotateCw size={18} /> },
        { id: 'premium', label: 'Globnuz premium', icon: <CrownIcon size={18} /> }
      ]
    }
  ];

  const handleMenuClick = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  const closeSubMenu = () => {
    setActiveMenu(null);
  };

  return (
    <div className="left-menu-container">
      <div 
        className={`left-menu ${isMenuHovered ? 'expanded' : ''}`}
        onMouseEnter={() => setIsMenuHovered(true)}
        onMouseLeave={() => setIsMenuHovered(false)}
      >
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className={`menu-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
          >
            <div className="icon-container">
              {item.icon}
            </div>
            <div className={`label ${isMenuHovered ? 'visible' : ''}`}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {activeMenu && (
        <div className="sub-menu">
          <div className="sub-menu-header">
            <span>{menuItems.find(item => item.id === activeMenu)?.label}</span>
            <button className="close-button" onClick={closeSubMenu}>
              <X size={20} />
            </button>
          </div>
          <div className="sub-menu-items">
            {menuItems
              .find(item => item.id === activeMenu)
              ?.subMenu.map(subItem => (
                <div key={subItem.id} className="sub-menu-item">
                  {subItem.icon && <span className="sub-menu-icon">{subItem.icon}</span>}
                  <span>{subItem.label}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftMenu;