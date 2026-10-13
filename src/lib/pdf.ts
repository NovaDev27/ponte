import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { planHtml } from './planHtml';
import type { Rates } from './rates';
import type { AppState } from './store';

// Gera o PDF e abre o menu de compartilhar (WhatsApp, e-mail, salvar...). Na web, abre a impressão.
export async function exportPlan(state: AppState, rates: Rates) {
  const html = planHtml(state, rates);
  if (Platform.OS === 'web') {
    await Print.printToFileAsync({ html });
    return;
  }
  const { uri } = await Print.printToFileAsync({ html, width: 595, height: 842 }); // A4
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Plano do intercâmbio' });
  } else {
    await Print.printAsync({ uri });
  }
}
