import React from 'react';
import QuestionEditor from './QuestionEditor';

const QuestionFormModal = ({ isOpen, onClose, onSuccess, quizId, editData = null, quizHasTimer = false, defaultTimeLimit = 30 }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300">
        <QuestionEditor 
          quizId={quizId}
          editData={editData}
          onCancel={onClose}
          onSuccess={(msg) => {
            onSuccess(msg);
            onClose();
          }}
          quizHasTimer={quizHasTimer}
          defaultTimeLimit={defaultTimeLimit}
        />
      </div>
    </div>
  );
};

export default QuestionFormModal;
