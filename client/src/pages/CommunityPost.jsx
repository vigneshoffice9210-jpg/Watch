import { Link, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useApi, useTitle } from '../lib/hooks';
import { formatDate, formatPrice } from '../lib/format';
import { Button, Empty, Spinner } from '../components/ui';
import { LikeButton } from './Community';

export default function CommunityPost() {
  const { id } = useParams();
  const { data, loading, error } = useApi(`/community/${id}`);
  useTitle('Style Board');
  if (loading) return <Spinner />;
  if (error) return <div className="container-x py-20"><Empty title="Post not found" action={<Button to="/community">Back to Style Board</Button>} /></div>;
  const { post, product } = data;
  return (
    <div className="container-x grid gap-10 py-12 lg:grid-cols-[1.3fr_1fr]">
      <img src={post.image} alt={post.caption} className="w-full border border-border" />
      <div>
        <Link to="/community" className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground hover:text-primary">← Style Board</Link>
        <p className="mt-6 font-serif text-3xl leading-snug">"{post.caption}"</p>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span>{post.authorName} · {formatDate(post.createdAt)}</span>
          <LikeButton post={post} />
        </div>
        {product && (
          <div className="mt-10 border border-gold/30 p-5">
            <p className="eyebrow mb-4">Wearing</p>
            <div className="flex items-center gap-4">
              <img src={product.image} alt="" className="h-20 w-20 bg-ivory object-contain p-1" />
              <div>
                <p className="text-[9px] uppercase tracking-[0.22em] text-primary">{product.brand}</p>
                <Link to={`/product/${product.slug}`} className="font-serif text-xl hover:text-primary">{product.name}</Link>
                <p className="text-sm">{formatPrice(product.price)}</p>
              </div>
            </div>
            <Button size="sm" className="mt-4" to={`/try-on?watch=${product.slug}`}><Sparkles /> Try it on</Button>
          </div>
        )}
      </div>
    </div>
  );
}
