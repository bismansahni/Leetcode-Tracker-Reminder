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

    const isSolved: boolean = typeof localSolved === 'boolean'
        ? localSolved
        : typeof localSolved === 'string'
            ? localSolved.toLowerCase() === 'true'
            : false;
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
            const token = localStorage.getItem('update_token');

            const response = await fetch(`/api/commit-question?token=${token}&id1=${questionId}`, {
                method: 'GET',
            });

            const data: UpdateRevisionResponse = await response.json();

            if (response.ok && data.status === 'success') {
                // Update local state to show as solved
                setLocalSolved('true');
                setUpdateStatus('success');

                // Call parent callback to refresh data if provided
                if (onRevisionUpdate) {
                    onRevisionUpdate();
                }

                // Reset status after 3 seconds
                setTimeout(() => setUpdateStatus(null), 3000);
            } else {
                setUpdateStatus('error');
                console.error('Failed to update revision:', data.message);

                // Reset error status after 3 seconds
                setTimeout(() => setUpdateStatus(null), 3000);
            }
        } catch (error) {
            console.error('Error updating revision:', error);
            setUpdateStatus('error');

            // Reset error status after 3 seconds
            setTimeout(() => setUpdateStatus(null), 3000);
        } finally {
            setIsUpdating(false);
        }
    };

    if (!hasData) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-400">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{questionNumber} Question</h3>
                    <div className="flex items-center text-gray-400">
                        <XCircleIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">Not Available</span>
                    </div>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No question data available for today</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
            isSolved ? 'border-green-500' : 'border-orange-500'
        }`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{questionNumber} Question</h3>
                <div className={`flex items-center ${isSolved ? 'text-green-600' : 'text-orange-600'}`}>
                    {isSolved ? (
                        <>
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Solved</span>
                        </>
                    ) : (
                        <>
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">Not Solved</span>
                        </>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Problem Title:</p>
                    <p className="font-medium text-gray-900 capitalize">{getTitle(questionUrl)}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-600 mb-1">Question ID:</p>
                    <p className="text-gray-700">#{questionId}</p>
                </div>

                <div className="pt-2 space-y-2">
                    <a
                        href={questionUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isSolved
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                        }`}
                    >
                        <ExternalLinkIcon className="w-4 h-4 mr-2" />
                        {isSolved ? 'Review Problem' : 'Solve Problem'}
                    </a>

                    {/* Update Revision Button */}
                    <div className="flex flex-col space-y-1">
                        <button
                            onClick={handleUpdateRevision}
                            disabled={isUpdating || isSolved}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                isUpdating || isSolved
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isSolved
                                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300'
                                        : 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300'
                            }`}
                        >
                            <RefreshIcon className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                            {isUpdating ? 'Updating...' : 'Update Revision'}
                        </button>

                        {/* Status Messages */}
                        {updateStatus === 'success' && (
                            <div className="flex items-center text-green-600 text-xs">
                                <CheckCircleIcon className="w-3 h-3 mr-1" />
                                <span>Revision updated successfully!</span>
                            </div>
                        )}
                        {updateStatus === 'error' && (
                            <div className="flex items-center text-red-600 text-xs">
                                <XCircleIcon className="w-3 h-3 mr-1" />
                                <span>Failed to update revision</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};