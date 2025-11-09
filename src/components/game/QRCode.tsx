import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeProps {
  value: string;
  size?: number;
}

export const QRCode: React.FC<QRCodeProps> = ({ value, size = 200 }) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <QRCodeSVG value={value} size={size} />
      <p className="text-sm text-gray-600">Quét mã QR để tham gia game</p>
    </div>
  );
};

