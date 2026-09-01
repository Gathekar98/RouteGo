import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const MAX_SEATS_PER_BOOKING = 6;

interface BookingDraftState {
  tripId: string | null;
  selectedSeatIds: string[];
  boardingPointId: string | null;
  droppingPointId: string | null;
}

const initialState: BookingDraftState = {
  tripId: null,
  selectedSeatIds: [],
  boardingPointId: null,
  droppingPointId: null,
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setTrip(state, action: PayloadAction<string>) {
      // Switching to a different trip should clear any stale selections
      if (state.tripId !== action.payload) {
        state.selectedSeatIds = [];
        state.boardingPointId = null;
        state.droppingPointId = null;
      }
      state.tripId = action.payload;
    },
    toggleSeat(state, action: PayloadAction<string>) {
      const seatId = action.payload;
      const index = state.selectedSeatIds.indexOf(seatId);
      if (index >= 0) {
        state.selectedSeatIds.splice(index, 1);
      } else if (state.selectedSeatIds.length < MAX_SEATS_PER_BOOKING) {
        state.selectedSeatIds.push(seatId);
      }
    },
    setBoardingPoint(state, action: PayloadAction<string>) {
      state.boardingPointId = action.payload;
    },
    setDroppingPoint(state, action: PayloadAction<string>) {
      state.droppingPointId = action.payload;
    },
    clearBookingDraft(state) {
      state.tripId = null;
      state.selectedSeatIds = [];
      state.boardingPointId = null;
      state.droppingPointId = null;
    },
  },
});

export const { setTrip, toggleSeat, setBoardingPoint, setDroppingPoint, clearBookingDraft } =
  bookingSlice.actions;
export default bookingSlice.reducer;