import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class QuotesService {
  constructor(private readonly prisma: PrismaService) {}

  async listQuotes() {
    return this.prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, email: true, name: true } },
        booking: { select: { id: true, date: true, slot: true, status: true } },
      },
    });
  }
}
