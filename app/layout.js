import './globals.css';

export const metadata = {
  title: 'Storeforge – Създай своя онлайн магазин',
  description:
    'Регистрирай се и създай за минути своя собствен онлайн магазин или уебсайт.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}
