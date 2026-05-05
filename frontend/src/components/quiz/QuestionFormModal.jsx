import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { createMcq, createTrueFalse, createShortAnswer, updateQuestion } from '../../services/questionService';
import Toast from '../ui/Toast';

const QuestionFormModal = ({ isOpen, onClose, onSuccess, quizId, editData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    image: null,
    // MCQ specific
    options: ['', '', '', ''],
    correct_option: 0,
    // True/False specific
    correct_answer_tf: true,
    // Short Answer specific
    correct_answer_sa: '',
    is_manual_grading: false
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editData) {
      const type = editData.question_type;
      setFormData({
        question_text: editData.question_text || '',
        question_type: type,
        points: editData.points || 1,
        image: null,
        options: type === 'multiple_choice' ? editData.options?.map(o => o.option_text) || ['', '', '', ''] : ['', '', '', ''],
        correct_option: type === 'multiple_choice' ? editData.options?.findIndex(o => o.is_correct) ?? 0 : 0,
        correct_answer_tf: type === 'true_false' ? editData.correct_answer === 'true' : true,
        correct_answer_sa: type === 'short_answer' ? editData.short_answer?.answer_text || '' : '',
        is_manual_grading: type === 'short_answer' ? editData.short_answer?.is_manual_grading || false : false
      });
      setImagePreview(editData.image ? `${import.meta.env.VITE_STORAGE_URL}/${editData.image}` : null);
    } else {
      setFormData({
        question_text: '',
        question_type: 'multiple_choice',
        points: 1,
        image: null,
        options: ['', '', '', ''],
        correct_option: 0,
        correct_answer_tf: true,
        correct_answer_sa: '',
        is_manual_grading: false
      });
      setImagePreview(null);
    }
  }, [editData, isOpen]);

  const handleTypeChange = (type) => {
    setFormData(prev => ({ ...prev, question_type: type }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      const submissionData = new FormData();
      submissionData.append('quiz_id', quizId);
      submissionData.append('question_text', formData.question_text);
      submissionData.append('points', formData.points);
      if (formData.image) submissionData.append('image', formData.image);

      if (editData) {
        // Prepare data for update (backend handles different fields based on type)
        const updateData = new FormData();
        updateData.append('question_text', formData.question_text);
        updateData.append('points', formData.points);
        if (formData.image) updateData.append('image', formData.image);

        if (formData.question_type === 'multiple_choice') {
            formData.options.forEach((opt, i) => updateData.append(`options[${i}]`, opt));
            updateData.append('correct_option', formData.correct_option);
        } else if (formData.question_type === 'true_false') {
            updateData.append('correct_answer', formData.correct_answer_tf ? 1 : 0);
        } else if (formData.question_type === 'short_answer') {
            updateData.append('correct_answer', formData.correct_answer_sa);
            updateData.append('is_manual_grading', formData.is_manual_grading ? 1 : 0);
        }

        response = await updateQuestion(editData.id, updateData);
      } else {
        // Create based on type
        if (formData.question_type === 'multiple_choice') {
          formData.options.forEach((opt, i) => submissionData.append(`options[${i}]`, opt));
          submissionData.append('correct_option', formData.correct_option);
          response = await createMcq(submissionData);
        } else if (formData.question_type === 'true_false') {
          submissionData.append('correct_answer', formData.correct_answer_tf ? 1 : 0);
          response = await createTrueFalse(submissionData);
        } else {
          submissionData.append('correct_answer', formData.correct_answer_sa);
          submissionData.append('is_manual_grading', formData.is_manual_grading ? 1 : 0);
          response = await createShortAnswer(submissionData);
        }
      }

      onSuccess(editData ? 'Question updated!' : 'Question created!');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <HelpCircle size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {editData ? 'Edit' : 'New'} Question
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configure your quiz challenge</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Content</label>
            <textarea
              required
              rows={3}
              placeholder="What would you like to ask?"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all font-bold text-sm resize-none"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type Selector */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Question Type</label>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'multiple_choice', label: 'Multiple Choice', icon: 'list' },
                  { id: 'true_false', label: 'True / False', icon: 'check' },
                  { id: 'short_answer', label: 'Short Answer', icon: 'type' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    disabled={!!editData}
                    onClick={() => handleTypeChange(type.id)}
                    className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border transition-all ${
                      formData.question_type === type.id 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white border-slate-100 text-slate-500 hover:border-blue-200'
                    } ${editData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
                    {formData.question_type === type.id && <CheckCircle2 size={16} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Aid (Optional)</label>
              <div className="relative group h-[146px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`h-full border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all ${
                  imagePreview ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 bg-slate-50 group-hover:border-blue-300'
                }`}>
                  {imagePreview ? (
                    <img src={imagePreview} className="h-full w-full object-cover rounded-[1.4rem]" alt="Preview" />
                  ) : (
                    <>
                      <ImageIcon size={32} className="text-slate-300 mb-2" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Image</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Parts */}
          <div className="pt-8 border-t border-slate-50">
            {formData.question_type === 'multiple_choice' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Options (Select the correct one)</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.options.map((option, idx) => (
                    <div key={idx} className="relative group">
                      <input
                        required
                        type="text"
                        placeholder={`Option ${idx + 1}`}
                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all font-bold text-xs ${
                            formData.correct_option === idx ? 'border-emerald-200 bg-emerald-50/30 ring-4 ring-emerald-500/5' : ''
                        }`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_option: idx })}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                          formData.correct_option === idx ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        {formData.correct_option === idx ? <CheckCircle2 size={14} /> : idx + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.question_type === 'true_false' && (
              <div className="space-y-4 text-center">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Select the correct answer</label>
                <div className="flex gap-4 max-w-sm mx-auto">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer_tf: true })}
                        className={`flex-1 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all border ${
                            formData.correct_answer_tf 
                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-emerald-200'
                        }`}
                    >
                        True
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, correct_answer_tf: false })}
                        className={`flex-1 py-5 rounded-2xl font-black uppercase text-sm tracking-widest transition-all border ${
                            !formData.correct_answer_tf 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-xl shadow-rose-500/20' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-rose-200'
                        }`}
                    >
                        False
                    </button>
                </div>
              </div>
            )}

            {formData.question_type === 'short_answer' && (
              <div className="space-y-6">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Answer</label>
                    <input
                        required
                        type="text"
                        placeholder="Correct answer text..."
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 outline-none transition-all font-bold text-xs"
                        value={formData.correct_answer_sa}
                        onChange={(e) => setFormData({ ...formData, correct_answer_sa: e.target.value })}
                    />
                </div>
                <label className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl cursor-pointer group">
                    <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest">Manual Grading Required</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enable if answers are open-ended</p>
                    </div>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={formData.is_manual_grading}
                        onChange={(e) => setFormData({ ...formData, is_manual_grading: e.target.checked })}
                    />
                    <div className={`w-12 h-6 rounded-full transition-all relative ${formData.is_manual_grading ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.is_manual_grading ? 'left-7' : 'left-1'}`}></div>
                    </div>
                </label>
              </div>
            )}
          </div>
        </form>

        <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] px-8 py-4 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={16} />}
            {editData ? 'Save Changes' : 'Create Question'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionFormModal;
