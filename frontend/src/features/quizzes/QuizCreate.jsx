import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QuizFormModal from "./components/QuizFormModal";

export default function QuizCreate() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate("/quizzes/my");
  };

  const handleSuccess = (msg) => {
    // Navigate to my quizzes or the newly created quiz if we had the ID
    // For now, navigate to my quizzes
    navigate("/quizzes/my");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <QuizFormModal 
            isOpen={isOpen}
            onClose={handleClose}
            onSuccess={handleSuccess}
        />
        
        {/* Fallback view if modal is closed but navigation hasn't happened */}
        {!isOpen && (
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-black text-slate-900 uppercase">Redirecting...</h2>
            </div>
        )}
    </div>
  );
}
