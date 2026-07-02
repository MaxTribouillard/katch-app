-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SALON', 'USER');

-- AlterTable
ALTER TABLE "Salon" ADD COLUMN     "planity_url" TEXT;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salon_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_salon_id_key" ON "users"("salon_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_salon_id_fkey" FOREIGN KEY ("salon_id") REFERENCES "Salon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
