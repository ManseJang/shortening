import "./globals.css";

export const metadata = {
  title: "약수 - URL 단축 서비스",
  description: "간편하고 빠른 URL 단축 서비스",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        {children}
      </body>
    </html>
  );
}
