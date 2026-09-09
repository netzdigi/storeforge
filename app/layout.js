import './globals.css';

export const metadata = {
  title: 'Storeforge – Baue deinen eigenen Online-Shop',
  description:
    'Registriere dich und erstelle in Minuten deinen eigenen Online-Shop oder deine Website.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
