"use client";

import { useState, useEffect } from 'react';
import { Experience } from '@/services/experienceService';
import { getAllSkills, Skill } from '@/services/skillService';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Experience) => void;
  initialData?: Experience | null;
}

export default function ExperienceModal({ isOpen, onClose, onSave, initialData }: ModalProps) {
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  // Default blank state for a new experience
  const defaultFormState: Experience = {
    designation: '',
    companyName: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    skills: [],
  };

  const [formData, setFormData] = useState<Experience>(defaultFormState);

  // Fetch available skills from the database when component mounts
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const data = await getAllSkills();
        setAvailableSkills(data);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      }
    };
    fetchSkills();
  }, []);

  // Reset or populate the form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || defaultFormState);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure endDate is null if it's the current job
    const finalData = {
      ...formData,
      endDate: formData.isCurrentJob ? null : formData.endDate,
    };
    onSave(finalData);
  };

  const handleSkillSelect = (skillName: string) => {
    if (!formData.skills.includes(skillName)) {
      setFormData({ ...formData, skills: [...formData.skills, skillName] });
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
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
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1">Company Name</label>
              <input type="text" required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-slate-400 text-sm mb-1">Start Date</label>
              <input type="date" required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            {!formData.isCurrentJob && (
              <div>
                <label className="block text-slate-400 text-sm mb-1">End Date</label>
                <input type="date" required={!formData.isCurrentJob}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={formData.endDate || ''}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer w-max mt-2">
            <input type="checkbox"
              className="w-4 h-4 accent-blue-600"
              checked={formData.isCurrentJob}
              onChange={(e) => setFormData({...formData, isCurrentJob: e.target.checked, endDate: ''})}
            />
            <span className="text-slate-300 text-sm">I currently work here (Present)</span>
          </label>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Location</label>
            <input type="text" required placeholder="e.g. Bangalore, India"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Description</label>
            <textarea required rows={4} placeholder="Describe your responsibilities and achievements..."
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-2 border-t border-slate-800">
            <label className="block text-slate-400 text-sm mb-2">Add Skills</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white mb-3 focus:border-blue-500 outline-none"
              onChange={(e) => handleSkillSelect(e.target.value)}
              value="" // Keep it empty so it always shows the placeholder
            >
              <option value="" disabled>Choose a skill...</option>
              {availableSkills
                .filter(skill => !formData.skills.includes(skill.name))
                .map(skill => (
                  <option key={skill.id} value={skill.name}>{skill.name}</option>
              ))}
            </select>

            {/* Display the selected skill chips */}
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.skills.map(skill => (
                <span key={skill} className="flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-800 rounded-full text-sm text-blue-300 transition-colors">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-white hover:bg-blue-800/50 rounded-full w-5 h-5 flex items-center justify-center leading-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {formData.skills.length === 0 && (
                <span className="text-slate-500 text-sm italic">No skills added yet.</span>
              )}
            </div>
          </div>

          <div className="pt-6 flex gap-4 justify-end mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
              Save Experience
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}