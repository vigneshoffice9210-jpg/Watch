import { useApi, useTitle } from '../lib/hooks';
import { ErrorNote, PageHeader, Spinner } from '../components/ui';
import { BRAND } from '../config';

export default function Policies() {
  useTitle('Policies');
  const { data, loading, error } = useApi('/policies');
  return (
    <>
      <PageHeader lines={['POLICIES.']}>How we ship, how returns and refunds work, and how your information is treated.</PageHeader>
      <div className="container-x grid gap-12 py-10 lg:grid-cols-[220px_1fr]">
        {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : (
          <>
            <nav className="hidden lg:block">
              <ul className="sticky top-28 space-y-3 text-[11px] uppercase tracking-[0.2em]">
                {data.policies.map((p) => <li key={p.slug}><a href={`#${p.slug}`} className="text-muted-foreground hover:text-primary">{p.title}</a></li>)}
              </ul>
            </nav>
            <div className="max-w-3xl space-y-14">
              {data.policies.map((p) => (
                <section key={p.slug} id={p.slug} data-reveal className="scroll-mt-28">
                  <h2 className="font-serif text-3xl">{p.title}</h2>
                  <div className="gold-line my-5 w-24 opacity-60" />
                  <div className="space-y-4 text-sm leading-relaxed text-foreground/85">{p.body.split(/\n+/).map((t, i) => <p key={i}>{t}</p>)}</div>
                </section>
              ))}
              <p className="text-sm text-muted-foreground">Questions? WhatsApp us at <a className="text-primary" href={`https://wa.me/${BRAND.whatsappNumber}`}>{BRAND.whatsappDisplay}</a>.</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
