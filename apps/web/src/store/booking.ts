import { create } from "zustand";
import type { DayAvailability, BookingResponse } from "@/lib/api";
import {
  fetchAvailability as fetchAvailabilityApi,
  createBooking as createBookingApi,
} from "@/lib/api";

interface BookingState {
  // data
  availability: DayAvailability[];
  selectedDate: string | null;
  selectedSlot: string | null;
  booking: BookingResponse | null;

  // status
  loading: boolean;
  submitting: boolean;
  error: string | null;

  // actions
  fetchAvailability: () => Promise<void>;
  selectDate: (date: string) => void;
  selectSlot: (slot: string) => void;
  confirmBooking: () => Promise<void>;
  reset: () => void;
}

function getTodayString(): string {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

export const useBookingStore = create<BookingState>((set, get) => ({
  availability: [],
  selectedDate: null,
  selectedSlot: null,
  booking: null,
  loading: false,
  submitting: false,
  error: null,

  fetchAvailability: async () => {
    set({ loading: true, error: null });
    try {
      const today = getTodayString();
      const data = await fetchAvailabilityApi(today);
      set({ availability: data, loading: false });

      // auto-select earliest available date
      const first = data.find((d) =>
        d.slots.some((s) => s.remaining > 0),
      );
      if (first && !get().selectedDate) {
        set({ selectedDate: first.date });
      }
    } catch {
      set({ loading: false, error: "unable to load availability" });
    }
  },

  selectDate: (date) => set({ selectedDate: date, selectedSlot: null }),

  selectSlot: (slot) => set({ selectedSlot: slot }),

  confirmBooking: async () => {
    const { selectedDate, selectedSlot } = get();
    if (!selectedDate || !selectedSlot) return;

    set({ submitting: true, error: null });
    try {
      const booking = await createBookingApi(selectedDate, selectedSlot);
      set({ booking, submitting: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : "booking failed";
      set({ submitting: false, error: message });
    }
  },

  reset: () =>
    set({
      selectedDate: null,
      selectedSlot: null,
      booking: null,
      error: null,
    }),
}));
