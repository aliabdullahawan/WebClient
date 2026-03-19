'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Star, ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onWishlist?: () => void
  isWishlisted?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProductCard({ product, onWishlist, isWishlisted = false, size = 'md' }: ProductCardProps) {
  const router = useRouter()
  const [imgError, setImgError] = useState(false)
  const [wishlistAnim, setWishlistAnim] = useState(false)

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlistAnim(true)
    setTimeout(() => setWishlistAnim(false), 600)
    onWishlist?.()
  }

  const sizeClasses = {
    sm: 'w-44',
    md: 'w-56 sm:w-64',
    lg: 'w-64 sm:w-72',
  }[size]

  const imgClasses = {
    sm: 'h-44',
    md: 'h-52 sm:h-60',
    lg: 'h-60 sm:h-72',
  }[size]

  return (
    <div
      onClick={() => router.push(`/shop/${product.id}`)}
      className={`${sizeClasses} shrink-0 cursor-pointer group card-product`}
    >
      {/* Image */}
      <div className={`relative ${imgClasses} overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50`}>
        {product.primary_image_id && !imgError ? (
          <img
            src={`/api/products/image/${product.primary_image_id}`}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-30">
            🧶
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Wishlist btn */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300
            ${isWishlisted ? 'bg-rose-500 text-white' : 'bg-white/90 text-rose-400 hover:bg-rose-500 hover:text-white'}
            ${wishlistAnim ? 'scale-125' : 'scale-100 opacity-0 group-hover:opacity-100'}`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Featured badge */}
        {product.is_featured && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold rounded-full shadow-sm">
            ✨ Featured
          </div>
        )}

        {/* Quick add btn */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); /* cart handled by product page */ }}
            className="flex items-center gap-1.5 bg-white text-rose-500 text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg hover:bg-rose-50 transition-colors whitespace-nowrap"
          >
            <ShoppingCart size={12} /> View Details
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-[#3d1520] text-sm line-clamp-2 leading-snug mb-1.5 group-hover:text-rose-500 transition-colors">
          {product.name}
        </h3>

        {product.category_name && (
          <p className="text-rose-300 text-xs mb-1.5">{product.category_name}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="font-bold text-rose-500 text-base">
            ₨{product.price.toLocaleString()}
          </span>

          {product.review_count > 0 && (
            <div className="flex items-center gap-1">
              <Star size={11} fill="#fb7185" stroke="none" />
              <span className="text-xs text-rose-400 font-medium">
                {product.average_rating.toFixed(1)}
              </span>
              <span className="text-xs text-rose-300">({product.review_count})</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
