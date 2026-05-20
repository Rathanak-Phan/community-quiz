import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Image as ImageIcon, Save, AlertCircle, CheckCircle2, HelpCircle, Check, Copy, Loader2, GripVertical, Type } from 'lucide-react';
import { createMcq, createTrueFalse, createShortAnswer, updateQuestion } from '../services/questionService';

const QuestionEditor = ({ quizId, editData = null, onCancel, onSuccess, quizHasTimer = false, defaultTimeLimit = 30 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 1,
    image: null,
    options: ['', '', '', ''],
    correct_options: [0],
    correct_answer_tf: true,
    correct_answer_sa: '',
    is_manual_grading: false,
    allow_multiple: false,
    time_limit: defaultTimeLimit || 30
  });

  const presets = [10, 20, 30, 60, 90, 120, 180, 300];
  const [isCustomTimer, setIsCustomTimer] = useState(() => {
    const limit = editData?.time_limit || defaultTimeLimit || 30;
    return limit !== 0 && !presets.includes(limit);
  });

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editData) {
      const type = editData.question_type;
      const correctIndices = type === 'multiple_choice' 
        ? editData.options?.map((o, i) => o.is_correct ? i : null).filter(i => i !== null) || [0]
        : [0];

      const limit = editData.time_limit || 30;
      setIsCustomTimer(limit !== 0 && !presets.includes(limit));

      setFormData({
        question_type: type,
        points: editData.points || 1,
        image: null,
        options: type === 'multiple_choice' ? editData.options?.map(o => o.option_text) || ['', '', '', ''] : ['', '', '', ''],
        correct_options: correctIndices,
        correct_answer_tf: type === 'true_false' ? editData.correct_answer === 'true' : true,
        correct_answer_sa: type === 'short_answer' ? editData.short_answer?.answer_text || '' : '',
        is_manual_grading: type === 'short_answer' ? editData.short_answer?.is_manual_grading || false : false,
        question_text: editData.isDuplicate ? `Copy of ${editData.question_text}` : (editData.question_text || ''),
        allow_multiple: type === 'multiple_choice' ? (correctIndices.length > 1) : false,
        time_limit: limit
      });
      setImagePreview(editData.image ? `${import.meta.env.VITE_STORAGE_URL}/${editData.image}` : null);
    }
  }, [editData]);

  const handleTypeChange = (type) => {
    setFormData(prev => ({ 
      ...prev, 
      question_type: type,
      is_manual_grading: type === 'short_answer' ? true : prev.is_manual_grading
    }));
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

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) return;
    const newOptions = formData.options.filter((_, i) => i !== index);
    const newCorrect = formData.correct_options
      .filter(i => i !== index)
      .map(i => i > index ? i - 1 : i);
    setFormData(prev => ({
      ...prev,
      options: newOptions,
      correct_options: newCorrect
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      const submissionData = new FormData();
      submissionData.append('quiz_id', quizId);
      submissionData.append('question_text', formData.question_text);
      submissionData.append('points', formData.points);
      submissionData.append('time_limit', formData.time_limit);
      submissionData.append('allow_multiple', formData.allow_multiple ? 1 : 0);
      if (formData.image) submissionData.append('image', formData.image);
      
      const isActuallyEditing = editData && editData.id;

      if (isActuallyEditing) {
        const updateData = new FormData();
        updateData.append('question_text', formData.question_text);
        updateData.append('points', formData.points);
        updateData.append('time_limit', formData.time_limit);
        updateData.append('allow_multiple', formData.allow_multiple ? 1 : 0);
        if (formData.image) updateData.append('image', formData.image);

        if (formData.question_type === 'multiple_choice') {
            formData.options.forEach((opt, i) => updateData.append(`options[${i}]`, opt));
            formData.correct_options.forEach((idx, i) => updateData.append(`correct_options[${i}]`, idx));
        } else if (formData.question_type === 'true_false') {
            updateData.append('correct_answer', formData.correct_answer_tf ? 1 : 0);
        } else if (formData.question_type === 'short_answer') {
            updateData.append('correct_answer', formData.correct_answer_sa);
            updateData.append('is_manual_grading', formData.is_manual_grading ? 1 : 0);
        }
        updateData.append('time_limit', formData.time_limit);

        response = await updateQuestion(editData.id, updateData);
      } else {
        if (formData.question_type === 'multiple_choice') {
          formData.options.forEach((opt, i) => submissionData.append(`options[${i}]`, opt));
          formData.correct_options.forEach((idx, i) => submissionData.append(`correct_options[${i}]`, idx));
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
      
      onSuccess(isActuallyEditing ? 'Question updated!' : (editData?.isDuplicate ? 'Question duplicated!' : 'Question created!'));
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg p-0 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 transition-colors duration-300">
      {/* Top Handle for dragging (visual only for now) */}
      <div className="h-6 flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 cursor-move">
         <GripVertical size={14} className="text-slate-300 dark:text-slate-600" />
      </div>

      <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
        {error && (
          <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900 rounded text-rose-600 dark:text-rose-450 text-sm flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            <div className="flex-1 space-y-4">
                <input
                    required
                    placeholder="Question"
                    className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-slate-50 dark:bg-slate-800/40 border-b-2 border-slate-100 dark:border-slate-800 focus:border-[#673ab7] outline-none transition-all text-lg sm:text-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={formData.question_text}
                    onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                />
            </div>
            <div className="w-full md:w-56">
                <select
                    value={formData.question_type === 'multiple_choice' ? (formData.allow_multiple ? 'checkboxes' : 'multiple_choice') : formData.question_type}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'checkboxes') {
                            setFormData({ ...formData, question_type: 'multiple_choice', allow_multiple: true });
                        } else if (val === 'multiple_choice') {
                            setFormData({ ...formData, question_type: 'multiple_choice', allow_multiple: false, correct_options: [formData.correct_options[0] || 0] });
                        } else {
                            handleTypeChange(val);
                        }
                    }}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#673ab7]/20 focus:border-[#673ab7] transition-all cursor-pointer shadow-sm"
                >
                    <option value="multiple_choice" className="dark:bg-slate-800 dark:text-slate-300">Multiple Choice</option>
                    <option value="checkboxes" className="dark:bg-slate-800 dark:text-slate-300">Checkboxes</option>
                    <option value="true_false" className="dark:bg-slate-800 dark:text-slate-300">True / False</option>
                    <option value="short_answer" className="dark:bg-slate-800 dark:text-slate-300">Short Answer</option>
                </select>
            </div>
        </div>

        <div className="space-y-4">
          {formData.question_type === 'multiple_choice' && (
            <div className="space-y-3">
              {formData.options.map((option, idx) => (
                <div key={idx} className="flex items-center gap-4 group animate-in slide-in-from-left-2 duration-200">
                  <div 
                    onClick={() => {
                      let newCorrect;
                      if (formData.allow_multiple) {
                        newCorrect = formData.correct_options.includes(idx)
                          ? formData.correct_options.filter(i => i !== idx)
                          : [...formData.correct_options, idx];
                      } else {
                        newCorrect = [idx];
                      }
                      setFormData({ ...formData, correct_options: newCorrect });
                    }}
                    className={`w-6 h-6 flex items-center justify-center cursor-pointer transition-all ${
                      formData.allow_multiple ? 'rounded-md' : 'rounded-full'
                    } border-2 ${
                      formData.correct_options.includes(idx) 
                        ? 'border-emerald-500 bg-emerald-500' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500'
                    }`}
                  >
                      {formData.correct_options.includes(idx) && <Check size={14} className="text-white" strokeWidth={4} />}
                  </div>
                  <input
                    required
                    type="text"
                    placeholder={`Option ${idx + 1}`}
                    className="flex-1 py-3 border-b border-slate-100 dark:border-slate-800 focus:border-[#673ab7] outline-none text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors placeholder:text-slate-500 dark:placeholder:text-slate-400"
                    value={option}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(idx)}
                    className="p-2 text-slate-300 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              
              <div className="flex items-center gap-4 pt-4">
                 <div className={`w-6 h-6 ${formData.allow_multiple ? 'rounded-md' : 'rounded-full'} border-2 border-slate-200 dark:border-slate-800`}></div>
                 <button 
                   type="button"
                   onClick={addOption}
                   className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#673ab7] dark:hover:text-[#673ab7] font-bold uppercase tracking-widest transition-colors"
                 >
                   Add Option
                 </button>
              </div>
            </div>
          )}

          {formData.question_type === 'true_false' && (
            <div className="flex gap-4">
                {['True', 'False'].map((val) => {
                    const isCorrect = (val === 'True' && formData.correct_answer_tf) || (val === 'False' && !formData.correct_answer_tf);
                    return (
                      <button
                          key={val}
                          type="button"
                          onClick={() => setFormData({ ...formData, correct_answer_tf: val === 'True' })}
                          className={`flex-1 py-6 rounded-xl border-2 transition-all font-black uppercase text-xs tracking-widest ${
                              isCorrect 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-450 shadow-sm shadow-emerald-500/10' 
                              : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                      >
                          {val}
                      </button>
                    );
                })}
            </div>
          )}

          {formData.question_type === 'short_answer' && (
            <div className="space-y-6">
               <div className="max-w-md p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-4 text-slate-500 dark:text-slate-400">
                   <Type size={18} />
                   <div className="flex flex-col">
                      <span className="text-sm font-medium">Participants will type their answer in a text box.</span>
                      {!formData.is_manual_grading && (
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight mt-0.5">Separate multiple correct answers with commas</span>
                      )}
                   </div>
                </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Reference Answer (Optional)</label>
                       {!formData.is_manual_grading && <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Auto-marked as correct if answered</span>}
                    </div>
                    <input
                        type="text"
                        placeholder="Enter reference answer for students (optional)..."
                        className="w-full px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#673ab7] focus:ring-4 focus:ring-[#673ab7]/5 text-sm font-bold shadow-sm transition-all dark:text-white dark:placeholder:text-slate-500"
                        value={formData.correct_answer_sa}
                        onChange={(e) => setFormData({ ...formData, correct_answer_sa: e.target.value })}
                    />
                 </div>
             </div>
          )}
        </div>

        {/* Image Preview */}
        {imagePreview && (
            <div className="relative rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 group">
                <img src={imagePreview} className="w-full max-h-80 object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white dark:bg-slate-800 p-3 rounded-xl text-slate-900 dark:text-slate-100 shadow-xl hover:scale-110 transition-transform"
                    >
                        <ImageIcon size={20} />
                    </button>
                    <button 
                        type="button"
                        onClick={() => {setImagePreview(null); setFormData({...formData, image: null})}}
                        className="bg-rose-500 p-3 rounded-xl text-white shadow-xl hover:scale-110 transition-transform"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        )}

        {/* Advanced Settings */}
        <div className="pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
           <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 w-full lg:w-auto">
              <div className="flex items-center gap-3">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Points</label>
                  <input 
                      type="number"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-black focus:bg-white dark:focus:bg-slate-800 focus:border-[#673ab7] outline-none shadow-inner dark:text-white"
                  />
              </div>
              <div className="flex flex-wrap items-center gap-3 flex-1 sm:flex-initial">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest shrink-0">Timer</label>
                  <select
                      value={isCustomTimer ? "custom" : formData.time_limit}
                      onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'custom') {
                              setIsCustomTimer(true);
                              if (presets.includes(formData.time_limit) || formData.time_limit === 0) {
                                  setFormData({ ...formData, time_limit: 45 });
                              }
                          } else {
                              setIsCustomTimer(false);
                              setFormData({ ...formData, time_limit: parseInt(val) });
                          }
                      }}
                      className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-black focus:bg-white dark:focus:bg-slate-800 focus:border-[#673ab7] outline-none cursor-pointer shadow-inner dark:text-white"
                  >
                      <option value={0} className="dark:bg-slate-800">No Timer</option>
                      {presets.map(s => (
                          <option key={s} value={s} className="dark:bg-slate-800">{s < 60 ? `${s}s` : `${s/60}m`}</option>
                      ))}
                      <option value="custom" className="dark:bg-slate-800">Custom (Manual)</option>
                  </select>
                  {isCustomTimer && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
                          <input 
                              type="number"
                              min={0}
                              value={formData.time_limit}
                              onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setFormData({ ...formData, time_limit: isNaN(val) ? 0 : val });
                              }}
                              className="w-24 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-black focus:bg-white dark:focus:bg-slate-800 focus:border-[#673ab7] outline-none shadow-inner dark:text-white"
                              placeholder="Seconds"
                          />
                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">seconds</span>
                      </div>
                  )}
              </div>
           </div>
           
           <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#673ab7] hover:bg-slate-50 dark:hover:bg-slate-800 transition font-bold text-xs uppercase tracking-widest"
                >
                    <ImageIcon size={16} />
                    {imagePreview ? 'Change Image' : 'Add Image'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
           </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
                <button 
                    type="button"
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition shadow-sm animate-pulse" 
                    title="Duplicate"
                >
                    <Copy size={18} />
                </button>
                <button 
                    type="button"
                    onClick={onCancel}
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition shadow-sm" 
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {formData.question_type === 'short_answer' && (
                    <div className="flex items-center justify-between xs:justify-end gap-3 shrink-0">
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Grading</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl">
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_manual_grading: false})}
                                className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${!formData.is_manual_grading ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Auto
                            </button>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, is_manual_grading: true})}
                                className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${formData.is_manual_grading ? 'bg-white dark:bg-slate-700 text-[#673ab7] dark:text-[#673ab7] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                Manual
                            </button>
                        </div>
                    </div>
                )}
                <div className="hidden xs:block w-px h-6 bg-slate-100 dark:bg-slate-800 shrink-0"></div>
                <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 sm:flex-initial px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-slate-500 dark:text-slate-400 font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-100 dark:hover:border-slate-700 text-center"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 sm:flex-initial bg-slate-900 dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-white px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest transition shadow-xl shadow-slate-900/10 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {editData ? 'Update' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
