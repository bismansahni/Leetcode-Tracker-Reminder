export type StatCardProps = {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    title: string;
    value: number | string;
    subtitle?: string;
    color?: ColorKey;
};

export type ColorKey = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

export const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses: Record<ColorKey, string> = {
        blue: 'border-blue-500 text-blue-500',
        green: 'border-green-500 text-green-500',
        purple: 'border-purple-500 text-purple-500',
        orange: 'border-orange-500 text-orange-500',
        red: 'border-red-500 text-red-500',
        yellow: 'border-yellow-500 text-yellow-500',
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${colorClasses[color]}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900">{value}</p>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
                <Icon className="text-inherit" />
            </div>
        </div>
    );
};