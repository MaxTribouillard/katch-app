-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "reductionSameDay" INTEGER NOT NULL DEFAULT 50,
    "reductionNextDay" INTEGER NOT NULL DEFAULT 35,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);
