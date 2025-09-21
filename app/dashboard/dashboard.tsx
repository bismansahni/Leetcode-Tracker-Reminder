'use client';

import { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import type { Question, MasteryLevel, Metrics, Distribution, Top5 } from '@/app/dashboard/question';
import { StatCard } from '@/app/components/dashboard-components/StatCardProps';
import {BookOpenIcon, AwardIcon, TargetIcon, TrendingUpIcon, RotateCcwIcon} from "@/app/components/dashboard-components/icons";
import TodaysQuestions from "@/app/components/todayquestion-components/todayquestion";

export default function LeetCodeDashboard() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [serverMetrics, setServerMetrics] = useState<Metrics>({
        averageRevisions: 0,
        mastered: 0,
        needingPractice: 0,
        neverRevised: 0,
        practiced: 0,
        total: 0,
        wellPracticed: 0
    });
    const [mostRevised, setMostRevised] = useState<Top5[]>([]);
    const [revisionDistribution, setRevisionDistribution] = useState<Distribution[]>([]);

    useEffect(() => {
        async function fetchQuestions() {
            try {
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

                setServerMetrics(payload.metrics || {});
                setRevisionDistribution(payload.revisionDistribution);
                setMostRevised(payload.top5);
                setQuestions(serverQuestions);

            } catch (err) {
                console.error('Error fetching questions:', err);
                throw new Error('Questions could not be loaded');
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                        <div className="w-16 h-16 border-4 border-transparent border-t-gray-400 rounded-full animate-spin absolute top-0"></div>
                    </div>
                    <div className="text-gray-600 font-medium">Loading analytics...</div>
                </div>
            </div>
        );
    }

    // Data Processing
    const totalQuestionsSolved: number = serverMetrics.total;
    const averageRevisions: number = serverMetrics.averageRevisions;
    const neverRevised: number = serverMetrics.neverRevised;
    const wellPracticed: number = serverMetrics.wellPracticed;
    const needingPractice: number = serverMetrics.needingPractice;
    const revisionRate: number = totalQuestionsSolved > 0 ? Math.round(((totalQuestionsSolved - neverRevised) / totalQuestionsSolved) * 100) : 0;
    const mostRevisedQuestions: Top5[] = mostRevised;
    const maxRevisions = mostRevised.length > 0 ? mostRevised[0].numberofrevision : 0;

    const revisionDistributionData = revisionDistribution.map(({ bucket, count }) => ({
        name: bucket === '6+' ? '6+' : bucket,
        count: count,
    }));

    const masteryLevels: Record<MasteryLevel, number> = {
        'Solved Once': serverMetrics.neverRevised,
        Learning: serverMetrics.needingPractice,
        Practiced: serverMetrics.wellPracticed,
        Mastered: serverMetrics.mastered,
    };

    const masteryData = (Object.entries(masteryLevels) as [MasteryLevel, number][])
        .map(([level, count]) => ({
            name: level,
            value: count,
            percentage: totalQuestionsSolved > 0 ? Math.round((count / totalQuestionsSolved) * 100) : 0,
        }));

    // Soft Apple-inspired colors
    const colors = {
        mastery: {
            'Solved Once': '#FF6B6B',
            Learning: '#FFD93D',
            Practiced: '#6BCF7F',
            Mastered: '#4ECDC4',
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Decorative gradient orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-gradient-to-br from-green-100 to-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-4000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <header className="glass-header sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="heading-hero text-gray-900">
                                    LeetCode Tracker
                                </h1>
                                <p className="text-sm text-gray-600 mt-2">Track your problem-solving journey</p>
                            </div>
                            <div className="glass-card px-4 py-2 rounded-2xl">
                                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Synced</p>
                                <p className="text-sm text-gray-700 font-medium">{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Today's Challenges */}
                    <section className="mb-10 animate-slideUp">
                        <TodaysQuestions />
                    </section>

                    {/* Key Metrics */}
                    <section className="mb-10 animate-slideUp">
                        <h2 className="heading-section text-gray-800 mb-6">Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all card-animate">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{totalQuestionsSolved}</p>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">Total Solved</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <BookOpenIcon className="w-6 h-6 text-gray-700" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all card-animate">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{averageRevisions.toFixed(1)}</p>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">Avg Revisions</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
                                        <TrendingUpIcon className="w-6 h-6 text-cyan-700" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all card-animate">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{revisionRate}%</p>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">Revision Rate</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                                        <RotateCcwIcon className="w-6 h-6 text-green-700" />
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-all card-animate">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-gray-900">{serverMetrics.mastered}</p>
                                        <p className="text-sm text-gray-600 mt-1 font-medium">Mastered</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                                        <AwardIcon className="w-6 h-6 text-purple-700" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Progress Distribution */}
                    <section className="mb-10 animate-slideUp" style={{animationDelay: '100ms'}}>
                        <h2 className="heading-section text-gray-800 mb-6">Progress Distribution</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Mastery Donut Chart */}
                            <div className="lg:col-span-2 glass-card rounded-2xl p-6">
                                <h3 className="heading-card text-gray-700 mb-4">Mastery Levels</h3>
                                <div className="flex items-center justify-between">
                                    <ResponsiveContainer width="60%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={masteryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={4}
                                                dataKey="value"
                                            >
                                                {masteryData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={colors.mastery[entry.name as MasteryLevel]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-3">
                                        {masteryData.map((item) => (
                                            <div key={item.name} className="flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors.mastery[item.name as MasteryLevel] }}></div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-700">{item.name}</p>
                                                    <p className="text-xs text-gray-500">{item.value} problems • {item.percentage}%</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Progress Cards */}
                            <div className="space-y-4">
                                <div className="glass-card rounded-2xl p-4 border-l-4 border-red-300">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Need Attention</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{neverRevised}</p>
                                            <p className="text-xs text-gray-500 mt-1">Never revised</p>
                                        </div>
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                </div>

                                <div className="glass-card rounded-2xl p-4 border-l-4 border-yellow-300">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">In Progress</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{needingPractice}</p>
                                            <p className="text-xs text-gray-500 mt-1">1-2 revisions</p>
                                        </div>
                                        <span className="text-2xl">📚</span>
                                    </div>
                                </div>

                                <div className="glass-card rounded-2xl p-4 border-l-4 border-green-300">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">Well Done</p>
                                            <p className="text-2xl font-bold text-gray-900 mt-1">{wellPracticed}</p>
                                            <p className="text-xs text-gray-500 mt-1">3+ revisions</p>
                                        </div>
                                        <span className="text-2xl">✨</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Revision Chart */}
                    <section className="mb-10 animate-slideUp" style={{animationDelay: '200ms'}}>
                        <h2 className="heading-section text-gray-800 mb-6">Revision Analysis</h2>
                        <div className="glass-card rounded-2xl p-6">
                            <h3 className="heading-card text-gray-700 mb-4">Distribution by Revision Count</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={revisionDistributionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis
                                        tick={{ fill: '#6b7280', fontSize: 12 }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Bar dataKey="count" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4ECDC4" stopOpacity={0.8}/>
                                            <stop offset="100%" stopColor="#44A3A0" stopOpacity={0.6}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    {/* Most Revised */}
                    <section className="animate-slideUp" style={{animationDelay: '300ms'}}>
                        <h2 className="heading-section text-gray-800 mb-6">Focus Areas</h2>
                        <div className="glass-card rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50/50 to-white/50 backdrop-blur">
                                <h3 className="heading-card text-gray-700">Most Revised Problems</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {mostRevisedQuestions.map((question, index) => (
                                    <div key={question.id} className="px-6 py-4 hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-sm">
                                                    {index + 1}
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-gray-900 capitalize">
                                                        {question.title}
                                                    </p>
                                                    <a
                                                        href={question.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                                    >
                                                        View on LeetCode →
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800">
                                                    {question.numberofrevision} revisions
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

// Add these imports at the top if not already present
function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function XCircleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}