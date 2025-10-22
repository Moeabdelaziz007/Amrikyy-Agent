import React from 'react';
import DocumentIcon from '../assets/icons/DocumentIcon';
import FolderIcon from '../assets/icons/FolderIcon';
import RobotIcon from '../assets/icons/RobotIcon';
import SettingsIcon from '../assets/icons/SettingsIcon';

interface IconMap {
  [key: string]: React.FC<React.SVGProps<SVGSVGElement>>;
}

const iconMap: IconMap = {
  document: DocumentIcon,
  folder: FolderIcon,
  robot: RobotIcon,
  settings: SettingsIcon,
};

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName];
};
