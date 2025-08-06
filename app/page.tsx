export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">LeetCode Tracker</h1>
      <div className="space-y-4">
        <p>This is a serverless LeetCode practice tracker running on Vercel.</p>
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">API Endpoints:</h2>
          <ul className="space-y-2 font-mono text-sm">
            <li>/api/hit-main?token=YOUR_TOKEN - Fetch questions and send email</li>
            <li>/api/commit-question?token=YOUR_TOKEN&id1=X&id2=Y - Update revision count</li>
            <li>/api/cron/daily-update - Automated daily update (Vercel Cron)</li>
          </ul>
        </div>
      </div>
    </main>
  );
}