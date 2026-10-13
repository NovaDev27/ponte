import { Platform } from 'react-native';
import { COMPLETO_SKU } from './completo';

// Compra do Ponte Completo pelo Google Play (expo-iap).
// Só existe no app instalado no Android: na web e no Expo Go o módulo nativo não está presente,
// então tudo aqui devolve "indisponível" em vez de quebrar.
//
// Limitação conhecida: a compra é confirmada no próprio aparelho, sem verificar no servidor.

type Iap = typeof import('expo-iap');
let loading: Promise<Iap | null> | null = null;

function iap(): Promise<Iap | null> {
  if (!loading) {
    loading = (async () => {
      if (Platform.OS !== 'android') return null;
      try {
        const mod = await import('expo-iap');
        return (await mod.initConnection()) ? mod : null;
      } catch {
        return null;
      }
    })();
  }
  return loading;
}

export async function billingAvailable(): Promise<boolean> {
  return (await iap()) !== null;
}

// Preço já formatado pela loja (ex.: "R$ 29,90"), ou null se a loja não respondeu.
export async function completoPrice(): Promise<string | null> {
  const m = await iap();
  if (!m) return null;
  try {
    const products = await m.fetchProducts({ skus: [COMPLETO_SKU], type: 'in-app' });
    const p = products?.find((x) => x.id === COMPLETO_SKU);
    return p?.displayPrice ?? null;
  } catch {
    return null;
  }
}

// Abre a tela de pagamento do Google Play. O resultado chega pelo listener abaixo.
export async function buyCompleto(): Promise<boolean> {
  const m = await iap();
  if (!m) return false;
  await m.requestPurchase({ request: { google: { skus: [COMPLETO_SKU] } }, type: 'in-app' });
  return true;
}

// Confere se a conta Google do aparelho já comprou (reinstalação, outro celular).
export async function ownsCompleto(): Promise<boolean> {
  const m = await iap();
  if (!m) return false;
  try {
    const purchases = await m.getAvailablePurchases();
    const owned = purchases.find((p) => p.productId === COMPLETO_SKU && p.purchaseState === 'purchased');
    // Compras não confirmadas são estornadas pelo Google em 3 dias: confirma se ainda faltar.
    if (owned) await m.finishTransaction({ purchase: owned, isConsumable: false }).catch(() => {});
    return !!owned;
  } catch {
    return false;
  }
}

// Escuta o resultado das compras. Devolve a função que para de escutar.
export async function listenPurchases(onOwned: () => void, onError: (message: string) => void): Promise<() => void> {
  const m = await iap();
  if (!m) return () => {};
  const ok = m.purchaseUpdatedListener(async (p) => {
    if (p.productId !== COMPLETO_SKU) return;
    if (p.purchaseState !== 'purchased') return; // pendente (ex.: boleto): libera quando confirmar
    await m.finishTransaction({ purchase: p, isConsumable: false }).catch(() => {});
    onOwned();
  });
  const fail = m.purchaseErrorListener((e) => {
    if (m.isUserCancelledError(e)) return;
    onError('Não foi possível concluir a compra. Tente de novo em instantes.');
  });
  return () => {
    ok.remove();
    fail.remove();
  };
}
