import { Link, useParams } from 'react-router-dom';
import { useApi, useTitle } from '../lib/hooks';
import { Button, Empty, Spinner } from '../components/ui';
import { BRAND } from '../config';

export default function CareArticle() {
  const { slug } = useParams();
  const { data, loading, error } = useApi(`/care/${slug}`);
  useTitle(data?.article?.title || 'Watch Care Hub');
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-20"><Empty title="Article not found" action={<Button to="/care">All guides</Button>} /></div>;
  const a = data.article;
  return (
    <article className="container-x max-w-3xl py-14">
      <Link to="/care" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary">← Watch Care Hub</Link>
      <p className="eyebrow mt-8">{a.category} · {a.readMinutes} min read</p>
      <h1 className="mt-4 font-serif text-5xl leading-tight">{a.title}</h1>
      <p className="mt-4 font-serif text-xl italic text-muted-foreground">{a.excerpt}</p>
      <div className="gold-line my-10 opacity-40" />
      <div className="space-y-5 text-base leading-relaxed text-foreground/85">
        {a.body.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
      </div>
      <div className="mt-14 border border-gold/30 p-6">
        <p className="font-serif text-xl">Need help with your watch?</p>
        <p className="mt-1 text-sm text-muted-foreground">Our team is a message away.</p>
        <Button className="mt-4" href={`https://wa.me/${BRAND.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp us</Button>
      </div>
    </article>
  );
}
