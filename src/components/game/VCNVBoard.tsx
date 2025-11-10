import React from 'react';

interface VCNVBoardProps {
  cols: number;
  words: [string, string, string, string];
  revealed: Set<number>;
}

export const VCNVBoard: React.FC<VCNVBoardProps> = ({ cols, words, revealed }) => {
  const normalizeRow = (text: string) => {
    const stripped = (text || '').replace(/\s+/g, '');
    if (stripped.length < cols) return stripped.padEnd(cols, ' ');
    return stripped.slice(0, cols);
  };

  const rows = words.map((w) => normalizeRow(w));

  return (
    <div className="w-full overflow-x-auto">
      <div
        className="inline-grid gap-1 p-2 rounded-lg bg-white/5 border border-white/10"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(28px, 40px))` }}
      >
        {rows.map((row, rIdx) => {
          const isRevealed = revealed.has(rIdx);
          return row.split('').map((char, cIdx) => {
            const shown = isRevealed ? char : '';
            return (
              <div
                key={`${rIdx}-${cIdx}`}
                className={`h-10 min-w-[28px] flex items-center justify-center rounded-md border text-base font-semibold select-none
                  ${isRevealed ? 'bg-blue-100 border-blue-300 text-gray-900' : 'bg-white/10 border-white/20 text-transparent'}`}
              >
                {shown}
              </div>
            );
          });
        })}
      </div>
      <p className="text-center text-xs text-blue-200 mt-2">
        Hàng đã mở: {Array.from(revealed).length}/4
      </p>
    </div>
  );
};

export default VCNVBoard;


