import {QuestionCardProps} from "@/app/components/todayquestion-components/todayquuestion-interface";
import {
    CalendarIcon,
    CheckCircleIcon,
    ExternalLinkIcon,
    XCircleIcon
} from "@/app/components/todayquestion-components/icons";

export const QuestionCard = ({ questionNumber, questionId, questionUrl, questionSolved }: QuestionCardProps) => {
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
