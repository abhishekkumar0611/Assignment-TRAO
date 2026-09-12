import "./globals.css";

export const metadata = {
  title: "InterviewKit",
  description: "AI-powered interview preparation platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}