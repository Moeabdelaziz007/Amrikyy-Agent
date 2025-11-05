import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { LanguageContext } from '../contexts/AppContexts';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Shield, Camera, QrCode, Edit, Save, X, Copy, Check,
  Globe, Linkedin, Github, Twitter, Award, CreditCard
} from 'lucide-react';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  dateOfBirth: string;
  occupation: string;
  company: string;
  bio: string;
  website: string;
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
  avatar: string;
  verificationLevel: 'basic' | 'verified' | 'premium';
}

const ProfileApp: React.FC = () => {
  const { lang } = useContext(LanguageContext);
  const { theme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Mock user profile data
  const [profile, setProfile] = useState<UserProfile>({
    id: 'USR-2024-8932',
    firstName: 'Ahmed',
    lastName: 'Mohamed',
    email: 'ahmed.mohamed@amrikyy.ai',
    phone: '+20 123 456 7890',
    location: 'Cairo, Egypt',
    dateOfBirth: '1995-05-15',
    occupation: 'AI Engineer',
    company: 'Amrikyy AI',
    bio: 'Passionate about AI and building intelligent systems. Love creating innovative solutions with Gemini Pro.',
    website: 'https://amrikyy.ai',
    social: {
      linkedin: 'ahmed-mohamed',
      github: 'ahmed-dev',
      twitter: '@ahmed_ai',
    },
    avatar: 'AM',
    verificationLevel: 'verified',
  });

  const [editProfile, setEditProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile(editProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getVerificationBadge = () => {
    switch (profile.verificationLevel) {
      case 'premium':
        return { color: 'text-yellow-400', label: lang === 'en' ? 'Premium' : 'مميز', icon: Award };
      case 'verified':
        return { color: 'text-blue-400', label: lang === 'en' ? 'Verified' : 'موثق', icon: Shield };
      default:
        return { color: 'text-gray-400', label: lang === 'en' ? 'Basic' : 'أساسي', icon: User };
    }
  };

  const badge = getVerificationBadge();

  const tabs = [
    { id: 'profile', label: lang === 'en' ? 'Profile' : 'الملف الشخصي', icon: User },
    { id: 'digital-id', label: lang === 'en' ? 'Digital ID' : 'الهوية الرقمية', icon: CreditCard },
  ];

  return (
    <div className="h-full flex flex-col bg-background text-text overflow-hidden">
      {/* Tabs */}
      <div className="border-b" style={{ borderColor: theme.colors.border }}>
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-text-secondary hover:text-text'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'profile' ? (
          <div className="max-w-4xl mx-auto p-6">
            {/* Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-8 rounded-2xl backdrop-blur-md border mb-6"
              style={{
                background: theme.colors.gradient,
                borderColor: theme.colors.border,
              }}
            >
              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <Edit size={18} />
                </button>
              )}

              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white backdrop-blur-md border-4 border-white/30">
                    {profile.avatar}
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:opacity-90 transition-opacity">
                    <Camera size={16} />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left text-white">
                  <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                    <h1 className="text-3xl font-bold">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <badge.icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <p className="text-white/80 mb-1">{profile.occupation} {lang === 'en' ? 'at' : 'في'} {profile.company}</p>
                  <p className="text-white/60 text-sm mb-3">{profile.location}</p>
                  <div className="flex gap-3 justify-center md:justify-start">
                    {profile.social.linkedin && (
                      <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Linkedin size={18} />
                      </a>
                    )}
                    {profile.social.github && (
                      <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Github size={18} />
                      </a>
                    )}
                    {profile.social.twitter && (
                      <a href="#" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                        <Twitter size={18} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Edit Mode Actions */}
            {isEditing && (
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save size={18} />
                  {lang === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                  {lang === 'en' ? 'Cancel' : 'إلغاء'}
                </button>
              </div>
            )}

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="p-6 rounded-xl backdrop-blur-md border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme.colors.border,
                }}
              >
                <h2 className="text-xl font-bold mb-4">{lang === 'en' ? 'Personal Information' : 'المعلومات الشخصية'}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Mail size={14} />
                      {lang === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{profile.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Phone size={14} />
                      {lang === 'en' ? 'Phone' : 'الهاتف'}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{profile.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <MapPin size={14} />
                      {lang === 'en' ? 'Location' : 'الموقع'}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editProfile.location}
                        onChange={(e) => setEditProfile({ ...editProfile, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{profile.location}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Calendar size={14} />
                      {lang === 'en' ? 'Date of Birth' : 'تاريخ الميلاد'}
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editProfile.dateOfBirth}
                        onChange={(e) => setEditProfile({ ...editProfile, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{new Date(profile.dateOfBirth).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Professional Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl backdrop-blur-md border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme.colors.border,
                }}
              >
                <h2 className="text-xl font-bold mb-4">{lang === 'en' ? 'Professional Information' : 'المعلومات المهنية'}</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Briefcase size={14} />
                      {lang === 'en' ? 'Occupation' : 'المهنة'}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editProfile.occupation}
                        onChange={(e) => setEditProfile({ ...editProfile, occupation: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{profile.occupation}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Briefcase size={14} />
                      {lang === 'en' ? 'Company' : 'الشركة'}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editProfile.company}
                        onChange={(e) => setEditProfile({ ...editProfile, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <p className="font-medium">{profile.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-1">
                      <Globe size={14} />
                      {lang === 'en' ? 'Website' : 'الموقع الإلكتروني'}
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editProfile.website}
                        onChange={(e) => setEditProfile({ ...editProfile, website: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-background border text-text"
                        style={{ borderColor: theme.colors.border }}
                      />
                    ) : (
                      <a href={profile.website} className="font-medium text-primary hover:underline">
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Bio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="md:col-span-2 p-6 rounded-xl backdrop-blur-md border"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: theme.colors.border,
                }}
              >
                <h2 className="text-xl font-bold mb-4">{lang === 'en' ? 'Bio' : 'نبذة'}</h2>
                {isEditing ? (
                  <textarea
                    value={editProfile.bio}
                    onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg bg-background border text-text resize-none"
                    style={{ borderColor: theme.colors.border }}
                  />
                ) : (
                  <p className="text-text-secondary">{profile.bio}</p>
                )}
              </motion.div>
            </div>
          </div>
        ) : (
          /* Digital ID Card */
          <div className="flex items-center justify-center p-6 min-h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              {/* ID Card */}
              <div
                className="relative p-8 rounded-3xl backdrop-blur-md border-2 shadow-2xl overflow-hidden"
                style={{
                  background: `${theme.colors.gradient}, url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="white" opacity="0.05"/></svg>')`,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                {/* Holographic Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>

                {/* Header */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-white" />
                      <span className="text-white font-bold text-sm">
                        {lang === 'en' ? 'DIGITAL ID' : 'الهوية الرقمية'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color} bg-white/20`}>
                      {badge.label.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-white/60 text-xs">AMRIKYY AI OPERATING SYSTEM</div>
                </div>

                {/* Avatar and Name */}
                <div className="relative flex items-center gap-4 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold text-white backdrop-blur-md border-2 border-white/30">
                    {profile.avatar}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-white/80 text-sm">{profile.occupation}</p>
                  </div>
                </div>

                {/* ID Details */}
                <div className="relative space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <CreditCard size={14} className="text-white/60" />
                    <span className="text-white/60 w-16">{lang === 'en' ? 'ID:' : 'الرقم:'}</span>
                    <span className="font-mono font-bold">{profile.id}</span>
                    <button
                      onClick={() => copyToClipboard(profile.id)}
                      className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Mail size={14} className="text-white/60" />
                    <span className="text-white/60 w-16">{lang === 'en' ? 'Email:' : 'بريد:'}</span>
                    <span className="truncate">{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <MapPin size={14} className="text-white/60" />
                    <span className="text-white/60 w-16">{lang === 'en' ? 'Location:' : 'موقع:'}</span>
                    <span>{profile.location}</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="relative flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                  <div>
                    <div className="text-white/60 text-xs mb-1">{lang === 'en' ? 'SCAN TO VERIFY' : 'امسح للتحقق'}</div>
                    <div className="text-white font-bold text-sm">{lang === 'en' ? 'Digital Identity' : 'الهوية الرقمية'}</div>
                  </div>
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
                    <QrCode size={64} className="text-gray-800" />
                  </div>
                </div>

                {/* Footer */}
                <div className="relative mt-6 pt-4 border-t border-white/20 text-center text-white/40 text-xs">
                  {lang === 'en' ? 'Issued by Amrikyy AI • Valid Indefinitely' : 'صادرة من Amrikyy AI • صالحة إلى أجل غير مسمى'}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileApp;
