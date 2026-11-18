import { Button } from '../components/ui';
import { useTitle } from '../lib/hooks';

export default function NotFound() {
  useTitle('Page not found');
  return (
    <div className="container-x py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-xl mt-4 text-5xl sm:text-7xl">LOST IN TIME.</h1>
      <p className="mt-5 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button to="/" className="mt-8">Return home</Button>
    </div>
  );
}
