import CodeEntryForm from '@/components/CodeEntryForm';
import FaqAccordion from '@/components/FaqAccordion';
import Image from 'next/image';

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
          padding: '72px 24px 56px',
          maxWidth: 1000,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 48,
        }}
      >
        <div style={{ flex: '1 1 380px', maxWidth: 560 }}>
          <p style={{ color: 'var(--accent)', fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Ежегодная премия сервера
          </p>
          <h1 style={{ fontSize: 'clamp(44px, 8vw, 88px)', lineHeight: 1, marginTop: 14 }}>
            SWAG
            <br />
            <span className="gradient-text">AWARDS</span>
          </h1>
          <div style={{ width: 120, height: 1, background: 'var(--accent)', margin: '24px 0' }} />
          <p className="muted" style={{ fontSize: 17, marginBottom: 28 }}>
            Голосование, где лучших выбираешь ты
          </p>

          <CodeEntryForm />
          <a href="/awards/results" className="muted" style={{ display: 'inline-block', marginTop: 18, textDecoration: 'underline' }}>
            Смотреть результаты
          </a>
        </div>

        <Image
          src="/logo.png"
          alt=""
          width={300}
          height={300}
          priority
          style={{ filter: 'drop-shadow(0 0 40px color-mix(in srgb, var(--accent) 30%, transparent))', maxWidth: '60%', height: 'auto' }}
        />
      </section>

      <section style={{ padding: '48px 24px 96px', maxWidth: 640, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, textAlign: 'center', marginBottom: 24 }}>Как это устроено</h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>
    </main>
  );
}
