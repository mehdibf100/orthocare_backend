import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createMedicalForm(dto: any) {
  if (!dto.nom || !dto.prenom) {
    throw new Error("InvalidMedicalFormData");
  }

  const form = await prisma.medicalForm.create({
    data: mapMedicalFormData(dto),
    include: { traitements: true },
  });

  return form;
}

export async function getAllMedicalForms(codeService?: string) {
  const whereClause: any = {};
  
  if (codeService && codeService.trim() !== "") {
    whereClause.codeService = codeService.trim();
  }
  
  const results = await prisma.medicalForm.findMany({
    where: whereClause,
    include: { traitements: true },
    orderBy: { createdAt: "desc" },
  });
    
  return results;
}

export async function getMedicalFormById(id: number) {
  const form = await prisma.medicalForm.findUnique({
    where: { id },
    include: { traitements: true },
  });

  if (!form) throw new Error("MedicalFormNotFound");
  return form;
}

export async function updateMedicalForm(id: number, dto: any) {
  const existing = await prisma.medicalForm.findUnique({ where: { id } });
  if (!existing) throw new Error("MedicalFormNotFound");

  await prisma.treatment.deleteMany({
    where: { medicalFormId: id },
  });

  return prisma.medicalForm.update({
    where: { id },
    data: mapMedicalFormData(dto),
    include: { traitements: true },
  });
}

export async function deleteMedicalForm(id: number) {
  const existing = await prisma.medicalForm.findUnique({ where: { id } });
  if (!existing) throw new Error("MedicalFormNotFound");

  await prisma.treatment.deleteMany({
    where: { medicalFormId: id },
  });

  await prisma.medicalForm.delete({ where: { id } });
}

/* ===================== MAPPER ===================== */
function mapMedicalFormData(data: any) {
  return {
    nom: data.nom || "",
    prenom: data.prenom || "",
    codeService: data.codeService || null,
    sexe: data.sexe || null,
    dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
    age: data.age !== undefined && data.age !== null ? Number(data.age) : null,
    nationalite: data.nationalite || null,
    matricule: data.matricule || null,
    service: data.service || null,
    lit: data.lit || null,
    residence: data.residence || null,
    telephone: data.telephone || null,
    etatCivil: data.etatCivil || null,
    couvertureSociale: Array.isArray(data.couvertureSociale) ? data.couvertureSociale : [],
    groupeSanguin: data.groupeSanguin || null,
    poids: data.poids !== undefined && data.poids !== null ? Number(data.poids) : null,
    taille: data.taille !== undefined && data.taille !== null ? Number(data.taille) : null,
    allergie: data.allergie === true || data.allergie === "true",
    allergieDetails: data.allergieDetails || null,

    dateHospitalisation: data.dateHospitalisation ? new Date(data.dateHospitalisation) : null,
    motifHospitalisation: data.motifHospitalisation || null,
    diagnosticMedical: data.diagnosticMedical || null,
    diagnosticChirurgical: data.diagnosticChirurgical || null,

    membreConcerne: Array.isArray(data.membreConcerne) ? data.membreConcerne : [],
    typeIntervention: Array.isArray(data.typeIntervention) ? data.typeIntervention : [],
    autreIntervention: data.autreIntervention || null,
    dateIntervention: data.dateIntervention ? new Date(data.dateIntervention) : null,
    typeAnesthesie: Array.isArray(data.typeAnesthesie) ? data.typeAnesthesie : [],
    dispositifPlace: Array.isArray(data.dispositifPlace) ? data.dispositifPlace : [],

    antecedentsMedicaux: data.antecedentsMedicaux || null,
    antecedentsChirurgicaux: data.antecedentsChirurgicaux || null,
    kinesitherapie: data.kinesitherapie === true || data.kinesitherapie === "true",

    traitements: {
      create: Array.isArray(data.traitements) && data.traitements.length > 0
        ? data.traitements.map((t: any) => ({
            traitement: t.traitement || "",
            dose: t.dose || "",
          }))
        : [],
    },
  };
}
