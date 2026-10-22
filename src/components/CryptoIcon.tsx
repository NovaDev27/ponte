import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export type CryptoName = 'Polygon' | 'Solana' | 'Base' | 'Tron' | 'Ethereum' | 'USDC' | 'USDT';

// Versões minimalistas, de uma cor só, dos símbolos das redes e das stablecoins.
// Desenhadas num quadro de 24x24 para combinar com os ícones de traço do app.
export function CryptoIcon({ name, size = 22, color }: { name: CryptoName; size?: number; color: string }) {
  const line = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'Ethereum' ? (
        <>
          <Path d="M12 2.5 L18.5 12.3 L12 16 L5.5 12.3 Z" fill={color} />
          <Path d="M12 17.4 L18.5 13.7 L12 21.5 L5.5 13.7 Z" fill={color} opacity={0.6} />
        </>
      ) : name === 'Solana' ? (
        <>
          <Path d="M7.2 5 H20 L16.8 8.2 H4 Z" fill={color} />
          <Path d="M4 10.4 H16.8 L20 13.6 H7.2 Z" fill={color} />
          <Path d="M7.2 15.8 H20 L16.8 19 H4 Z" fill={color} />
        </>
      ) : name === 'Polygon' ? (
        <>
          <Path d="M9 8.5 L12.9 10.75 V15.25 L9 17.5 L5.1 15.25 V10.75 Z" {...line} />
          <Path d="M15 6.5 L18.9 8.75 V13.25 L15 15.5 L11.1 13.25 V8.75 Z" {...line} />
        </>
      ) : name === 'Base' ? (
        // Círculo com o corte reto entrando pela esquerda.
        <Path d="M3.06 10.9 A9 9 0 1 1 3.06 13.1 L12.6 13.1 L12.6 10.9 Z" fill={color} />
      ) : name === 'Tron' ? (
        <Path d="M4 4.5 L20 8.5 L11 20.5 Z M4 4.5 L13.6 12.3 L20 8.5 M13.6 12.3 L11 20.5" {...line} />
      ) : name === 'USDC' ? (
        <>
          <Path d="M8.2 4.6 A8.4 8.4 0 0 0 8.2 19.4 M15.8 4.6 A8.4 8.4 0 0 1 15.8 19.4" {...line} />
          <Path d="M12 6.5 V17.5 M14.6 9.6 C14.6 8.3 9.4 7.9 9.4 10.2 C9.4 12.4 14.6 11.6 14.6 14 C14.6 16.3 9.4 16 9.4 14.6" {...line} />
        </>
      ) : (
        <>
          <Circle cx={12} cy={12} r={9.5} {...line} />
          <Path d="M7.5 7.8 H16.5 M12 7.8 V17.2" {...line} />
          <Ellipse cx={12} cy={11.4} rx={5} ry={1.7} {...line} strokeWidth={1.4} />
        </>
      )}
    </Svg>
  );
}
