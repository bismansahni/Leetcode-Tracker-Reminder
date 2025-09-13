import LeetCodeDashboard from './dashboard';

const analytics = Number(process.env.NEXT_PUBLIC_ANALYTICS_FLAG);

export default function DashboardPage() {
  if (analytics === 1) {
    return <LeetCodeDashboard />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-semibold mb-4">Analytics Disabled</h2>
      <p className="text-gray-600 mb-2">
        To view analytics, please enable it by setting the analytics flag to <span className="font-bold">1</span>.
      </p>
    </div>
  );
}