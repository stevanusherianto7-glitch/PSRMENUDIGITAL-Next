import { OptimizedImage } from '../OptimizedImage'
import { rp } from '../../data'
import type { MenuItem } from '../../types'

interface MenuCardProps {
  item: MenuItem
  inCartQty?: number
  onSelect: (item: MenuItem) => void
}

/** Kartu menu tunggal (presentasional) — diekstrak dari GuestMenuPage god-component. */
export function MenuCard({ item, inCartQty = 0, onSelect }: MenuCardProps) {
  return (
    <button
      key={item.id}
      onClick={() => onSelect(item)}
      disabled={!item.available}
      className={`bg-card border rounded-xl overflow-hidden text-left transition-all active:scale-95 group ${
        !item.available ? 'opacity-40 cursor-not-allowed border-border' : 'border-border hover:border-foreground/20 hover:shadow-md'
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        <OptimizedImage src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105" />
        {item.tag && (
          <span className="absolute top-2 left-2 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {item.tag}
          </span>
        )}
        {inCartQty > 0 && (
          <span className="absolute top-2 right-2 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {inCartQty}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">{item.name}</p>
        <p className="text-primary font-bold text-sm mt-1 font-poppins">{rp(item.price)}</p>
      </div>
    </button>
  )
}
