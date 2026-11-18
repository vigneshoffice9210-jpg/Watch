import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useApi, useTitle } from '../lib/hooks';
import { ErrorNote, PageHeader, Spinner } from '../components/ui';

export default function Care() {
  useTitle('Watch Care Hub');
  const { data, loading, error } = useApi('/care');
  return (
    <>
      <PageHeader eyebrow="Watch Care Hub" lines={['CARE FOR', 'YOUR TIME.']}>Simple guides to keep your timepiece accurate, clean and beautiful for years.</PageHeader>
      <div className="container-x py-10">
        {loading ? <Spinner /> : error ? <ErrorNote error={error} /> : (
          <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((a, i) => (
              <Link key={a.slug} to={`/care/${a.slug}`} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="group relative bg-background p-8 transition-colors duration-500 hover:bg-card">
                <p className="eyebrow">{a.category} · {a.readMinutes} min</p>
                <h2 className="mt-6 font-serif text-2xl group-hover:text-primary">{a.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{a.excerpt}</p>
                <ArrowUpRight className="absolute right-6 top-7 h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
