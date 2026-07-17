import { LoginForm } from '@/features/auth-login';
import { Container } from '@/shared/ui';

interface LoginPageContentProps {
  redirectTo: string;
}

/**
 * Рендерит route-private editorial экран логина.
 */
export function LoginPageContent({ redirectTo }: Readonly<LoginPageContentProps>) {
  return (
    <Container as="main" className="flex min-h-dvh items-center py-6 sm:py-10 lg:py-14">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-2xl bg-card shadow-[0_20px_55px_rgb(20_29_45_/_12%)] ring-1 ring-border lg:min-h-[620px] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <aside className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="absolute top-20 -left-48 size-96 rounded-full border border-primary-foreground/15"
          />
          <div
            aria-hidden="true"
            className="absolute -right-32 -bottom-28 size-72 rounded-full border border-primary-foreground/10"
          />

          <div className="relative z-10 flex items-center gap-3 text-xs font-bold tracking-[0.08em] uppercase">
            <span className="relative size-7 rounded-[0.55rem_0.55rem_0.55rem_0.2rem] bg-primary-foreground">
              <span className="absolute top-1.5 left-2.5 size-1.5 rounded-full bg-primary" />
            </span>
            Стрельчук
          </div>

          <p className="relative z-10 max-w-sm font-heading text-4xl leading-[1.12] font-bold tracking-[-0.035em]">
            Места и материалы о городе — в одном личном пространстве.
          </p>

          <p className="relative z-10 text-xs leading-relaxed text-primary-foreground/65">
            Екатеринбург
            <br />
            Публичный городской каталог
          </p>
        </aside>

        <div className="flex items-center bg-card px-5 py-10 sm:px-10 lg:px-14">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8 flex items-center gap-2 text-xs font-bold tracking-[0.07em] text-primary uppercase lg:hidden">
              <span className="relative size-6 rounded-[0.5rem_0.5rem_0.5rem_0.2rem] bg-primary">
                <span className="absolute top-1.5 left-2 size-1.5 rounded-full bg-primary-foreground" />
              </span>
              Стрельчук · Екатеринбург
            </div>

            <header className="mb-6">
              <h1 className="font-heading text-4xl leading-none font-bold tracking-[-0.045em]">
                С возвращением
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Войдите, чтобы продолжить работу с местами.
              </p>
            </header>

            <LoginForm redirectTo={redirectTo} />
          </div>
        </div>
      </section>
    </Container>
  );
}
