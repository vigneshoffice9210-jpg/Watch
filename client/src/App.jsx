import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { Spinner } from './components/ui';
import Home from './pages/Home';

const Collection = lazy(() => import('./pages/Collection'));
const Budget = lazy(() => import('./pages/Budget'));
const Product = lazy(() => import('./pages/Product'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const Auth = lazy(() => import('./pages/Auth'));
const Account = lazy(() => import('./pages/Account'));
const Saved = lazy(() => import('./pages/Saved'));
const TryOn = lazy(() => import('./pages/TryOn'));
const Boutique = lazy(() => import('./pages/Boutique'));
const Discover = lazy(() => import('./pages/Discover'));
const FindMyWatch = lazy(() => import('./pages/FindMyWatch'));
const GiftFinder = lazy(() => import('./pages/GiftFinder'));
const Community = lazy(() => import('./pages/Community'));
const CommunityPost = lazy(() => import('./pages/CommunityPost'));
const Care = lazy(() => import('./pages/Care'));
const CareArticle = lazy(() => import('./pages/CareArticle'));
const Capsules = lazy(() => import('./pages/Capsules'));
const Drops = lazy(() => import('./pages/Drops'));
const Vault = lazy(() => import('./pages/Vault'));
const Rewards = lazy(() => import('./pages/Rewards'));
const Partners = lazy(() => import('./pages/Partners'));
const Policies = lazy(() => import('./pages/Policies'));
const Battle = lazy(() => import('./pages/Battle'));
const WearToday = lazy(() => import('./pages/WearToday'));
const OutfitMatch = lazy(() => import('./pages/OutfitMatch'));
const Couples = lazy(() => import('./pages/Couples'));
const Admin = lazy(() => import('./pages/admin/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="collection" element={<Collection />} />
          <Route path="budget" element={<Budget />} />
          <Route path="product/:slug" element={<Product />} />
          <Route path="products/:slug" element={<Product />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order/:orderNumber" element={<OrderSuccess />} />
          <Route path="orders" element={<Orders />} />
          <Route path="auth" element={<Auth />} />
          <Route path="account" element={<Account />} />
          <Route path="saved" element={<Saved />} />
          <Route path="try-on" element={<TryOn />} />
          <Route path="mirror" element={<TryOn mirror />} />
          <Route path="virtual-boutique" element={<Boutique />} />
          <Route path="boutique" element={<Boutique />} />
          <Route path="discover" element={<Discover />} />
          <Route path="experience" element={<Discover />} />
          <Route path="find-my-watch" element={<FindMyWatch />} />
          <Route path="gift-finder" element={<GiftFinder />} />
          <Route path="community" element={<Community />} />
          <Route path="community/share" element={<Community share />} />
          <Route path="community/:id" element={<CommunityPost />} />
          <Route path="care" element={<Care />} />
          <Route path="care/:slug" element={<CareArticle />} />
          <Route path="capsules" element={<Capsules />} />
          <Route path="drops" element={<Drops />} />
          <Route path="vault" element={<Vault />} />
          <Route path="vault/:slug" element={<Product vault />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="partners" element={<Partners />} />
          <Route path="partner" element={<Partners />} />
          <Route path="policies" element={<Policies />} />
          <Route path="battle" element={<Battle />} />
          <Route path="wear-today" element={<WearToday />} />
          <Route path="outfit-match" element={<OutfitMatch />} />
          <Route path="couples" element={<Couples />} />
          <Route path="admin/*" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
