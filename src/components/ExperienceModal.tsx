import { useState } from 'react';
import { Experience } from '@/services/experienceService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Experience) => void;
  // We'll pass existing data here when we build the "Edit" feature later
  initialData?: Experience | null;
}

export default function ExperienceModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  // Initialize form state
  const [formData, setFormData] = useState<Experience>(
    initialData || {
      designation: '',
      companyName: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      skills: [],
    }
  );

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure endDate is null if it's the current job before saving
    const finalData = {
      ...formData,
      endDate: formData.isCurrentJob ? null : formData.endDate,
    };
    onSave(finalData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold text-white mb-6">
          {initialData ? 'Edit Experience ✏️' : 'Add Experience ➕'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Designation</label>
              <input type="text" required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Company Name</label>
              <input type="text" required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Start Date</label>
              <input type="date" required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            {/* Conditional Rendering for End Date */}
            {!formData.isCurrentJob && (
              <div>
                <label className="block text-slate-400 text-sm mb-1">End Date</label>
                <input type="date" required={!formData.isCurrentJob}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              className="w-4 h-4 accent-blue-600"
              checked={formData.isCurrentJob}
              onChange={(e) => setFormData({...formData, isCurrentJob: e.target.checked, endDate: ''})}
            />
            <span className="text-slate-300 text-sm">I currently work here (Present)</span>
          </label>

          {/* Location & Description fields omitted for brevity, but they follow the exact same pattern! */}

          <div className="pt-6 flex gap-4 justify-end border-t border-slate-800 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Save Experience</button>
          </div>
        </form>
      </div>
    </div>
  );
}