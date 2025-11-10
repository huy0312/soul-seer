import { Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

interface GameCodeProps {
  code: string;
  onCodeChange?: (code: string) => void;
  showInput?: boolean;
}

export const GameCode: React.FC<GameCodeProps> = ({ code, onCodeChange, showInput = false }) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');

  useEffect(() => {
    if (code) {
      setInputCode(code);
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast({
        title: 'Đã sao chép!',
        description: 'Mã game đã được sao chép vào clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép mã game',
        variant: 'destructive',
      });
    }
  };

  if (showInput) {
    return (
      <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhập mã game
          </label>
          <Input
            type="text"
            value={inputCode}
            onChange={(e) => {
              const newCode = e.target.value.toUpperCase();
              setInputCode(newCode);
              if (onCodeChange) {
                onCodeChange(newCode);
              }
            }}
            placeholder="Nhập mã 6 ký tự"
            maxLength={6}
            className="text-center text-2xl font-bold tracking-widest uppercase"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
          Mã game
        </label>
        <div className="flex items-center gap-2">
          <div className="px-6 py-3 bg-gray-100 rounded-lg border-2 border-gray-300">
            <span className="text-3xl font-bold tracking-widest text-gray-800">{code}</span>
          </div>
          <Button
            onClick={handleCopy}
            variant="outline"
            size="icon"
            className="h-12 w-12"
          >
            {copied ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

