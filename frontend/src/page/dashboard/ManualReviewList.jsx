import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPendingReviews } from "../../services/attemptService";
import { ClipboardCheck, User, Clock, ChevronRight, AlertCircle, Sparkles } from "lucide-react";
import Toast from "../../components/ui/Toast";

export default function ManualReviewList() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await getPendingReviews();
                setReviews(res.data.data || res.data);
            } catch (error) {
                setToast({ show: true, message: "Failed to load pending reviews", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-6 space-y-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">
                        <ClipboardCheck size={14} />
                        Manual Assessment Center
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none uppercase">
                        Pending <span className="text-orange-600">Reviews.</span>
                    </h1>
                    <p className="text-slate-500 font-medium max-w-lg">
                        Review and grade short-answer responses to provide valuable feedback to your students.
                    </p>
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 bg-white rounded-[2.5rem] animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : reviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {reviews.map((review) => (
                        <div 
                            key={review.attempt_id}
                            onClick={() => navigate(`/reviews/${review.attempt_id}`)}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group cursor-pointer flex flex-col md:flex-row items-center justify-between gap-8"
                        >
                            <div className="flex items-center gap-8 w-full">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500 shrink-0">
                                    <Sparkles size={28} />
                                </div>
                                <div className="space-y-1 flex-1">
                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight group-hover:text-orange-600 transition-colors">
                                        {review.quiz_title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <User size={12} className="text-slate-300" />
                                            {review.user_name}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Clock size={12} className="text-slate-300" />
                                            {new Date(review.submitted_at).toLocaleString()}
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {review.short_answer_count} Answers to grade
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center gap-2 whitespace-nowrap">
                                Grade Submission <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                        <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 uppercase">Clear Inbox</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No submissions awaiting review at the moment</p>
                    </div>
                </div>
            )}

            {toast.show && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
            )}
        </div>
    );
}
