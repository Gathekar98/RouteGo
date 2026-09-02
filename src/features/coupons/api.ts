import { supabase } from '../../lib/supabase';
import type { CouponValidationResult } from './types';

export async function validateCoupon(
  code: string,
  bookingAmount: number
): Promise<CouponValidationResult> {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('code, discount_type, discount_value, min_booking_amount, max_discount_amount, is_active, valid_until')
    .ilike('code', code.trim())
    .maybeSingle();

  if (error) throw error;

  if (!coupon) {
    return { isValid: false, coupon: null, errorMessage: 'Invalid coupon code.' };
  }
  if (!coupon.is_active) {
    return { isValid: false, coupon: null, errorMessage: 'This coupon is no longer active.' };
  }
  if (new Date(coupon.valid_until) < new Date()) {
    return { isValid: false, coupon: null, errorMessage: 'This coupon has expired.' };
  }
  if (bookingAmount < coupon.min_booking_amount) {
    return {
      isValid: false,
      coupon: null,
      errorMessage: `This coupon requires a minimum booking amount of ₹${coupon.min_booking_amount}.`,
    };
  }

  return {
    isValid: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discount_type as 'percentage' | 'fixed',
      discountValue: coupon.discount_value,
      maxDiscountAmount: coupon.max_discount_amount,
    },
    errorMessage: null,
  };
}