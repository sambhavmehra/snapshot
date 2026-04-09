import { Inter } from 'next/font/google';
import "./globals.css";
import { Providers } from "./Providers";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
  title: "SnapStudy - AI-Powered Visual Learning",
  description: "SnapStudy helps students upload diagrams, handwritten notes, textbook pages, and files, then converts them into structured analysis, tutor-led conversations, and editable notes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
