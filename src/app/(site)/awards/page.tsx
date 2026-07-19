import Link from 'next/link';
import CodeEntryForm from '@/components/CodeEntryForm';

export default function AwardsPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 24,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <p className="pill accent">SWAG Awards</p>
        <h1 style={{ fontSize: 34, marginTop: 12 }}>Голосование</h1>
        <p className="muted">Введи свой персональный код, чтобы проголосовать</p>
      </div>

      <CodeEntryForm />

      <Link href="/awards/results">
        <button className="secondary">Смотреть прошлые результаты</button>
      </Link>
    </main>
  );
}
