import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <nav className="nav container">
        <Link href="/" className="nav-brand">Storeforge</Link>
        <div className="nav-links">
          <Link href="/login" className="btn">Anmelden</Link>
          <Link href="/register" className="btn btn-primary">Kostenlos starten</Link>
        </div>
      </nav>

      <section className="hero container">
        <h1>Baue deinen eigenen Online-Shop – ganz ohne Code.</h1>
        <p>
          Registriere dich, erstelle deinen Shop und füge deine Produkte hinzu.
          Storeforge gibt dir eine eigene Storefront-URL, die du sofort teilen kannst.
        </p>
        <div className="btn-row">
          <Link href="/register" className="btn btn-primary">Jetzt kostenlos registrieren</Link>
          <Link href="/login" className="btn">Ich habe bereits einen Account</Link>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card">
          <h3>In Minuten startklar</h3>
          <p>Registrieren, Shop-Namen wählen, Produkte hinzufügen – deine Storefront ist sofort live.</p>
        </div>
        <div className="feature-card">
          <h3>Eigene Storefront-URL</h3>
          <p>Jeder Shop bekommt eine eigene, teilbare Seite unter /s/dein-shop.</p>
        </div>
        <div className="feature-card">
          <h3>Volle Kontrolle</h3>
          <p>Verwalte beliebig viele Shops und Produkte über dein persönliches Dashboard.</p>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Storeforge</footer>
    </>
  );
}
