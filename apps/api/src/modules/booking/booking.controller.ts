import { Controller, Get, Post, Patch, Body, Query, Param } from "@nestjs/common";
import { BookingService } from "./booking.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { GetAvailabilityDto } from "./dto/get-availability.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { UpdateAvailabilityDto } from "./dto/update-availability.dto";

@Controller("bookings")
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  async listBookings() {
    return this.bookingService.listBookings();
  }

  @Get("availability")
  async getAvailability(@Query() query: GetAvailabilityDto) {
    return this.bookingService.getAvailability(
      query.startDate,
      query.endDate,
    );
  }

  @Get("availability/all")
  async listAvailability() {
    return this.bookingService.listAvailability();
  }

  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingService.createBooking(dto.date, dto.slot, dto.quoteId);
  }

  @Patch(":id")
  async updateBooking(
    @Param("id") id: string,
    @Body() dto: UpdateBookingDto,
  ) {
    return this.bookingService.updateBookingStatus(id, dto.status);
  }

  @Patch("availability/:id")
  async updateAvailability(
    @Param("id") id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.bookingService.updateAvailability(id, dto.totalSlots);
  }
}
