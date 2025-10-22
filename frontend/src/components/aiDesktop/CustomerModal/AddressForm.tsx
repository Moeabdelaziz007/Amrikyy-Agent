import type { AddressFormData } from '../../../types/aiDesktop';
import AsteriskIcon from '../../../assets/icons/AsteriskIcon';
import ChevronDownIcon from '../../../assets/icons/ChevronDownIcon';

interface AddressFormProps {
  data: AddressFormData;
  onChange: (data: AddressFormData) => void;
}

const AddressForm = ({ data, onChange }: AddressFormProps) => {
  return (
    <div className="space-y-6">
      {/* Country & Region */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            Country
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <div className="relative">
            <select
              value={data.country}
              onChange={(e) => onChange({ ...data, country: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] appearance-none focus:outline-none focus:border-[#0f62fe] transition-colors"
            >
              <option value="">Select a country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon width={11} height={6} color="#696f8c" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            Region
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <div className="relative">
            <select
              value={data.region}
              onChange={(e) => onChange({ ...data, region: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] appearance-none focus:outline-none focus:border-[#0f62fe] transition-colors"
            >
              <option value="">Select your region</option>
              <option value="ca">California</option>
              <option value="ny">New York</option>
              <option value="tx">Texas</option>
              <option value="fl">Florida</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDownIcon width={11} height={6} color="#696f8c" />
            </div>
          </div>
        </div>
      </div>

      {/* Apartments */}
      <div className="space-y-2">
        <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
          Apartments, suite, etc
          <AsteriskIcon width={7} height={7} color="#17a584" />
        </label>
        <input
          type="text"
          value={data.apartments}
          onChange={(e) => onChange({ ...data, apartments: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] focus:outline-none focus:border-[#0f62fe] transition-colors"
          placeholder="Enter your apartments, suite, etc"
        />
      </div>

      {/* City & Zip Code */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            City
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] focus:outline-none focus:border-[#0f62fe] transition-colors"
            placeholder="Enter your City"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1 text-sm font-medium text-[#364050]">
            Zip Code
            <AsteriskIcon width={7} height={7} color="#17a584" />
          </label>
          <input
            type="text"
            value={data.zipCode}
            onChange={(e) => onChange({ ...data, zipCode: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] focus:outline-none focus:border-[#0f62fe] transition-colors"
            placeholder="Enter zip code"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;