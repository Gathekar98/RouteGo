export interface CouponValidationResult {
  isValid: boolean;
  coupon: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxDiscountAmount: number | null;
  } | null;
  errorMessage: string | null;
}