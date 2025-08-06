export const metadata = {
  title: 'LeetCode Tracker',
  description: 'Track your LeetCode practice progress',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}