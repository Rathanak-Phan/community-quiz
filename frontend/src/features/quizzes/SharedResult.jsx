import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, CheckCircle2, Home, Sparkles, Loader2, Share2 } from "lucide-react";
import apiClient from "../../config/api";

export default function SharedResult() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchResult = async () => {
            if (!submissionId || submissionId === 'undefined') return;
            try {
                // The share link endpoint acts as our public endpoint for submission info
                const res = await apiClient.get(`/submissions/${submissionId}/share`);
                setResult(res.data);
            } catch (err) {
                console.error("Failed to load result", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
    }, [submissionId]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
    );

    if (error || !result) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center space-y-6">
            <div className="w-24 h-24 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center">
                <Trophy size={48} className="opacity-50" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Result Not Found</h2>
            <p className="text-slate-500 font-bold max-w-sm">This quiz result might have been deleted or the link is invalid.</p>
            <button 
                onClick={() => navigate("/")} 
                className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:-translate-y-1 hover:shadow-xl transition-all"
            >
                Back to Home
            </button>
        </div>
    );

    const percentage = result.max_score > 0 ? (result.score / result.max_score) * 100 : 0;
    const isSuccess = percentage >= 50;

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6 flex items-center justify-center">
            <div className="max-w-xl w-full space-y-8">
                {/* Result Card */}
                <div className={`rounded-[3rem] p-10 md:p-14 text-center relative overflow-hidden transition-all duration-700 shadow-2xl shadow-slate-200/50 ${
                    isSuccess ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border border-slate-100'
                }`}>
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[80%] bg-blue-500 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[80%] bg-emerald-500 rounded-full blur-[100px]"></div>
                    </div>

                    <div className="relative z-10 space-y-10">
                        <div className="space-y-4">
                            <div className={`inline-flex items-center justify-center w-24 h-24 backdrop-blur-xl rounded-3xl border mb-2 ${
                                isSuccess ? 'bg-white/10 border-white/20 text-amber-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}>
                                <Trophy size={48} />
                            </div>
                            <h2 className={`text-sm font-black uppercase tracking-[0.3em] ${isSuccess ? 'text-white/60' : 'text-slate-400'}`}>
                                Quiz Result
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-6xl md:text-7xl font-black tracking-tighter">
                                {result.grading_status === 'pending' ? '--' : `${percentage.toFixed(0)}%`}
                            </h1>
                            <p className={`font-black text-lg ${result.grading_status === 'pending' ? 'text-amber-500' : (isSuccess ? 'text-emerald-400' : 'text-rose-500')}`}>
                                {result.grading_status === 'pending' ? 'Grading in Progress' : (isSuccess ? 'Outstanding Performance!' : 'Good Effort!')}
                            </p>
                        </div>

                        <div className={`p-8 rounded-2xl flex flex-col gap-2 ${isSuccess ? 'bg-white/5' : 'bg-slate-50'}`}>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isSuccess ? 'text-white/40' : 'text-slate-400'}`}>
                                {result.user_name} scored
                            </p>
                            <p className="text-xl font-bold">
                                {result.score} out of {result.max_score} objective points
                                {result.grading_status === 'pending' && (
                                    <span className="block text-[10px] text-amber-500 mt-1 uppercase tracking-wider">+ Short Answers Pending Review</span>
                                )}
                            </p>
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${isSuccess ? 'text-white/40' : 'text-slate-400'}`}>
                                On Quiz:
                            </p>
                            <p className="text-lg font-black uppercase tracking-tight">
                                {result.quiz_title}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate("/quizzes")}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl font-black uppercase tracking-widest text-xs hover:border-blue-500 hover:shadow-lg hover:text-blue-600 transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Sparkles size={20} />
                        </div>
                        Take a Quiz
                    </button>
                    
                    <button 
                        onClick={() => navigate("/")}
                        className="flex flex-col items-center justify-center gap-3 p-6 bg-white border border-slate-100 rounded-3xl font-black uppercase tracking-widest text-xs hover:border-slate-400 hover:shadow-lg transition-all group"
                    >
                        <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Home size={20} />
                        </div>
                        Home Page
                    </button>
                </div>
            </div>
        </div>
    );
}
