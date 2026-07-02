import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Utilitaires de date — crée toujours des créneaux dans le futur
function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 3_600_000);
}
function minutesFromNow(m: number): Date {
  return new Date(Date.now() + m * 60_000);
}

async function main() {
  console.log("🌱 Nettoyage de la base...");
  await prisma.user.deleteMany();   // avant salon (FK salonId)
  await prisma.creneau.deleteMany();
  await prisma.prestation.deleteMany();
  await prisma.salon.deleteMany();

  console.log("💈 Création des salons...");

  // ─── 1. Tim Barber ────────────────────────────────────────────
  const timBarber = await prisma.salon.create({
    data: {
      nom: "Tim Barber",
      nomGerant: "Shpetim Osmani",
      tel: "06 11 22 33 44",
      mail: "contact@timbarber.fr",
    },
  });

  const [tbCoupe, tbCoupeBarbe, tbBarbe, _tbDegrade] =
    await Promise.all([
      prisma.prestation.create({
        data: {
          salonId: timBarber.id,
          nom: "Coupe Homme",
          prix: 22,
          duree: 30,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: timBarber.id,
          nom: "Coupe + Barbe",
          prix: 35,
          duree: 45,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: timBarber.id,
          nom: "Barbe seule",
          prix: 15,
          duree: 20,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: timBarber.id,
          nom: "Dégradé américain",
          prix: 28,
          duree: 35,
        },
      }),
    ]);

  await prisma.creneau.createMany({
    data: [
      {
        salonId: timBarber.id,
        prestationId: tbBarbe.id,
        dateHeure: minutesFromNow(50), // Urgent !
        disponible: true,
      },
      {
        salonId: timBarber.id,
        prestationId: tbCoupe.id,
        dateHeure: hoursFromNow(3),
        disponible: true,
      },
      {
        salonId: timBarber.id,
        prestationId: tbCoupeBarbe.id,
        dateHeure: hoursFromNow(26),
        disponible: true,
      },
    ],
  });

  // ─── 2. Studio K ──────────────────────────────────────────────
  const studioK = await prisma.salon.create({
    data: {
      nom: "Studio K",
      nomGerant: "Katia Moreau",
      tel: "06 22 33 44 55",
      mail: "booking@studiok-paris.fr",
    },
  });

  const [skCoupe, skBrushing, skCouleur, skBalayage] =
    await Promise.all([
      prisma.prestation.create({
        data: {
          salonId: studioK.id,
          nom: "Coupe Femme",
          prix: 45,
          duree: 45,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: studioK.id,
          nom: "Brushing",
          prix: 35,
          duree: 40,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: studioK.id,
          nom: "Couleur racines 5 cm",
          prix: 65,
          duree: 60,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: studioK.id,
          nom: "Balayage + Brushing",
          prix: 90,
          duree: 90,
        },
      }),
    ]);

  await prisma.creneau.createMany({
    data: [
      {
        salonId: studioK.id,
        prestationId: skBrushing.id,
        dateHeure: hoursFromNow(1.5),
        disponible: true,
      },
      {
        salonId: studioK.id,
        prestationId: skCouleur.id,
        dateHeure: hoursFromNow(4),
        disponible: true,
      },
      {
        salonId: studioK.id,
        prestationId: skBalayage.id,
        dateHeure: hoursFromNow(25),
        disponible: true,
      },
      {
        salonId: studioK.id,
        prestationId: skCoupe.id,
        dateHeure: hoursFromNow(27),
        disponible: true,
      },
    ],
  });

  // ─── 3. Le Barbier du Temple ───────────────────────────────────
  const barbierTemple = await prisma.salon.create({
    data: {
      nom: "Le Barbier du Temple",
      nomGerant: "Yanis Bencheikh",
      tel: "06 33 44 55 66",
      mail: "yanis@lebarbierdutempel.fr",
    },
  });

  const [btClassic, btEnfant, _btTaille, btRasage] =
    await Promise.all([
      prisma.prestation.create({
        data: {
          salonId: barbierTemple.id,
          nom: "Coupe homme classic",
          prix: 25,
          duree: 30,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: barbierTemple.id,
          nom: "Coupe enfant (- 12 ans)",
          prix: 18,
          duree: 25,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: barbierTemple.id,
          nom: "Taille de barbe",
          prix: 20,
          duree: 25,
        },
      }),
      prisma.prestation.create({
        data: {
          salonId: barbierTemple.id,
          nom: "Rasage complet lame",
          prix: 30,
          duree: 30,
        },
      }),
    ]);

  await prisma.creneau.createMany({
    data: [
      {
        salonId: barbierTemple.id,
        prestationId: btClassic.id,
        dateHeure: hoursFromNow(2),
        disponible: true,
      },
      {
        salonId: barbierTemple.id,
        prestationId: btRasage.id,
        dateHeure: hoursFromNow(5),
        disponible: true,
      },
      {
        salonId: barbierTemple.id,
        prestationId: btEnfant.id,
        dateHeure: hoursFromNow(28),
        disponible: true,
      },
    ],
  });

  // ─── 4. Chez Selma ─────────────────────────────────────────────
  const chezSelma = await prisma.salon.create({
    data: {
      nom: "Chez Selma",
      nomGerant: "Selma Hadj-Ali",
      tel: "06 44 55 66 77",
      mail: "selma@chezselma.fr",
    },
  });

  const [csCoupe, csLissage, csSoins] = await Promise.all([
    prisma.prestation.create({
      data: {
        salonId: chezSelma.id,
        nom: "Coupe + Brushing cheveux longs",
        prix: 55,
        duree: 60,
      },
    }),
    prisma.prestation.create({
      data: {
        salonId: chezSelma.id,
        nom: "Lissage Brésilien",
        prix: 120,
        duree: 150,
      },
    }),
    prisma.prestation.create({
      data: {
        salonId: chezSelma.id,
        nom: "Soins kératine",
        prix: 80,
        duree: 60,
      },
    }),
  ]);

  await prisma.creneau.createMany({
    data: [
      {
        salonId: chezSelma.id,
        prestationId: csSoins.id,
        dateHeure: minutesFromNow(75), // Urgent !
        disponible: true,
      },
      {
        salonId: chezSelma.id,
        prestationId: csCoupe.id,
        dateHeure: hoursFromNow(6),
        disponible: true,
      },
      {
        salonId: chezSelma.id,
        prestationId: csLissage.id,
        dateHeure: hoursFromNow(30),
        disponible: true,
      },
    ],
  });

  // ─── 5. Black & White Barbershop ───────────────────────────────
  const bwBarber = await prisma.salon.create({
    data: {
      nom: "Black & White Barbershop",
      nomGerant: "Marcus Williams",
      tel: "06 55 66 77 88",
      mail: "info@bwbarber.fr",
    },
  });

  const [bwFresh, bwSkin, bwBeard, bwColor] = await Promise.all([
    prisma.prestation.create({
      data: {
        salonId: bwBarber.id,
        nom: "Fresh Cut",
        prix: 30,
        duree: 35,
      },
    }),
    prisma.prestation.create({
      data: {
        salonId: bwBarber.id,
        nom: "Skin Fade",
        prix: 35,
        duree: 40,
      },
    }),
    prisma.prestation.create({
      data: {
        salonId: bwBarber.id,
        nom: "Beard Grooming",
        prix: 20,
        duree: 25,
      },
    }),
    prisma.prestation.create({
      data: {
        salonId: bwBarber.id,
        nom: "Color Touch-up",
        prix: 45,
        duree: 45,
      },
    }),
  ]);

  await prisma.creneau.createMany({
    data: [
      {
        salonId: bwBarber.id,
        prestationId: bwSkin.id,
        dateHeure: hoursFromNow(2.5),
        disponible: true,
      },
      {
        salonId: bwBarber.id,
        prestationId: bwBeard.id,
        dateHeure: hoursFromNow(4.5),
        disponible: true,
      },
      {
        salonId: bwBarber.id,
        prestationId: bwFresh.id,
        dateHeure: hoursFromNow(7),
        disponible: true,
      },
      {
        salonId: bwBarber.id,
        prestationId: bwColor.id,
        dateHeure: hoursFromNow(29),
        disponible: true,
      },
    ],
  });

  // ─── Comptes utilisateurs ─────────────────────────────────────────────
  console.log("👤 Création des comptes utilisateurs...");

  const [adminHash, timHash, studioHash] = await Promise.all([
    bcrypt.hash("admin1234", 12),
    bcrypt.hash("timbarber1234", 12),
    bcrypt.hash("studiok1234", 12),
  ]);

  // Admin
  await prisma.user.create({
    data: {
      email: "admin@katch.fr",
      passwordHash: adminHash,
      nom: "Admin Katch",
      role: "ADMIN",
    },
  });

  // Compte gérant Tim Barber
  await prisma.user.create({
    data: {
      email: "gerant@timbarber.fr",
      passwordHash: timHash,
      nom: "Shpetim Osmani",
      role: "SALON",
      salonId: timBarber.id,
    },
  });

  // Compte gérant Studio K
  await prisma.user.create({
    data: {
      email: "booking@studiok-paris.fr",
      passwordHash: studioHash,
      nom: "Katia Moreau",
      role: "SALON",
      salonId: studioK.id,
    },
  });

  const totalCreneaux = await prisma.creneau.count();
  const totalSalons = await prisma.salon.count();
  const totalUsers = await prisma.user.count();

  console.log(
    `✅ Seed terminé — ${totalSalons} salons, ${totalCreneaux} créneaux, ${totalUsers} users créés.`
  );
  console.log("   📌 admin@katch.fr / admin1234");
  console.log("   📌 gerant@timbarber.fr / timbarber1234");
  console.log("   📌 booking@studiok-paris.fr / studiok1234");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Erreur seed :", e);
    await prisma.$disconnect();
    process.exit(1);
  });
