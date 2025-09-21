import { useState } from 'react';
import {
    QuestionCardProps,
    UpdateRevisionResponse
} from "@/app/components/todayquestion-components/todayquuestion-interface";
import {
    CalendarIcon,
    CheckCircleIcon,
    ExternalLinkIcon,
    XCircleIcon,
    RefreshIcon
} from "@/app/components/todayquestion-components/icons";

export const QuestionCard = ({ questionNumber, questionId, questionUrl, questionSolved, onRevisionUpdate }: QuestionCardProps) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [localSolved, setLocalSolved] = useState(questionSolved);
    const [updateStatus, setUpdateStatus] = useState<'success' | 'error' | null>(null);

    const isSolved: boolean = localSolved === true
    const hasData = questionId && questionUrl;

    const getTitle = (url: string | null) => {
        if (!url) return 'No Question Available';
        const title = url.split('/problems/')[1]?.split('/')[0]?.replace(/-/g, ' ');
        return title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Problem';
    };

    const handleUpdateRevision = async () => {
        if (!questionId || isUpdating) return;

        setIsUpdating(true);
        setUpdateStatus(null);

        try {
            let token = localStorage.getItem('update_token');
            if (!token) {
                token = window.prompt('Please enter your secret token:');
                if (token) {
                    localStorage.setItem('update_token', token);
                } else {
                    return;
                }
            }

            const response = await fetch(`/api/commit-question?token=${token}&id1=${questionId}`, {
                method: 'GET',
            });

            const data: UpdateRevisionResponse = await response.json();

            if (response.ok && data.status === 'success') {
                setLocalSolved(true);
                setUpdateStatus('success');

                if (onRevisionUpdate) {
                    onRevisionUpdate();
                }

                setTimeout(() => setUpdateStatus(null), 3000);
            } else {
                setUpdateStatus('error');
                console.error('Failed to update revision:', data.message);
                setTimeout(() => setUpdateStatus(null), 3000);
            }
        } catch (error) {
            console.error('Error updating revision:', error);
            setUpdateStatus('error');
            setTimeout(() => setUpdateStatus(null), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!hasData) {
        return (
            <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-700">{questionNumber} Problem</h3>
                    <span className="text-xs text-gray-400">Not Available</span>
                </div>
                <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl mb-3 block opacity-50">📋</span>
                    <p className="text-sm">No question data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`glass-card rounded-2xl p-6 transition-all hover:scale-[1.02] ${
            isSolved ? 'bg-gradient-to-br from-green-50/30 to-emerald-50/30' : ''
        }`}>
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {questionNumber} Problem
                            </span>
                            {isSolved ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100/80 text-green-700">
                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                    Solved
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100/80 text-yellow-700">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></div>
                                    Pending
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 capitalize mb-1">
                            {getTitle(questionUrl)}
                        </h3>
                        <p className="text-sm text-gray-500">Problem #{questionId}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-3">
                        <a
                            href={questionUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isSolved
                                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
                            }`}
                        >
                            <ExternalLinkIcon className="w-4 h-4 mr-2" />
                            {isSolved ? 'Review' : 'Solve'}
                        </a>

                        <button
                            onClick={handleUpdateRevision}
                            disabled={isUpdating || isSolved}
                            className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                isUpdating || isSolved
                                    ? 'bg-gray-100/50 text-gray-400 cursor-not-allowed'
                                    : 'glass-card text-gray-700 hover:bg-white/80'
                            }`}
                        >
                            <RefreshIcon className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                            {isUpdating ? 'Updating...' : isSolved ? 'Completed' : 'Mark Complete'}
                        </button>
                    </div>

                    {/* Status Messages */}
                    {updateStatus && (
                        <div className={`flex items-center justify-center py-2 px-3 rounded-xl text-sm animate-fadeIn glass-card ${
                            updateStatus === 'success'
                                ? 'text-green-700'
                                : 'text-red-700'
                        }`}>
                            {updateStatus === 'success' ? (
                                <>
                                    <span className="mr-2">✅</span>
                                    <span>Successfully updated!</span>
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">❌</span>
                                    <span>Update failed</span>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};