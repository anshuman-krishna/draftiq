-- AlterTable
ALTER TABLE `analytics_events` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `availability` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `integration_configs` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `pricing_rules` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `quotes` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `tenant_id` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `tenants` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `domain` VARCHAR(191) NULL,
    `settings` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tenants_slug_key`(`slug`),
    UNIQUE INDEX `tenants_domain_key`(`domain`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `analytics_events_tenant_id_idx` ON `analytics_events`(`tenant_id`);

-- CreateIndex
CREATE INDEX `availability_tenant_id_idx` ON `availability`(`tenant_id`);

-- CreateIndex
CREATE INDEX `bookings_tenant_id_idx` ON `bookings`(`tenant_id`);

-- CreateIndex
CREATE INDEX `integration_configs_tenant_id_idx` ON `integration_configs`(`tenant_id`);

-- CreateIndex
CREATE INDEX `payments_tenant_id_idx` ON `payments`(`tenant_id`);

-- CreateIndex
CREATE INDEX `pricing_rules_tenant_id_idx` ON `pricing_rules`(`tenant_id`);

-- CreateIndex
CREATE INDEX `products_tenant_id_idx` ON `products`(`tenant_id`);

-- CreateIndex
CREATE INDEX `quotes_tenant_id_idx` ON `quotes`(`tenant_id`);

-- CreateIndex
CREATE INDEX `users_tenant_id_idx` ON `users`(`tenant_id`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quotes` ADD CONSTRAINT `quotes_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pricing_rules` ADD CONSTRAINT `pricing_rules_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability` ADD CONSTRAINT `availability_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `integration_configs` ADD CONSTRAINT `integration_configs_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `analytics_events` ADD CONSTRAINT `analytics_events_tenant_id_fkey` FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
