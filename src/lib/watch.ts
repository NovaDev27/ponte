import { useEffect } from 'react';
import PonteWear from '../../modules/ponte-wear';
import { phaseDue, phasesFor } from '../data/checklist';
import { budgetOf } from './budget';
import { useApp } from './store';

// Manda para o relógio (Wear OS) o que ele mostra. Só faz algo nos builds que têm o módulo nativo.
export function useWatchSync() {
  const { ready, state, rates } = useApp();

  useEffect(() => {
    if (!ready || !PonteWear || !state.onboarded) return;
    const b = budgetOf(state, rates);

    let taskTitle = '';
    let taskDueAt = 0;
    for (const phase of phasesFor(b.country)) {
      const task = phase.tasks.find((t) => !state.done[t.id]);
      if (task) {
        taskTitle = task.text;
        taskDueAt = phaseDue(phase.id, state.profile.tripMonth)?.getTime() ?? 0;
        break;
      }
    }

    const data: Record<string, string | number> = {
      city: b.city.name,
      currency: b.cur,
      home: state.profile.homeAddress,
      taskTitle,
      budgetPerDay: Math.round(b.monthly / 30),
    };
    if (taskDueAt) data.taskDueAt = taskDueAt;

    // Espera o usuário parar de mexer antes de mandar.
    const t = setTimeout(() => { PonteWear?.sync(data).catch(() => {}); }, 1500);
    return () => clearTimeout(t);
  }, [ready, state, rates]);
}
