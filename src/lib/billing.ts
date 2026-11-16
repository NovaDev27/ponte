import { Platform } from 'react-native';
import { COMPLETO_SKU } from './completo';

// Compra do Ponte Completo pela loja do aparelho (expo-iap): Google Play no Android, App Store no iPhone.
// Só existe no app instalado: na web e no Expo Go o módulo nativo não está presente,
// então tudo aqui devolve "indisponível" em vez de quebrar.
//
// Limitação conhecida: a compra é confirmada no próprio aparelho, sem verificar no servidor.

// Nomes que aparecem nas telas, conforme a loja do aparelho.
export const STORE_NAME = Platform.OS === 'ios' ? 'App Store' : 'Google Play';
export const STORE_ACCOUNT = Platform.OS === 'ios' ? 'conta Apple' : 'conta Google';
// Artigo da loja: "o Google Play", mas "a App Store" (dá "pelo/pela", "no/na").
export const STORE_ART = Platform.OS === 'ios' ? 'a' : 'o';

type Iap = typeof import('expo-iap');
let loading: Promise<Iap | null> | null = null;

function iap(): Promise<Iap | null> {
  if (!loading) {
    loading = (async () => {
      if (Platform.OS !== 'android' && Platform.OS !== 'ios') return null;
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

// Onde trocar a conta da loja, para o "Já comprei" achar a compra.
export const STORE_SWITCH =
  Platform.OS === 'ios'
    ? 'troque a conta em Ajustes do iPhone → seu nome → Mídia e Compras'
    : 'troque a conta no Google Play';

// Abre a tela de pagamento da loja. O resultado chega pelo listener abaixo.
// 'off' = sem loja; 'cancelled' = a pessoa fechou o pagamento (no iPhone isso vem como erro, e não é erro).
export async function buyCompleto(): Promise<'started' | 'off' | 'cancelled'> {
  const m = await iap();
  if (!m) return 'off';
  try {
    await m.requestPurchase({ request: { google: { skus: [COMPLETO_SKU] }, apple: { sku: COMPLETO_SKU } }, type: 'in-app' });
  } catch (e) {
    if (m.isUserCancelledError(e)) return 'cancelled';
    throw e;
  }
  return 'started';
}

// Confere se a conta da loja tem a compra (reinstalação, outro celular, reembolso).
// true = tem; false = a loja respondeu e não tem (nunca comprou ou foi reembolsada);
// null = não deu para conferir (sem loja, sem internet). Com null, não mude nada.
// sync = true só no botão "Já comprei": no iPhone pede à App Store para sincronizar as compras
// (pode pedir a senha da conta Apple, por isso não roda ao abrir o app).
export async function ownsCompleto(sync = false): Promise<boolean | null> {
  const m = await iap();
  if (!m) return null;
  try {
    if (sync && Platform.OS === 'ios') await m.syncIOS().catch(() => {});
    const purchases = await m.getAvailablePurchases();
    const owned = purchases.find((p) => p.productId === COMPLETO_SKU && p.purchaseState === 'purchased');
    // Compras não confirmadas são estornadas pelo Google em 3 dias: confirma se ainda faltar.
    if (owned) await m.finishTransaction({ purchase: owned, isConsumable: false }).catch(() => {});
    return !!owned;
  } catch {
    return null;
  }
}

// Escuta o resultado das compras. Devolve a função que para de escutar.
export async function listenPurchases(onOwned: () => void, onError: (message: string) => void): Promise<() => void> {
  const m = await iap();
  if (!m) return () => {};
  const ok = m.purchaseUpdatedListener(async (p) => {
    if (p.productId !== COMPLETO_SKU) return;
    if (p.purchaseState !== 'purchased') return; // pendente (ex.: boleto, aprovação dos pais): libera quando confirmar
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
