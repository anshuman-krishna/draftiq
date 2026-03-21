import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { TenantService } from "./tenant.service";

// extend express request to carry tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantSlug?: string;
    }
  }
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    // resolve tenant from header, query param, or subdomain
    const tenantSlug =
      (req.headers["x-tenant-slug"] as string) ??
      (req.query["tenant"] as string) ??
      this.extractSubdomain(req);

    if (tenantSlug) {
      try {
        const tenant = await this.tenantService.findBySlug(tenantSlug);
        req.tenantId = tenant.id;
        req.tenantSlug = tenant.slug;
      } catch {
        // tenant not found — proceed without tenant context
      }
    }

    next();
  }

  private extractSubdomain(req: Request): string | null {
    const host = req.headers.host ?? "";
    const parts = host.split(".");
    // e.g., acme.draftiq.com → "acme"
    if (parts.length >= 3) {
      return parts[0];
    }
    return null;
  }
}
