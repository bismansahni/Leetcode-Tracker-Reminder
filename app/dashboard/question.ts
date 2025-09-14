export type Question = {
    id: number;
    url: string;
    numberofrevision: number;
};

export type MasteryLevel = 'Solved Once' | 'Learning' | 'Practiced' | 'Mastered';

export type Metrics = {
    averageRevisions: number;
    mastered: number
    needingPractice: number;
    neverRevised: number;
    practiced: number;
    total: number;
    wellPracticed: number;
}

export type Distribution = {
    bucket: string;
    count: number;
}

export type Top5 = {
    id: number;
    url: string;
    numberofrevision: number;
    title: string;
}