// Bancos mais usados no Brasil, com as cores típicas dos cartões (só para desenhar o cartão
// da pessoa no guia; não usamos logos).
export type Bank = { id: string; name: string; colors: [string, string]; fg: string };

export const BANKS: Bank[] = [
  { id: 'nubank', name: 'Nubank', colors: ['#8A19D6', '#5A0B92'], fg: '#FFFFFF' },
  { id: 'itau', name: 'Itaú', colors: ['#F07A12', '#D35400'], fg: '#FFFFFF' },
  { id: 'bradesco', name: 'Bradesco', colors: ['#D2153A', '#8E0620'], fg: '#FFFFFF' },
  { id: 'bb', name: 'Banco do Brasil', colors: ['#FBE631', '#F2C500'], fg: '#123C8C' },
  { id: 'santander', name: 'Santander', colors: ['#EC1C1C', '#A80000'], fg: '#FFFFFF' },
  { id: 'caixa', name: 'Caixa', colors: ['#0A66B8', '#003F7D'], fg: '#FFFFFF' },
  { id: 'inter', name: 'Inter', colors: ['#FF8A1F', '#E86A00'], fg: '#FFFFFF' },
  { id: 'c6', name: 'C6 Bank', colors: ['#2B2B2B', '#0E0E0E'], fg: '#FFFFFF' },
  { id: 'picpay', name: 'PicPay', colors: ['#25C861', '#0E9A45'], fg: '#FFFFFF' },
  { id: 'mercadopago', name: 'Mercado Pago', colors: ['#14B8EE', '#0A8FC9'], fg: '#FFFFFF' },
  { id: 'outro', name: 'Outro banco', colors: ['#3A3F47', '#1E2228'], fg: '#FFFFFF' },
];

export const bankOf = (id: string | undefined) => BANKS.find((b) => b.id === id) ?? BANKS[BANKS.length - 1];
