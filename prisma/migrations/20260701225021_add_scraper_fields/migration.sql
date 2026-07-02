/*
  Warnings:

  - A unique constraint covering the columns `[salonId,dateHeure]` on the table `Creneau` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[planity_url]` on the table `Salon` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Creneau" ADD COLUMN     "reduction" INTEGER NOT NULL DEFAULT 35;

-- CreateIndex
CREATE UNIQUE INDEX "Creneau_salonId_dateHeure_key" ON "Creneau"("salonId", "dateHeure");

-- CreateIndex
CREATE UNIQUE INDEX "Salon_planity_url_key" ON "Salon"("planity_url");
