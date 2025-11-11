import { useState } from 'react';

interface MCCardProps {
  name: string;
  role: string;
  description: string;
  imageName: string;
  gradientFrom: string;
  gradientTo: string;
  textGradientFrom: string;
  textGradientTo: string;
}

const MCCard = ({ 
  name, 
  role, 
  description, 
  imageName, 
  gradientFrom, 
  gradientTo,
  textGradientFrom,
  textGradientTo
}: MCCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<'jpg' | 'png' | 'jpeg' | 'webp'>('jpg');

  const formats: Array<'jpg' | 'png' | 'jpeg' | 'webp'> = ['jpg', 'png', 'jpeg', 'webp'];
  const currentFormatIndex = formats.indexOf(currentFormat);

  const handleImageError = () => {
    if (currentFormatIndex < formats.length - 1) {
      // Thử format tiếp theo
      setCurrentFormat(formats[currentFormatIndex + 1]);
    } else {
      // Đã thử hết các format, hiển thị placeholder
      setImageError(true);
    }
  };

  const getImageSrc = () => {
    if (imageError) return null;
    return `/MC/${imageName}.${currentFormat}`;
  };

  return (
    <div className="group bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden">
      <div className="relative mb-6">
        <div className={`aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo}`}>
          {!imageError && getImageSrc() ? (
            <img
              src={getImageSrc() || ''}
              alt={`MC ${name}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white/50">
                <div className="text-6xl mb-4">📷</div>
                <div className="text-sm font-medium">Ảnh MC {name}</div>
                <div className="text-xs mt-2 opacity-75">
                  Đặt ảnh tại: /MC/{imageName}.jpg
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-white/20 backdrop-blur-md rounded-lg p-3 border border-white/30">
            <p className="text-white text-sm font-medium">{description}</p>
          </div>
        </div>
      </div>
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 bg-gradient-to-r ${textGradientFrom} ${textGradientTo} bg-clip-text text-transparent`}>
          {name}
        </h3>
        <p className="text-blue-200">{role}</p>
      </div>
    </div>
  );
};

export default MCCard;

