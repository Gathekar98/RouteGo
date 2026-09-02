import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export const MAX_SEATS_PER_BOOKING = 6;

export interface Passenger {
  seatId: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
}

interface BookingDraftState {
  tripId: string | null;
  selectedSeatIds: string[];
  boardingPointId: string | null;
  droppingPointId: string | null;
  passengers: Passenger[];
}

const initialState: BookingDraftState = {
  tripId: null,
  selectedSeatIds: [],
  boardingPointId: null,
  droppingPointId: null,
  passengers: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    setTrip(state, action: PayloadAction<string>) {
      if (state.tripId !== action.payload) {
        state.selectedSeatIds = [];
        state.boardingPointId = null;
        state.droppingPointId = null;
        state.passengers = [];
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
    setPassengers(state, action: PayloadAction<Passenger[]>) {
      state.passengers = action.payload;
    },
    clearBookingDraft(state) {
      state.tripId = null;
      state.selectedSeatIds = [];
      state.boardingPointId = null;
      state.droppingPointId = null;
      state.passengers = [];
    },
  },
});

export const {
  setTrip,
  toggleSeat,
  setBoardingPoint,
  setDroppingPoint,
  setPassengers,
  clearBookingDraft,
} = bookingSlice.actions;
export default bookingSlice.reducer;