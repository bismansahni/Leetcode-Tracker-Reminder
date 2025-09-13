'use client';

import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import type { Question, MasteryLevel } from '@/app/dashboard/question';
import { StatCard } from '@/app/components/dashboard-components/StatCardProps';
import {BookOpenIcon, AwardIcon, TargetIcon, TrendingUpIcon, RotateCcwIcon} from "@/app/components/dashboard-components/icons";

export default function LeetCodeDashboard() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                //caching (12h TTL comes from API headers) because the background worker updates the db every 24 hours
                const res = await fetch('/api/get-dashboard', { cache: 'force-cache' });

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const payload = await res.json();

                const serverQuestions: Question[] = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.questions)
                        ? payload.questions
                        : [];

                setQuestions(serverQuestions);
            } catch (err) {
                console.error('Error fetching questions:', err);

                setQuestions([
                    { id: 1, url: 'https://leetcode.com/problems/two-sum/', numberofrevision: 0 },
                ]);
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-600">Loading dashboard...</div>
            </div>
        );
    }

    // Question Count Analytics
    const totalQuestionsSolved = questions.length;

    const revisionCounts = questions.reduce<Record<string, number>>((acc, q) => {
        const key = q.numberofrevision >= 6 ? '6+' : q.numberofrevision.toString();
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});

    const revisionDistributionData = Object.entries(revisionCounts).map(([revisions, count]) => ({
        revisions: `${revisions} revision${revisions === '1' ? '' : 's'}`,
        count,
        percentage: totalQuestionsSolved > 0 ? Math.round((count / totalQuestionsSolved) * 100) : 0,
    }));

    const averageRevisions =
        totalQuestionsSolved > 0 ? questions.reduce((sum, q) => sum + q.numberofrevision, 0) / totalQuestionsSolved : 0;

    // Revision-Based Analytics
    const neverRevised = questions.filter((q) => q.numberofrevision === 0).length;
    const wellPracticed = questions.filter((q) => q.numberofrevision >= 3).length;
    const needingPractice = questions.filter((q) => q.numberofrevision >= 1 && q.numberofrevision <= 2).length;
    const revisionRate = totalQuestionsSolved > 0 ? Math.round(((totalQuestionsSolved - neverRevised) / totalQuestionsSolved) * 100) : 0;

    const mostRevisedQuestions = [...questions]
        .sort((a, b) => b.numberofrevision - a.numberofrevision)
        .slice(0, 5)
        .map((q) => ({
            ...q,
            title: q.url.split('/problems/')[1]?.split('/')[0]?.replace(/-/g, ' ') || 'Problem',
        }));

    // Progress Analytics - Mastery Level Distribution
    const masteryLevels: Record<MasteryLevel, number> = {
        'Solved Once': questions.filter((q) => q.numberofrevision === 0).length,
        Learning: questions.filter((q) => q.numberofrevision >= 1 && q.numberofrevision <= 2).length,
        Practiced: questions.filter((q) => q.numberofrevision >= 3 && q.numberofrevision <= 4).length,
        Mastered: questions.filter((q) => q.numberofrevision >= 5).length,
    };

    const masteryData = (Object.entries(masteryLevels) as [MasteryLevel, number][])
        .map(([level, count]) => ({
            level,
            count,
            percentage: totalQuestionsSolved > 0 ? Math.round((count / totalQuestionsSolved) * 100) : 0,
        }));

    // Chart colors
    const masteryColors: Record<MasteryLevel, string> = {
        'Solved Once': '#ef4444',
        Learning: '#f59e0b',
        Practiced: '#10b981',
        Mastered: '#8b5cf6',
    };

    const maxRevisions = questions.length > 0 ? Math.max(...questions.map((q) => q.numberofrevision)) : 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">LeetCode Analytics Dashboard</h1>

                {/* Question Count Analytics */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Question Count Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <StatCard icon={BookOpenIcon} title="Total Questions Solved" value={totalQuestionsSolved} color="blue" />
                        <StatCard icon={TrendingUpIcon} title="Average Revisions" value={averageRevisions.toFixed(1)} subtitle="per question" color="green" />
                        <StatCard icon={RotateCcwIcon} title="Revision Rate" value={`${revisionRate}%`} subtitle="questions revised" color="purple" />
                        <StatCard icon={TargetIcon} title="Most Revised" value={maxRevisions} subtitle="times" color="orange" />
                    </div>

                    {/* Revision Distribution Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Revision Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revisionDistributionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="revisions" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => [value, 'Questions'] as unknown as [string, string]} />
                                    <Bar dataKey="count" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Revision-Based Analytics */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Revision-Based Analytics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <StatCard
                            icon={BookOpenIcon}
                            title="Solved Once (No Revisions)"
                            value={neverRevised}
                            subtitle={`${Math.round((neverRevised / Math.max(totalQuestionsSolved, 1)) * 100)}% of total`}
                            color="red"
                        />
                        <StatCard icon={AwardIcon} title="Well-Practiced" value={wellPracticed} subtitle="solved + 3+ revisions" color="green" />
                        <StatCard icon={TargetIcon} title="Needing More Practice" value={needingPractice} subtitle="solved + 1-2 revisions" color="yellow" />
                    </div>

                    {/* Most Revised Questions */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Most Revised Questions</h3>
                        <div className="overflow-hidden">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problem</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revisions</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {mostRevisedQuestions.map((question) => (
                                    <tr key={question.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{question.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {question.numberofrevision}
                        </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                            <a href={question.url} target="_blank" rel="noopener noreferrer" className="truncate max-w-xs block">
                                                {question.url}
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Progress Analytics - Mastery Level Distribution */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Progress Analytics</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        {masteryData.map((level) => (
                            <StatCard
                                key={level.level}
                                icon={level.level === 'Solved Once' ? BookOpenIcon : level.level === 'Learning' ? TargetIcon : level.level === 'Practiced' ? TrendingUpIcon : AwardIcon}
                                title={level.level}
                                value={level.count}
                                subtitle={`${level.percentage}% of total`}
                                color={level.level === 'Solved Once' ? 'red' : level.level === 'Learning' ? 'yellow' : level.level === 'Practiced' ? 'green' : 'purple'}
                            />
                        ))}
                    </div>

                    {/* Mastery Level Pie Chart */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Mastery Level Distribution</h3>
                        <div className="flex flex-col lg:flex-row items-center">
                            <div className="h-80 w-full lg:w-1/2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={masteryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            dataKey="count"
                                            label={({ level, percentage }: { level: MasteryLevel; percentage: number }) => `${level}: ${percentage}%`}
                                        >
                                            {masteryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={masteryColors[entry.level]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => [value, 'Questions'] as unknown as [string, string]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full lg:w-1/2 lg:pl-8">
                                <div className="space-y-4">
                                    {masteryData.map((level) => (
                                        <div key={level.level} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center">
                                                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: masteryColors[level.level] }} />
                                                <span className="font-medium text-gray-700">{level.level}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">{level.count}</div>
                                                <div className="text-sm text-gray-500">{level.percentage}%</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
