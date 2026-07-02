-- CreateTable
CREATE TABLE "Salon" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nom_gerant" TEXT NOT NULL,
    "tel" TEXT NOT NULL,
    "mail" TEXT NOT NULL,

    CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prestation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,
    "duree" INTEGER NOT NULL,
    "salonId" TEXT NOT NULL,

    CONSTRAINT "Prestation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Creneau" (
    "id" TEXT NOT NULL,
    "dateHeure" TIMESTAMP(3) NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "salonId" TEXT NOT NULL,
    "prestationId" TEXT,

    CONSTRAINT "Creneau_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Prestation" ADD CONSTRAINT "Prestation_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneau" ADD CONSTRAINT "Creneau_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Creneau" ADD CONSTRAINT "Creneau_prestationId_fkey" FOREIGN KEY ("prestationId") REFERENCES "Prestation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
