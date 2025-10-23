import React from 'react';
import {
  MapPin, Eye, Search, Languages, Calendar, HardDrive, Video, Mail, Cpu, X, Globe, Cog, Code, Megaphone, BarChartBig, LineChart, PencilLine, Share2, Rocket, PieChart, MonitorCheck
} from 'lucide-react'; // Corrected CpuChip to Cpu, added Cog, Code, Megaphone, and sub-agent icons

export const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <MapPin className={className} />
);

export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Eye className={className} />
);

export const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Search className={className} />
);

export const LanguagesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Languages className={className} />
);

export const CalendarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Calendar className={className} />
);

export const HardDriveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <HardDrive className={className} />
);

export const VideoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Video className={className} />
);

export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Mail className={className} />
);

export const CpuIcon: React.FC<{ className?: string }> = ({ className }) => ( // Renamed from CpuChipIcon
    <Cpu className={className} />
);

export const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <X className={className} />
);

export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <Globe className={className} />
);

export const CogIcon: React.FC<{ className?: string }> = ({ className }) => ( // Added CogIcon for settings
  <Cog className={className} />
);

export const CodeIcon: React.FC<{ className?: string }> = ({ className }) => ( // Added CodeIcon for Coding Agent
  <Code className={className} />
);

// New icons for Marketing Agent and its sub-agents
export const MegaphoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Megaphone className={className} />
);

export const BarChartBigIcon: React.FC<{ className?: string }> = ({ className }) => (
  <BarChartBig className={className} />
);

export const LineChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <LineChart className={className} />
);

export const PencilLineIcon: React.FC<{ className?: string }> = ({ className }) => (
  <PencilLine className={className} />
);

export const Share2Icon: React.FC<{ className?: string }> = ({ className }) => (
  <Share2 className={className} />
);

export const RocketIcon: React.FC<{ className?: string }> = ({ className }) => (
  <Rocket className={className} />
);

export const PieChartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <PieChart className={className} />
);

export const MonitorCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <MonitorCheck className={className} />
);