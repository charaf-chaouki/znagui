// Znagui Express — dev seed. Run: npm run db:seed
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hashSync(pw, 10);

const VILLES = ["Casablanca", "Rabat", "Fès", "Marrakech", "Tanger", "Tétouan", "Agadir", "Meknès"];
const COORDS = {
  Casablanca: [33.5731, -7.5898], Rabat: [34.0209, -6.8416], Fès: [34.0331, -5.0003],
  Marrakech: [31.6295, -7.9811], Tanger: [35.7595, -5.834], Tétouan: [35.5785, -5.3684],
  Agadir: [30.4278, -9.5981], Meknès: [33.897, -5.5478],
};
const CLIENT_NAMES = [
  "Said Benani", "Fatima Zahra", "Nadia Chaoui", "Omar Tazi", "Imane Fassi",
  "Rachid Berrada", "Leila Ouardi", "Karim Saidi",
];
const RECIPIENTS = ["Khalid Idrissi", "Amine Sbai", "Hind Alaoui", "Mounir Kabbaj", "Sofia Rami", "Yassine Oubella"];
const CONTENTS = ["Téléphone Samsung A55", "Paire de chaussures", "Vêtements", "Accessoires", "Produits cosmétiques", "Livres"];
const VEHICLES = ["MOTO", "VOITURE", "CAMION"];
const TARIFS_INTRA = [20, 25, 30, 35];
const TARIFS_INTER = [35, 50, 60];

const STATUT_POOL = [
  "LIVRE", "EN_COURS_DE_LIVRAISON", "EN_EXPEDITION", "DISPONIBLE_A_RAMASSER",
  "RAMASSE", "RECU_PAR_AGENCE_DEST", "LIVRE", "DISPATCHE_LIVREUR", "CREE",
  "LIVRE", "REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR", "ANNULE", "RECU_ENTREPOT_SOURCE",
  "AFFECTE_RAMASSAGE", "EN_COURS_DE_LIVRAISON",
];

const LABELS = {
  CREE: "Colis créé", DISPONIBLE_A_RAMASSER: "Disponible à ramasser", AFFECTE_RAMASSAGE: "Affecté au ramassage",
  RAMASSE: "Ramassé par le livreur", RECU_ENTREPOT_SOURCE: "Reçu à l'entrepôt source", EN_EXPEDITION: "En transit entre agences",
  RECU_PAR_AGENCE_DEST: "Reçu par l'agence de destination", DISPATCHE_LIVREUR: "Dispatché au livreur",
  EN_COURS_DE_LIVRAISON: "En cours de livraison", LIVRE: "Livré au destinataire", REPORTE: "Livraison reportée",
  PAS_DE_REPONSE: "Destinataire injoignable", REFUSE: "Colis refusé", RETOUR: "Colis retourné", ANNULE: "Colis annulé",
};
const INTRA = ["CREE", "DISPONIBLE_A_RAMASSER", "RAMASSE", "EN_COURS_DE_LIVRAISON", "LIVRE"];
const INTER = ["CREE", "AFFECTE_RAMASSAGE", "RAMASSE", "RECU_ENTREPOT_SOURCE", "EN_EXPEDITION", "RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE"];

function pathFor(type, statut) {
  const flow = type === "INTRA" ? INTRA : INTER;
  if (statut === "ANNULE") return ["CREE", "ANNULE"];
  if (["REPORTE", "PAS_DE_REPONSE", "REFUSE", "RETOUR"].includes(statut)) {
    return [...flow.slice(0, flow.indexOf("EN_COURS_DE_LIVRAISON") + 1), statut];
  }
  const idx = flow.indexOf(statut);
  return idx >= 0 ? flow.slice(0, idx + 1) : ["CREE"];
}

async function main() {
  const villes = {};
  for (const nom of VILLES) {
    const v = await prisma.ville.upsert({ where: { nom }, update: {}, create: { nom } });
    villes[nom] = v.id;
  }

  await prisma.account.upsert({
    where: { email: "admin@znaguiexpress.ma" },
    update: {},
    create: { email: "admin@znaguiexpress.ma", phone: "0600000000", passwordHash: hash("admin123"), role: "ADMIN", status: "ACTIVE" },
  });

  const agenceAccount = await prisma.account.upsert({
    where: { email: "agence.casa@znaguiexpress.ma" },
    update: {},
    create: {
      email: "agence.casa@znaguiexpress.ma", phone: "0611000000", passwordHash: hash("agence123"), role: "AGENCE", status: "ACTIVE",
      agence: { create: { nom: "Agence Casablanca", responsable: "Responsable Casa", villeId: villes["Casablanca"], adresse: "Bd Zerktouni, Casablanca", telephone: "0522000000", status: "ACTIVE" } },
    },
    include: { agence: true },
  });
  const agenceId = (agenceAccount.agence ?? (await prisma.agence.findUnique({ where: { accountId: agenceAccount.id } }))).id;

  await prisma.account.upsert({
    where: { email: "livreur1@znaguiexpress.ma" },
    update: {},
    create: {
      email: "livreur1@znaguiexpress.ma", phone: "0612000000", passwordHash: hash("livreur123"), role: "LIVREUR", status: "ACTIVE",
      livreur: { create: { agenceId, nom: "Alami", prenom: "Youssef", cni: "AB123456", telephone: "0612000000", villeId: villes["Casablanca"], adresse: "Hay Hassani, Casablanca", statusAccount: "ACTIVE" } },
    },
  });

  // Additional agences (across cities)
  const moreAgences = [
    ["Rabat", "Sara El Amrani"], ["Fès", "Anas Bennani"], ["Marrakech", "Khadija Nassiri"],
    ["Tanger", "Younes Rifi"], ["Agadir", "Salima Oujdi"],
  ];
  for (let i = 0; i < moreAgences.length; i++) {
    const [v, resp] = moreAgences[i];
    const slug = v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const email = `agence.${slug}@znaguiexpress.ma`;
    const st = i === 4 ? "INACTIVE" : "ACTIVE";
    await prisma.account.upsert({
      where: { email },
      update: {},
      create: {
        email, passwordHash: hash("agence123"), role: "AGENCE", status: st,
        agence: { create: { nom: `Agence ${v}`, responsable: resp, villeId: villes[v], adresse: `Centre ville, ${v}`, telephone: `05${30 + i}000000`, status: st } },
      },
    });
  }

  // Additional livreurs across agences
  const allAgences = await prisma.agence.findMany({ select: { id: true, villeId: true, ville: { select: { nom: true } } } });
  const LIV = [["Berrada", "Hamza"], ["Tazi", "Ayoub"], ["Saidi", "Bilal"], ["Chaoui", "Reda"], ["Fassi", "Nabil"], ["Oujdi", "Walid"]];
  const livStatus = ["ACTIVE", "ACTIVE", "PENDING", "ACTIVE", "SUSPENDED", "ACTIVE"];
  for (let i = 0; i < LIV.length; i++) {
    const ag = allAgences[i % allAgences.length];
    const [nom, prenom] = LIV[i];
    const email = `livreur${i + 2}@znaguiexpress.ma`;
    const st = livStatus[i];
    await prisma.account.upsert({
      where: { email },
      update: {},
      create: {
        email, passwordHash: hash("livreur123"), role: "LIVREUR", status: st,
        livreur: {
          create: {
            agenceId: ag.id, nom, prenom, cni: `CN${100000 + i}`, telephone: `0612${100000 + i}`,
            villeId: ag.villeId, adresse: `Quartier ${i + 1}, ${ag.ville.nom}`, statusAccount: st,
            banque: "Attijariwafa Bank", rib: `0070${String(100000000000000 + i)}`,
          },
        },
      },
    });
  }

  // Clients
  const clientIds = [];
  for (let i = 0; i < CLIENT_NAMES.length; i++) {
    const email = `client${i + 1}@znaguiexpress.ma`;
    const acc = await prisma.account.upsert({
      where: { email },
      update: {},
      create: {
        email, phone: `06130000${String(i + 10)}`, passwordHash: hash("client123"), role: "CLIENT", status: "ACTIVE",
        client: { create: { nom: CLIENT_NAMES[i], telephone: `06130000${String(i + 10)}`, cni: `CL${100000 + i}`, villeId: villes[VILLES[i % VILLES.length]] } },
      },
      include: { client: true },
    });
    clientIds.push((acc.client ?? (await prisma.client.findUnique({ where: { accountId: acc.id } }))).id);
  }

  // Colis (deterministic trk → idempotent)
  const base = new Date("2026-10-21T10:00:00");
  const day = 24 * 3600 * 1000;
  const N = 25;
  for (let i = 1; i <= N; i++) {
    const trk = `TRK-SEED${String(i).padStart(4, "0")}`;
    const pickup = VILLES[i % VILLES.length];
    const dest = i % 5 === 0 ? pickup : VILLES[(i + 3) % VILLES.length];
    const type = pickup === dest ? "INTRA" : "INTER";
    const statut = STATUT_POOL[i % STATUT_POOL.length];
    const vehicle = VEHICLES[i % VEHICLES.length];
    const tarifArr = type === "INTRA" ? TARIFS_INTRA : TARIFS_INTER;
    const tarif = tarifArr[i % tarifArr.length];
    const cod = (i % 7) * 120;
    const createdAt = new Date(base.getTime() - (i - 1) * day);
    const [pLat, pLng] = COORDS[pickup];
    const [dLat, dLng] = COORDS[dest];

    const colis = await prisma.colis.upsert({
      where: { trackingNumber: trk },
      update: { statut },
      create: {
        trackingNumber: trk,
        clientId: clientIds[i % clientIds.length],
        type, statut,
        pickupVilleId: villes[pickup],
        pickupAddress: `Quartier Centre, Rue ${i}, ${pickup}`,
        pickupLat: pLat, pickupLng: pLng,
        recipientName: RECIPIENTS[i % RECIPIENTS.length],
        recipientPhone: "0699" + String(100000 + i),
        destinationVilleId: villes[dest],
        destinationAddress: `Avenue Hassan II, ${dest}`,
        destinationLat: dLat, destinationLng: dLng,
        vehicleType: vehicle,
        parcelCount: 1 + (i % 3),
        contents: CONTENTS[i % CONTENTS.length],
        amountToCollect: cod,
        tarif,
        createdAt,
        agenceRamassageId: agenceId,
      },
    });

    await prisma.colisEvent.deleteMany({ where: { colisId: colis.id } });
    const steps = pathFor(type, statut);
    await prisma.colisEvent.createMany({
      data: steps.map((s, k) => ({
        colisId: colis.id, statut: s, label: LABELS[s],
        city: s === "EN_EXPEDITION" ? `${pickup} → ${dest}` : (["RECU_PAR_AGENCE_DEST", "DISPATCHE_LIVREUR", "EN_COURS_DE_LIVRAISON", "LIVRE"].includes(s) ? dest : pickup),
        createdAt: new Date(createdAt.getTime() + k * 3 * 3600 * 1000),
      })),
    });
  }

  console.log(`✓ Seed terminé : ${N} colis, ${CLIENT_NAMES.length} clients.`);
  console.log("  admin@znaguiexpress.ma / admin123 · client1@znaguiexpress.ma / client123");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
