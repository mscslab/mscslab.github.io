export const metadata = {
  title: "یه دعوت کوچولو 💌",
  description: "یک دعوت کوچولو برای یک قرار خیلی دوست‌داشتنی",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
