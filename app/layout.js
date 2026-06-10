import './globals.css';

export const metadata = {
  title: 'Land for Loan • เพื่อนชวนเพื่อน',
  description: 'ชวนเพื่อนลงทุนจำนอง–ขายฝาก รับค่าแนะนำ 10,000 บาท/รายชื่อ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
