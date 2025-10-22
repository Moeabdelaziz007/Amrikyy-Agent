import type { NotesFormData } from '../../../types/aiDesktop';
import EditIcon from '../../../assets/icons/EditIcon';

interface NotesFormProps {
  data: NotesFormData;
  onChange: (data: NotesFormData) => void;
}

const NotesForm = ({ data, onChange }: NotesFormProps) => {
  return (
    <div className="space-y-2">
      {/* Note Label */}
      <label className="block text-sm font-medium text-[#364050]">Note</label>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={data.note}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
          className="w-full h-48 px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-[#696f8c] resize-none focus:outline-none focus:border-[#0f62fe] transition-colors"
          placeholder="A short and clear note for your customer..."
        />
        <div className="absolute bottom-3 right-3 pointer-events-none">
          <EditIcon width={9} height={9} color="#696f8c" />
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-sm text-[#364050]">Add personal note for your customer</p>
    </div>
  );
};

export default NotesForm;