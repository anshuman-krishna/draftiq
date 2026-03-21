import { Injectable, BadRequestException, ConflictException } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaService } from "../../prisma/prisma.service";
import { CRM_EVENTS } from "../integrations/crm.events";

const SLOTS = ["09:00-12:00", "12:00-15:00", "15:00-18:00"] as const;
const SLOTS_PER_TIME = 2; // max bookings per time slot

interface SlotInfo {
  time: string;
  remaining: number;
  label: "available" | "limited" | "last slot" | "full";
}

interface DayAvailability {
  date: string;
  totalSlots: number;
  bookedCount: number;
  slots: SlotInfo[];
}

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAvailability(startDate: string, endDate?: string): Promise<DayAvailability[]> {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(start);
    if (!endDate) {
      end.setDate(end.getDate() + 13);
    }

    const days = await this.prisma.availability.findMany({
      where: {
        date: { gte: start, lte: end },
      },
      include: {
        bookings: {
          where: { status: { not: "CANCELLED" } },
        },
      },
      orderBy: { date: "asc" },
    });

    return days.map((day) => {
      const bookedCount = day.bookings.length;
      const slotBookings = this.countBookingsBySlot(day.bookings);

      const slots: SlotInfo[] = SLOTS.map((time) => {
        const booked = slotBookings.get(time) ?? 0;
        const remaining = Math.max(0, SLOTS_PER_TIME - booked);
        return {
          time,
          remaining,
          label: this.getUrgencyLabel(remaining),
        };
      });

      return {
        date: day.date.toISOString().split("T")[0],
        totalSlots: day.totalSlots,
        bookedCount,
        slots,
      };
    });
  }

  async createBooking(date: string, slot: string, quoteId?: string) {
    if (!SLOTS.includes(slot as (typeof SLOTS)[number])) {
      throw new BadRequestException(`invalid slot: ${slot}`);
    }

    const bookingDate = new Date(date);

    // find availability for this date
    const availability = await this.prisma.availability.findUnique({
      where: { date: bookingDate },
    });

    if (!availability) {
      throw new BadRequestException("no availability for this date");
    }

    // check slot capacity with a count query (race-safe with the unique constraint below)
    const existingCount = await this.prisma.booking.count({
      where: {
        date: bookingDate,
        slot,
        status: { not: "CANCELLED" },
      },
    });

    if (existingCount >= SLOTS_PER_TIME) {
      throw new ConflictException("this time slot is no longer available");
    }

    // check total day capacity
    const dayBookings = await this.prisma.booking.count({
      where: {
        date: bookingDate,
        status: { not: "CANCELLED" },
      },
    });

    if (dayBookings >= availability.totalSlots) {
      throw new ConflictException("no more slots available for this date");
    }

    const booking = await this.prisma.booking.create({
      data: {
        date: bookingDate,
        slot,
        status: "PENDING",
        quoteId: quoteId ?? null,
        availabilityId: availability.id,
      },
    });

    // emit crm event (async, non-blocking)
    this.eventEmitter.emit(CRM_EVENTS.BOOKING_CREATED, {
      bookingId: booking.id,
      bookingDate: date,
      slot,
    });

    return booking;
  }

  async listBookings() {
    return this.prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: { payments: { select: { id: true, amount: true, status: true } } },
    });
  }

  async updateBookingStatus(id: string, status: string) {
    const booking = await this.prisma.booking.update({
      where: { id },
      data: { status: status as "PENDING" | "CONFIRMED" | "CANCELLED" },
    });

    if (status === "CONFIRMED") {
      this.eventEmitter.emit(CRM_EVENTS.BOOKING_CONFIRMED, {
        bookingId: booking.id,
        bookingDate: booking.date.toISOString().split("T")[0],
        slot: booking.slot,
      });
    }

    return booking;
  }

  async listAvailability() {
    return this.prisma.availability.findMany({
      orderBy: { date: "asc" },
      include: {
        _count: { select: { bookings: true } },
      },
    });
  }

  async updateAvailability(id: string, totalSlots: number) {
    return this.prisma.availability.update({
      where: { id },
      data: { totalSlots },
    });
  }

  private countBookingsBySlot(bookings: { slot: string }[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const booking of bookings) {
      counts.set(booking.slot, (counts.get(booking.slot) ?? 0) + 1);
    }
    return counts;
  }

  private getUrgencyLabel(remaining: number): "available" | "limited" | "last slot" | "full" {
    if (remaining === 0) return "full";
    if (remaining === 1) return "last slot";
    if (remaining <= 2) return "limited";
    return "available";
  }
}
