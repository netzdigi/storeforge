import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <nav className="nav container">
        <Link href="/" className="nav-brand">Storeforge</Link>
        <div className="nav-links">
          <Link href="/login" className="btn">Вход</Link>
          <Link href="/register" className="btn btn-primary">Започни безплатно</Link>
        </div>
      </nav>

      <section className="hero container">
        <h1>Създай своя онлайн магазин – без нито ред код.</h1>
        <p>
          Регистрирай се, създай своя магазин и добави продуктите си за минути.
          Storeforge ти дава собствен адрес за магазина, който можеш да споделиш веднага
          с клиентите си в социалните мрежи или по имейл.
        </p>
        <div className="btn-row">
          <Link href="/register" className="btn btn-primary">Регистрирай се безплатно</Link>
          <Link href="/login" className="btn">Вече имам акаунт</Link>
        </div>
      </section>

      <section className="features container">
        <div className="feature-card">
          <h3>Готов за минути</h3>
          <p>Регистрирай се, избери име на магазина и добави продукти — твоят магазин е онлайн веднага, без техническо обучение.</p>
        </div>
        <div className="feature-card">
          <h3>Собствен адрес на магазина</h3>
          <p>Всеки магазин получава собствена, лесна за споделяне страница на /s/твоя-магазин — готова да я покажеш на клиенти.</p>
        </div>
        <div className="feature-card">
          <h3>Пълен контрол</h3>
          <p>Управлявай неограничен брой магазини и продукти от личния си панел, по всяко време и от всяко устройство.</p>
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} Storeforge</footer>
    </>
  );
}
