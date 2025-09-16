export interface TodayQuestion {
    first_question_id: string | null;
    first_question_url: string | null;
    first_question_solved: boolean | null;
    second_question_id: string | null;
    second_question_url: string | null;
    second_question_solved: boolean | null;
}

export interface ApiResponse {
    status: string;
    message?: string;
    first_question_id: string | null;
    first_question_url: string | null;
    first_question_solved: boolean | null;
    second_question_id: string | null;
    second_question_url: string | null;
    second_question_solved: boolean | null;
}

export interface QuestionCardProps {
    questionNumber: string;
    questionId: string | null;
    questionUrl: string | null;
    questionSolved: boolean | null;
    onRevisionUpdate?: () => void;
}

export interface UpdateRevisionResponse {
    status: string;
    message: string;
    updated_ids?: number[];
}