'use client';

import { useEffect, useState, useCallback } from 'react';
import { CheckCircleIcon, XCircleIcon, ExternalLinkIcon, CalendarIcon } from '@/app/components/todayquestion-components/icons';
import { TodayQuestion, ApiResponse } from "@/app/components/todayquestion-components/todayquuestion-interface";
import { QuestionCard } from '@/app/components/todayquestion-components/questioncard';

export default function TodaysQuestions() {
    const [todayData, setTodayData] = useState<TodayQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTodaysQuestions = useCallback(async () => {
        try {
            const response = await fetch('/api/fetch-today-question', {
                cache: 'no-store'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.status === 'error') {
                throw new Error(data.message || 'Failed to fetch today\'s questions');
            }

            setTodayData({
                first_question_id: data.first_question_id,
                first_question_url: data.first_question_url,
                first_question_solved: data.first_question_solved,
                second_question_id: data.second_question_id,
                second_question_url: data.second_question_url,
                second_question_solved: data.second_question_solved,
            });
        } catch (err) {
            console.error('Error fetching today\'s questions:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodaysQuestions();
    }, [fetchTodaysQuestions]);

    // Callback to refresh data after revision update
    const handleRevisionUpdate = useCallback(async () => {
        await fetchTodaysQuestions();
    }, [fetchTodaysQuestions]);

    // Handle update_token update
    const handleUpdateToken = () => {
        const newToken = prompt("Enter the new secret_token:");
        if (newToken) {
            localStorage.setItem("update_token", newToken);
            alert("Token updated successfully!");
        }
    };

    if (loading) {
        return (
            <div className="glass-card rounded-2xl p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200/50 rounded-lg w-48 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200/50 rounded-lg w-full"></div>
                        <div className="h-4 bg-gray-200/50 rounded-lg w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !todayData) {
        return (
            <div className="glass-card rounded-2xl p-6 border-l-4 border-red-300">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                        <p className="text-sm font-medium text-gray-900">Failed to load today's questions</p>
                        <p className="text-xs text-gray-500 mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const solvedCount = [
        todayData?.first_question_solved === true,
        todayData?.second_question_solved === true
    ].filter(Boolean).length;

    const totalQuestions = [
        todayData?.first_question_id,
        todayData?.second_question_id
    ].filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="heading-section text-gray-800 flex items-center gap-3">
                            Today's Challenges
                            <span className="text-xs bg-white/80 backdrop-blur px-3 py-1 rounded-full font-medium text-gray-600">
                                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-2">Complete both problems to maintain your streak</p>
                    </div>
                    <button
                        onClick={handleUpdateToken}
                        className="glass-card px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-white/80 transition-all"
                    >
                        Update Token
                    </button>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">Daily Progress</span>
                        <span className="font-bold text-gray-800">{solvedCount}/{totalQuestions} Completed</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-3 overflow-hidden backdrop-blur">
                        <div
                            className={`h-3 rounded-full transition-all duration-500 ${
                                solvedCount === 0
                                    ? 'bg-gradient-to-r from-gray-300 to-gray-400'
                                    : solvedCount === totalQuestions
                                        ? 'bg-gradient-to-r from-teal-400 to-cyan-400'
                                        : 'bg-gradient-to-r from-yellow-400 to-orange-400'
                            }`}
                            style={{ width: totalQuestions > 0 ? `${(solvedCount / totalQuestions) * 100}%` : '0%' }}
                        />
                    </div>
                    {solvedCount === totalQuestions && totalQuestions > 0 && (
                        <div className="flex items-center mt-3 text-teal-700">
                            <span className="text-xl mr-2">🎉</span>
                            <span className="text-sm font-medium">Great job! Daily goal achieved!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuestionCard
                    questionNumber="First"
                    questionId={todayData?.first_question_id ?? null}
                    questionUrl={todayData?.first_question_url ?? null}
                    questionSolved={todayData?.first_question_solved ?? null}
                    onRevisionUpdate={handleRevisionUpdate}
                />

                <QuestionCard
                    questionNumber="Second"
                    questionId={todayData?.second_question_id ?? null}
                    questionUrl={todayData?.second_question_url ?? null}
                    questionSolved={todayData?.second_question_solved ?? null}
                    onRevisionUpdate={handleRevisionUpdate}
                />
            </div>
        </div>
    );
}