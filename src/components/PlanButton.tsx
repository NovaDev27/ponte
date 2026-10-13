import { router } from 'expo-router';
import React, { useState } from 'react';
import { hasCompleto } from '../lib/completo';
import { exportPlan } from '../lib/pdf';
import { useApp } from '../lib/store';
import { Btn } from './ui';

// Gera o "Plano do intercâmbio" em PDF (Ponte Completo). Sem o Completo, leva para a tela de compra.
export function PlanButton({ color }: { color?: string }) {
  const { state, rates } = useApp();
  const [busy, setBusy] = useState(false);
  const unlocked = hasCompleto(state);

  async function run() {
    if (!unlocked) return router.push('/completo');
    setBusy(true);
    try {
      await exportPlan(state, rates);
    } catch {
      // a pessoa fechou o menu de compartilhar: nada a fazer
    } finally {
      setBusy(false);
    }
  }

  return (
    <Btn
      label={busy ? 'Gerando PDF...' : unlocked ? 'Baixar plano em PDF' : 'Plano em PDF (Ponte Completo)'}
      icon={unlocked ? 'file-text' : 'lock'}
      kind="ghost"
      color={color}
      onPress={run}
      disabled={busy}
    />
  );
}
