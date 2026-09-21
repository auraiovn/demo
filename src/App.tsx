import { Navigate, Route, Routes } from 'react-router-dom';
import { CommerceHeader } from './components/CommerceHeader';
import { VirtualTryOnProvider } from './components/VirtualTryOn/VirtualTryOnContext';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';

export default function App() {
  return (
    <VirtualTryOnProvider>
      <CommerceHeader />
      <Routes>
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/product/:productId" element={<ProductPage />} />
        <Route path="*" element={<Navigate replace to="/category/all-products" />} />
      </Routes>
    </VirtualTryOnProvider>
  );
}
