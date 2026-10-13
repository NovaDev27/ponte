// Cabeçalhos que o servidor da Ponte exige em todo pedido do app.
// `completo` aumenta o limite de perguntas do assistente.
export function apiHeaders(deviceId: string, completo = false): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Ponte-Token': process.env.EXPO_PUBLIC_PONTE_TOKEN ?? '',
    'X-Ponte-Device': deviceId,
    'X-Ponte-Plano': completo ? 'completo' : 'gratis',
  };
}
