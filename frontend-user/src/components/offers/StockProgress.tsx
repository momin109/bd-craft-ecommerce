type Props = {
  stockLimit?: number;
  soldCount?: number;
};

export default function StockProgress({ stockLimit, soldCount = 0 }: Props) {
  if (!stockLimit) return null;

  const soldPercent = Math.min(100, Math.round((soldCount / stockLimit) * 100));
  const remaining = Math.max(0, stockLimit - soldCount);

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
        <span>{soldPercent}% sold</span>
        <span>Only {remaining} left</span>
      </div>

      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${soldPercent}%` }}
        />
      </div>
    </div>
  );
}
