// Cabeçalhos que o servidor da Ponte exige em todo pedido do app.
export function apiHeaders(deviceId: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Ponte-Token': process.env.EXPO_PUBLIC_PONTE_TOKEN ?? '',
    'X-Ponte-Device': deviceId,
  };
}
