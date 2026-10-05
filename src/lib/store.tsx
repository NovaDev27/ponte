import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { CURRENCIES } from '../data/countries';
import { DEFAULT_FEES, Fees } from '../data/methods';
import { nextMonths } from './format';

export type Style = 'eco' | 'mod' | 'conf';
export type Profile = {
  country: string;
  city: number;
  tripMonth: string;
  months: number;
  style: Style;
  savings: number;
  ticketBRL: number;
  courseLocal: number;
};

export type AppState = {
  onboarded: boolean;
  profile: Profile;
  done: Record<string, boolean>;
  fees: Fees;
  overrides: Record<string, number>;
  serverUrl: string;
  deviceId: string; // identificador anônimo, usado só para os limites do assistente
};

function newDeviceId(): string {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join('');
}

const KEY = 'ponte:v1';
const RATES_KEY = 'ponte:rates';

// Cotações de reserva (unidades por 1 real) caso o app esteja offline.
const FALLBACK_RATES: Record<string, number> = {
  EUR: 0.16, USD: 0.18, CAD: 0.25, AUD: 0.28, GBP: 0.135, NZD: 0.31, JPY: 27, ZAR: 3.2,
};

// Servidor do assistente: o da nuvem (EXPO_PUBLIC_PONTE_SERVER) ou, em desenvolvimento, o do computador.
export const DEFAULT_SERVER =
  process.env.EXPO_PUBLIC_PONTE_SERVER || (Platform.OS === 'web' ? 'http://localhost:8787' : 'http://192.168.0.6:8787');
// Endereços padrão antigos, que eram salvos no aparelho: passam a seguir o padrão atual.
const OLD_DEFAULTS = ['http://localhost:8787', 'http://192.168.0.10:8787'];

// Endereço em uso: o que a pessoa escreveu em Ajustes ou o padrão.
export function serverOf(state: AppState): string {
  return (state.serverUrl || DEFAULT_SERVER).replace(/\/$/, '');
}

export const initialState: AppState = {
  onboarded: false,
  profile: {
    country: 'IE', city: 0, tripMonth: nextMonths(7)[6], months: 6, style: 'mod',
    savings: 25000, ticketBRL: 5000, courseLocal: 0,
  },
  done: {},
  fees: DEFAULT_FEES,
  overrides: {},
  serverUrl: '', // vazio = DEFAULT_SERVER
  deviceId: '',
};

type Rates = { values: Record<string, number>; updated: number | null; live: boolean };

type Ctx = {
  ready: boolean;
  state: AppState;
  setProfile: (p: Partial<Profile>) => void;
  update: (p: Partial<AppState>) => void;
  toggle: (taskId: string) => void;
  reset: () => void;
  rates: Rates;
  refreshRates: () => Promise<void>;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<AppState>(initialState);
  const [rates, setRates] = useState<Rates>({ values: FALLBACK_RATES, updated: null, live: false });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<AppState>;
          setState({
            ...initialState,
            ...saved,
            profile: { ...initialState.profile, ...(saved.profile ?? {}) },
            fees: { ...DEFAULT_FEES, ...(saved.fees ?? {}) },
            deviceId: saved.deviceId || newDeviceId(),
            serverUrl: OLD_DEFAULTS.includes(saved.serverUrl ?? '') ? '' : saved.serverUrl ?? '',
          });
        } else {
          setState({ ...initialState, deviceId: newDeviceId() });
        }
        const r = await AsyncStorage.getItem(RATES_KEY);
        if (r) setRates({ ...(JSON.parse(r) as Rates), live: false });
      } catch {
        // dados corrompidos: começa do zero
      }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const applyRates = useCallback((next: Rates | null) => {
    if (next) {
      setRates(next);
      AsyncStorage.setItem(RATES_KEY, JSON.stringify(next)).catch(() => {});
    } else {
      setRates((r) => ({ ...r, live: false }));
    }
  }, []);

  const refreshRates = useCallback(async () => {
    applyRates(await fetchRates());
  }, [applyRates]);

  useEffect(() => {
    let alive = true;
    fetchRates().then((next) => {
      if (alive) applyRates(next);
    });
    return () => {
      alive = false;
    };
  }, [applyRates]);

  const value = useMemo<Ctx>(() => ({
    ready,
    state,
    rates,
    refreshRates,
    setProfile: (p) => setState((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    update: (p) => setState((s) => ({ ...s, ...p })),
    toggle: (id) => setState((s) => ({ ...s, done: { ...s.done, [id]: !s.done[id] } })),
    reset: () => setState((s) => ({ ...initialState, deviceId: s.deviceId })),
  }), [ready, state, rates, refreshRates]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const v = useContext(AppCtx);
  if (!v) throw new Error('useApp fora do AppProvider');
  return v;
}

export function rateOf(rates: Rates, cur: string): number {
  return rates.values[cur] ?? FALLBACK_RATES[cur] ?? 1;
}

async function fetchRates(): Promise<Rates | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/BRL');
    const json = await res.json();
    if (json?.result !== 'success') return null;
    const values: Record<string, number> = {};
    for (const c of [...CURRENCIES, 'USD']) if (json.rates[c]) values[c] = json.rates[c];
    return { values, updated: Date.now(), live: true };
  } catch {
    return null;
  }
}
