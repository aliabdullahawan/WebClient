export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type OrderType = 'shop' | 'custom' | 'whatsapp'
export type NotificationType = 'order_update' | 'admin_message' | 'review_reply' | 'discount' | 'system'
export type DiscountScope = 'product' | 'category' | 'site_wide'

export interface User {
  id: string
  full_name: string
  email: string
  password_hash?: string
  phone?: string
  address?: string
  avatar_id?: string
  google_id?: string
  is_blocked: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  email: string
  full_name: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image_data?: string // base64 for frontend display
  image_mime: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  category_id?: string
  category_name?: string
  tags?: string[]
  is_featured: boolean
  show_on_hero: boolean
  is_active: boolean
  average_rating: number
  review_count: number
  primary_image_id?: string
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_data: string // base64
  image_mime: string
  order_index: number
  is_primary: boolean
  created_at: string
}

export interface Discount {
  id: string
  code: string
  description?: string
  percentage: number
  scope: DiscountScope
  product_id?: string
  category_id?: string
  is_active: boolean
  start_date: string
  end_date?: string
  usage_count: number
  max_usage?: number
  product_name?: string
  category_name?: string
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  user_id?: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  status: OrderStatus
  order_type: OrderType
  total_amount: number
  discounted_amount?: number
  discount_code?: string
  discount_percentage?: number
  shipping_address?: string
  admin_notes?: string
  customer_name?: string
  customer_email?: string
  customer_phone?: string
  item_count?: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  quantity: number
  price_at_order: number
  total_price?: number
}

export interface CustomOrder {
  id: string
  order_number: string
  name: string
  email?: string
  phone: string
  address?: string
  category?: string
  custom_category?: string
  description: string
  price_range_min?: number
  price_range_max?: number
  delivery_timeframe?: string
  status: OrderStatus
  admin_notes?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  user_id: string
  product_id: string
  rating: number
  comment?: string
  admin_reply?: string
  admin_replied_at?: string
  is_visible: boolean
  created_at: string
  user?: { full_name: string; avatar_id?: string }
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface CartItem {
  id: string
  user_id: string
  product_id: string
  quantity: number
  product?: Product
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  related_order_id?: string
  related_product_id?: string
  is_read: boolean
  created_at: string
}

export interface SocialLink {
  id: string
  platform: string
  url: string
  follower_count: number
  last_updated: string
}

export interface SiteSetting {
  key: string
  value: string
  updated_at: string
}

export interface Avatar {
  id: string
  name: string
  image_data: string // base64
  image_mime: string
}
