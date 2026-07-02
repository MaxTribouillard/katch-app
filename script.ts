import { prisma } from "./lib/prisma";

async function main() {
    
const user = await prisma.salon.create({
    data:{
        mail: "test@mail.fr",
        nom:"Tim Barber",
        nomGerant: "Shpetim",
        tel: "06.06.06.06.06"
    }
})
 console.log("Created user:", user);

 const prestaTim = await prisma.prestation.create({
    data: {
        salonId: user.id,
        duree: 25,
        nom: "Coupe homme",
        prix: 22,
    }
})
 console.log("Created presta:", prestaTim);

}



const allUsers = await prisma.salon.findMany({

  });
  console.log("All users:", JSON.stringify(allUsers, null, 2));

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });