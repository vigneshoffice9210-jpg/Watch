import { useEffect } from 'react';
import { Award, Gift, Truck, Crown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useTitle } from '../lib/hooks';
import { Button, PageHeader, cx } from '../components/ui';

const TIERS = [
  { name: 'Silver', min: 0, icon: Award, perks: ['1 point per ₹100 spent', 'Early access to Watch Drops'] },
  { name: 'Gold', min: 100, icon: Gift, perks: ['Free signature gift wrap', 'Birthday surprise', 'Everything in Silver'] },
  { name: 'Platinum', min: 300, icon: Truck, perks: ['Priority shipping', 'First look at The Vault', 'Everything in Gold'] },
  { name: 'Eternal', min: 750, icon: Crown, perks: ['Private WhatsApp concierge', 'Invitations to private previews', 'Everything in Platinum'] },
];

export default function Rewards() {
  useTitle('Rewards');
  const { user, refreshUser } = useStore();
  useEffect(() => { refreshUser(); }, [refreshUser]);
  const pts = user?.points || 0;
  const current = [...TIERS].reverse().find((t) => pts >= t.min) || TIERS[0];
  const next = TIERS.find((t) => t.min > pts);

  return (
    <>
      <PageHeader eyebrow="Rewards" lines={['TIME', 'WELL SPENT.']}>Earn 1 point for every ₹100 you spend. Points unlock tiers, and tiers unlock privileges.</PageHeader>
      <div className="container-x py-10">
        {user ? (
          <div className="mb-12 border border-gold/40 bg-[radial-gradient(ellipse_at_top_left,rgb(var(--gold-rgb)/0.15),transparent_60%)] p-8">
            <p className="eyebrow">Your balance</p>
            <p className="mt-3 font-serif text-6xl text-primary">{pts} <span className="text-2xl text-foreground">points</span></p>
            <p className="mt-2 text-sm text-muted-foreground">{current.name} member{next && ` · ${next.min - pts} points to ${next.name}`}</p>
            {next && <div className="mt-5 h-1 bg-border"><div className="h-1 bg-primary" style={{ width: `${((pts - current.min) / (next.min - current.min)) * 100}%` }} /></div>}
          </div>
        ) : (
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border border-border p-6">
            <p className="text-sm text-muted-foreground">Sign in to see your points and tier.</p>
            <Button to="/auth?next=/rewards">Sign in</Button>
          </div>
        )}
        <div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map(({ name, min, icon: Icon, perks }, i) => (
            <div key={name} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className={cx('bg-background p-7 transition-colors duration-500 hover:bg-card', user && current.name === name && 'bg-card')}>
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.2} />
              <p className="mt-6 font-serif text-3xl">{name}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{min}+ points</p>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">{perks.map((p) => <li key={p}>— {p}</li>)}</ul>
              {user && current.name === name && <p className="mt-5 text-[10px] uppercase tracking-[0.22em] text-primary">Your tier</p>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
