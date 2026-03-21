-- CreateTable
CREATE TABLE `availability` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `total_slots` INTEGER NOT NULL DEFAULT 6,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `availability_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` VARCHAR(191) NOT NULL,
    `quote_id` VARCHAR(191) NULL,
    `availability_id` VARCHAR(191) NULL,
    `date` DATE NOT NULL,
    `slot` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookings_quote_id_key`(`quote_id`),
    INDEX `bookings_date_slot_idx`(`date`, `slot`),
    INDEX `bookings_availability_id_idx`(`availability_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_quote_id_fkey` FOREIGN KEY (`quote_id`) REFERENCES `quotes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_availability_id_fkey` FOREIGN KEY (`availability_id`) REFERENCES `availability`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
