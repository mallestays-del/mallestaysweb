'use client';

/**
 * OTA-style price display:
 *   ₹43,000/-  ₹45,000/-   (current bold, original strikethrough inline)
 *   per night
 */
export default function PriceDisplay({
  price,
  originalPrice,
  size = 'md',
  align = 'left',
  className = '',
  priceClassName = '',
}) {
  if (price === undefined || price === null) return null;

  const hasDiscount = originalPrice && Number(originalPrice) > Number(price);
  const fmt = (v) => Number(v).toLocaleString('en-IN');

  const sizes = {
    sm: { price: 'text-lg', original: 'text-xs', label: 'text-xs' },
    md: { price: 'text-2xl', original: 'text-sm', label: 'text-sm' },
    lg: { price: 'text-3xl', original: 'text-base', label: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;
  const alignCls = align === 'right' ? 'items-end text-right' : align === 'center' ? 'items-center text-center' : 'items-start text-left';

  return (
    <div className={`flex flex-col ${alignCls} ${className}`} data-testid="price-display">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`${s.price} font-bold text-slate-900 ${priceClassName}`} data-testid="price-current">
          ₹{fmt(price)}/-
        </span>
        {hasDiscount && (
          <span className={`${s.original} text-slate-400 line-through`} data-testid="price-original">
            ₹{fmt(originalPrice)}/-
          </span>
        )}
      </div>
      <span className={`${s.label} text-slate-600`}>per night</span>
    </div>
  );
}
