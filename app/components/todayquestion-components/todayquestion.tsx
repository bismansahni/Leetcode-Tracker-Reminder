'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExternalLinkIcon, CalendarIcon } from '@/app/components/todayquestion-components/icons';

interface TodayQuestion {
    first_question_id: string | null;
    first_question_url: string | null;
    first_question_solved: string | null;
    second_question_id: string | null;
    second_question_url: string | null;
    second_question_solved: string | null;
}

interface ApiResponse {
    status: string;
    message?: string;
    first_question_id: string | null;
    first_question_url: string | null;
    first_question_solved: string | null;
    second_question_id: string | null;
    second_question_url: string | null;
    second_question_solved: string | null;
}

interface QuestionCardProps {
    questionNumber: string;
    questionId: string | null;
    questionUrl: string | null;
    questionSolved: string | null;
}

const QuestionCard = ({ questionNumber, questionId, questionUrl, questionSolved }: QuestionCardProps) => {
    const isSolved = questionSolved === 'true';
    const hasData = questionId && questionUrl;

    const getTitle = (url: string | null) => {
        if (!url) return 'No Question Available';
        const title = url.split('/problems/')[1]?.split('/')[0]?.replace(/-/g, ' ');
        return title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Problem';
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
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${isSolved ? 'border-green-500' : 'border-orange-500'}`}>
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

                <div className="pt-2">
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
                </div>
            </div>
        </div>
    );
};

export default function TodaysQuestions() {
    const [todayData, setTodayData] = useState<TodayQuestion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTodaysQuestions() {
            try {
                const response = await fetch('/api/fetch-today-question', {
                    cache: 'no-store' // Since your API sets no-cache headers
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

                // Fallback mock data for development
                setTodayData({
                    first_question_id: '1',
                    first_question_url: 'https://leetcode.com/problems/two-sum/',
                    first_question_solved: 'true',
                    second_question_id: '2',
                    second_question_url: 'https://leetcode.com/problems/add-two-numbers/',
                    second_question_solved: 'false',
                });
            } finally {
                setLoading(false);
            }
        }

        fetchTodaysQuestions();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-300 rounded w-48"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="space-y-4">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !todayData) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Today's Questions</h2>
                    <XCircleIcon className="w-6 h-6 text-red-500" />
                </div>
                <div className="text-center py-8">
                    <p className="text-red-600 mb-2">Failed to load today's questions</p>
                    <p className="text-sm text-gray-500">{error}</p>
                </div>
            </div>
        );
    }

    const solvedCount = [
        todayData?.first_question_solved === 'true',
        todayData?.second_question_solved === 'true'
    ].filter(Boolean).length;

    const totalQuestions = [
        todayData?.first_question_id,
        todayData?.second_question_id
    ].filter(Boolean).length;

    return (
        <div className="space-y-6 mb-7">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Today's Questions</h2>
                    <div className="flex items-center text-gray-600">
                        <CalendarIcon className="w-5 h-5 mr-2" />
                        <span className="text-sm">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mb-4 p-4 rounded-lg border bg-blue-50 border-blue-100">
                    <p className="text-sm text-blue-900">
                        Your daily LeetCode challenges. Complete both problems to maintain your streak!
                        <span className="ml-2 font-medium">
              Progress: {solvedCount}/{totalQuestions} completed
            </span>
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                            solvedCount === totalQuestions ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{ width: totalQuestions > 0 ? `${(solvedCount / totalQuestions) * 100}%` : '0%' }}
                    ></div>
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <QuestionCard
                    questionNumber="First"
                    questionId={todayData?.first_question_id}
                    questionUrl={todayData?.first_question_url}
                    questionSolved={todayData?.first_question_solved}
                />

                <QuestionCard
                    questionNumber="Second"
                    questionId={todayData?.second_question_id}
                    questionUrl={todayData?.second_question_url}
                    questionSolved={todayData?.second_question_solved}
                />
            </div>
        </div>
    );
}