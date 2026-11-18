import { useLocation, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui';
import { useTitle } from '../lib/hooks';
import { formatPrice } from '../lib/format';
import { OrderCard } from './Orders';

export default function OrderSuccess() {
  useTitle('Order placed');
  const { orderNumber } = useParams();
  const { state } = useLocation();
  const order = state?.order;
  return (
    <div className="container-x max-w-3xl py-20">
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" strokeWidth={1} />
        <p className="eyebrow mt-6">Thank you</p>
        <h1 className="display-xl mt-4 text-5xl">YOUR TIMEPIECE<br /><span className="text-primary">IS ON ITS WAY.</span></h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Order <span className="text-foreground">{orderNumber}</span>{order && <> · {formatPrice(order.total)}</>}. We'll send updates on WhatsApp and email.
        </p>
      </div>
      {order && <div className="mt-12"><OrderCard order={order} /></div>}
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button to="/orders">Track my orders</Button>
        <Button to="/collection" variant="outline">Continue exploring</Button>
      </div>
    </div>
  );
}
