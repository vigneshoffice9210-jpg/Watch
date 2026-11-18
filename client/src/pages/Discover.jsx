import { Link } from 'react-router-dom';
import { ArrowUpRight, Camera, Compass, Gift, Hourglass, Layers, Sparkles, Swords, Sun, Shirt, Heart, Wrench, Rocket, Lock, Award, Store, ScanFace } from 'lucide-react';
import { PageHeader } from '../components/ui';
import { useTitle } from '../lib/hooks';

const ITEMS = [
  { to: '/try-on', title: 'Virtual Try-On', text: 'Upload your wrist and see any watch on you.', icon: Sparkles },
  { to: '/mirror', title: 'Live Mirror', text: 'Use your camera for a real-time try-on.', icon: ScanFace },
  { to: '/virtual-boutique', title: '3D Boutique', text: 'Walk our showroom and inspect every showcase.', icon: Store },
  { to: '/find-my-watch', title: 'Find My Watch', text: 'Five questions to your perfect match.', icon: Compass },
  { to: '/gift-finder', title: 'Gift Finder', text: 'The right watch for the right person and moment.', icon: Gift },
  { to: '/battle', title: 'Watch Battle', text: 'Put two timepieces head to head.', icon: Swords },
  { to: '/wear-today', title: 'Wear Today', text: 'A daily pick for where you are headed.', icon: Sun },
  { to: '/outfit-match', title: 'Outfit Match', text: 'Pick your outfit colours, find the watch.', icon: Shirt },
  { to: '/couples', title: 'Couples Edit', text: 'Matching pairs for two.', icon: Heart },
  { to: '/community', title: 'Style Board', text: 'See how the community wears theirs.', icon: Camera },
  { to: '/care', title: 'Watch Care Hub', text: 'Guides to keep your watch beautiful.', icon: Wrench },
  { to: '/capsules', title: 'Time Capsule', text: 'Seal a message for a future date.', icon: Hourglass },
  { to: '/drops', title: 'Watch Drops', text: 'Countdowns to upcoming releases.', icon: Rocket },
  { to: '/vault', title: 'The Vault', text: 'Rare and limited pieces.', icon: Lock },
  { to: '/rewards', title: 'Rewards', text: 'Points, tiers and privileges.', icon: Award },
  { to: '/budget', title: 'By Budget', text: 'Elegance at every price.', icon: Layers },
];

export default function Discover() {
  useTitle('Discover');
  return (
    <>
      <PageHeader eyebrow="All experiences" lines={['DISCOVER', 'EVERENTIA.']}>More than a store — tools to help you find, try and live with the right timepiece.</PageHeader>
      <div className="container-x my-10">
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ to, title, text, icon: Icon }, i) => (
          <Link key={to} to={to} data-reveal style={{ '--d': `${Math.min(i, 8) * 70}ms` }} className="group relative bg-background p-7 transition-colors duration-500 hover:bg-card">
            <Icon className="h-6 w-6 text-primary transition-transform duration-500 group-hover:-translate-y-1 group-hover:scale-110" strokeWidth={1.2} />
            <h2 className="mt-8 font-serif text-2xl group-hover:text-primary">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            <ArrowUpRight className="absolute right-6 top-6 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
