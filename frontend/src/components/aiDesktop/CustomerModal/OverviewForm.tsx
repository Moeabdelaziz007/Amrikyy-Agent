import { useState } from 'react';
import type { OverviewFormData } from '../../../types/aiDesktop';
import { Language } from '../../../types/aiDesktop';
import DefaultAvatarIcon from '../../../assets/icons/DefaultAvatarIcon';
import USFlagIcon from '../../../assets/icons/USFlagIcon';
import AsteriskIcon from '../../../assets/icons/AsteriskIcon';
import ChevronDownIcon from '../../../assets/icons/ChevronDownIcon';

interface OverviewFormProps {
  data: OverviewFormData;
  onChange: (data: OverviewFormData) => void;
}

const OverviewForm = ({ data, onChange }: OverviewFormProps) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({ ...data, avatar: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-[#364050]">Avatar</label>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <DefaultAvatarIcon width={32} height={32} color="#696f8c" />
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-[#0b1234] cursor-pointer hover:bg-gray-50 transition-colors">
              Choose
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-[#696f8c]">JPG, GIF or PNG. 1MB Max.</span>
          </div>
        </div>
      </div>

      {/* First Name & Last Name */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            First Name
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange({ ...data, firstName: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] focus:outline-none focus:border-[#0f62fe] transition-colors"
            placeholder="Jon"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            Last Name
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange({ ...data, lastName: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] focus:outline-none focus:border-[#0f62fe] transition-colors"
            placeholder="Snow"
          />
        </div>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
          Language
          <AsteriskIcon width={7} height={7} color="#17a584" />
        </label>
        <div className="relative">
          <select
            value={data.language}
            onChange={(e) => onChange({ ...data, language: e.target.value as Language })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] appearance-none focus:outline-none focus:border-[#0f62fe] transition-colors"
          >
            <option value="en">English (Default)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ar">Arabic</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon width={11} height={6} color="#696f8c" />
          </div>
        </div>
      </div>

      {/* Phone Number */}
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
          Phone Number
          <AsteriskIcon width={7} height={7} color="#17a584" />
        </label>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 pr-2 border-r border-gray-200">
            <USFlagIcon width={20} height={20} />
            <span className="text-sm text-[#0b1234]">{data.phoneCountryCode}</span>
            <ChevronDownIcon width={11} height={6} color="#696f8c" />
          </div>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => onChange({ ...data, phoneNumber: e.target.value })}
            className="flex-1 text-sm text-[#696f8c] focus:outline-none"
            placeholder="555-0199"
          />
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="space-y-3">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={data.marketingEmailConsent}
            onChange={(e) => onChange({ ...data, marketingEmailConsent: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0f62fe] focus:ring-[#0f62fe]"
          />
          <span className="text-xs text-[#696f8c]">
            Customer agreed to receive marketing emails.
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={data.marketingSmsConsent}
            onChange={(e) => onChange({ ...data, marketingSmsConsent: e.target.checked })}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#0f62fe] focus:ring-[#0f62fe]"
          />
          <span className="text-xs text-[#696f8c]">
            Customer agreed to receive SMS marketing text messages.
          </span>
        </label>
      </div>
    </div>
  );
};

export default OverviewForm;