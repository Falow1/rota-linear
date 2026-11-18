import { QR_PATH, QR_SIZE, SITE_URL } from "./qrData";

/**
 * QR Code com o endereço do site. As cores são fixas de propósito, nos dois temas:
 * leitores de QR esperam módulos escuros sobre fundo claro, com 4 módulos de margem.
 */
export function SiteQr({ size = 176 }: { size?: number }) {
  const m = 4;
  const side = QR_SIZE + 2 * m;
  return (
    <svg
      className="site-qr"
      width={size}
      height={size}
      viewBox={`${-m} ${-m} ${side} ${side}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR Code que abre ${SITE_URL}`}
    >
      <rect x={-m} y={-m} width={side} height={side} fill="#ffffff" />
      <path d={QR_PATH} fill="#11131d" />
    </svg>
  );
}
