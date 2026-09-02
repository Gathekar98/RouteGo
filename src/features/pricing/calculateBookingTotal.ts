export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxDiscountAmount: number | null;
}

export interface BookingTotal {
  baseFare: number;
  convenienceFeePerSeat: number;
  convenienceFeeTotal: number;
  discountAmount: number;
  totalAmount: number;
}

const CONVENIENCE_FEE_PER_SEAT = 20;

export function calculateBookingTotal(
  seatPrices: number[],
  coupon: Coupon | null
): BookingTotal {
  const baseFare = seatPrices.reduce((sum, price) => sum + price, 0);
  const convenienceFeeTotal = seatPrices.length * CONVENIENCE_FEE_PER_SEAT;

  let discountAmount = 0;
  if (coupon) {
    discountAmount =
      coupon.discountType === 'percentage'
        ? (baseFare * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
    // Discount can never exceed the fare it's applied to
    discountAmount = Math.min(discountAmount, baseFare);
  }

  const totalAmount = baseFare + convenienceFeeTotal - discountAmount;

  return {
    baseFare,
    convenienceFeePerSeat: CONVENIENCE_FEE_PER_SEAT,
    convenienceFeeTotal,
    discountAmount,
    totalAmount,
  };
}