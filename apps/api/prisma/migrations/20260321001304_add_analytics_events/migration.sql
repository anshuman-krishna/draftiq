-- CreateTable
CREATE TABLE `analytics_events` (
    `id` VARCHAR(191) NOT NULL,
    `event_type` VARCHAR(191) NOT NULL,
    `metadata` JSON NOT NULL,
    `session_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `analytics_events_event_type_idx`(`event_type`),
    INDEX `analytics_events_session_id_idx`(`session_id`),
    INDEX `analytics_events_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
