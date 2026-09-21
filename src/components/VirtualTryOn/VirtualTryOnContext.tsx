import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { VirtualTryOnProduct } from '../../types/vto';
import { VirtualTryOnModal } from './VirtualTryOnModal';

interface VirtualTryOnContextValue {
  readonly openVirtualTryOn: (
    product: VirtualTryOnProduct,
    trigger?: HTMLElement | null,
  ) => void;
  readonly closeVirtualTryOn: () => void;
}

const VirtualTryOnContext = createContext<VirtualTryOnContextValue | null>(null);

export function VirtualTryOnProvider({ children }: { readonly children: ReactNode }) {
  const [product, setProduct] = useState<VirtualTryOnProduct | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const openVirtualTryOn = useCallback(
    (nextProduct: VirtualTryOnProduct, trigger?: HTMLElement | null) => {
      const activeElement =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      triggerRef.current = trigger ?? activeElement;
      setProduct(nextProduct);
    },
    [],
  );

  const closeVirtualTryOn = useCallback(() => {
    setProduct(null);
    const trigger = triggerRef.current;
    triggerRef.current = null;
    window.requestAnimationFrame(() => trigger?.focus());
  }, []);

  const value = useMemo(
    () => ({ openVirtualTryOn, closeVirtualTryOn }),
    [closeVirtualTryOn, openVirtualTryOn],
  );

  return (
    <VirtualTryOnContext.Provider value={value}>
      {children}
      {product ? (
        <VirtualTryOnModal product={product} onClose={closeVirtualTryOn} />
      ) : null}
    </VirtualTryOnContext.Provider>
  );
}

export function useVirtualTryOn(): VirtualTryOnContextValue {
  const context = useContext(VirtualTryOnContext);
  if (!context) {
    throw new Error('useVirtualTryOn must be used inside VirtualTryOnProvider.');
  }
  return context;
}
