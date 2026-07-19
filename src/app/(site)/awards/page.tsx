import CodeEntryForm from '@/components/CodeEntryForm';
import FaqAccordion from '@/components/FaqAccordion';

const FAQ_ITEMS = [
  {
    question: 'Как проголосовать?',
    answer: 'Введи свой персональный код на этой странице — тебе его выдал организатор. По коду откроется голосование по всем номинациям подряд.',
  },
  {
    question: 'Можно ли поменять голос после отправки?',
    answer: 'Нет — после отправки код помечается использованным и повторно открыть голосование по нему нельзя. Выбирай внимательно на каждом шаге.',
  },
  {
    question: 'Можно проголосовать за несколько человек в одной номинации?',
    answer: 'Нет, только один вариант в каждой номинации — как и полагается в приличной премии.',
  },
  {
    question: 'Когда объявят результаты?',
    answer: 'После того как организатор закроет голосование — обычно это делается в день события. Следи за этой страницей.',
  },
];

export default function AwardsPage() {
  return (
    <main style={{ minHeight: '100vh' }}>
      <section
        style={{
          padding: '96px 24px 64px',
          textAlign: 'center',
          maxWidth: 720,
          margin: '0 auto',
        }}
      >
        <span className="pill accent" style={{ marginBottom: 20, display: 'inline-flex' }}>🏆 Ежегодная премия сервера</span>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(40px, 8vw, 72px)', marginTop: 16, marginBottom: 16 }}>
          SWAG AWARDS
        </h1>
        <p className="muted" style={{ fontSize: 16, marginBottom: 40 }}>
          Голосование, где лучших выбираешь ты
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <CodeEntryForm />
          <a href="/awards/results" className="muted" style={{ textDecoration: 'underline' }}>
            Смотреть результаты
          </a>
        </div>
      </section>

      <section style={{ padding: '48px 24px 96px', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, textAlign: 'center', marginBottom: 24 }}>Как это устроено</h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>
    </main>
  );
}
