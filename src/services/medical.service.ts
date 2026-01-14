import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function createMedicalForm(data: any) {
  return prisma.medicalForm.create({
    data: {
      // Coordonnées
      nom: data.nom || '',
      prenom: data.prenom || '',
      sexe: data.sexe || null,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
      age: data.age ? parseInt(data.age) : null,
      nationalite: data.nationalite || null,
      matricule: data.matricule || null,
      service: data.service || null,
      lit: data.lit || null,
      residence: data.residence || null,
      telephone: data.telephone || null,
      etatCivil: data.etatCivil || null,
      couvertureSociale: Array.isArray(data.couvertureSociale) ? data.couvertureSociale : [],
      groupeSanguin: data.groupeSanguin || null,
      poids: data.poids ? parseFloat(data.poids) : null,
      taille: data.taille ? parseFloat(data.taille) : null,
      allergie: data.allergie === true || data.allergie === 'true',
      allergieDetails: data.allergieDetails || null,

      // Hospitalisation
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

      // Antécédents
      antecedentsMedicaux: data.antecedentsMedicaux || null,
      antecedentsChirurgicaux: data.antecedentsChirurgicaux || null,

      // Kinésithérapie
      kinesitherapie: data.kinesitherapie === true || data.kinesitherapie === 'true',

      // Traitements
      traitements: {
        create: Array.isArray(data.traitements) 
          ? data.traitements.map((t: any) => ({
              traitement: t.traitement || '',
              dose: t.dose || '',
            }))
          : [],
      },
    },
    include: {
      traitements: true,
    },
  });
}

export async function getAllMedicalForms() {
  return prisma.medicalForm.findMany({
    include: {
      traitements: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getMedicalFormById(id: number) {
  return prisma.medicalForm.findUnique({
    where: { id },
    include: {
      traitements: true,
    },
  });
}

export async function updateMedicalForm(id: number, data: any) {
  const existingForm = await prisma.medicalForm.findUnique({
    where: { id },
  });

  if (!existingForm) {
    return null;
  }

  // Supprimer les anciens traitements
  await prisma.treatment.deleteMany({
    where: { medicalFormId: id },
  });

  // Mettre à jour
  return prisma.medicalForm.update({
    where: { id },
    data: {
      nom: data.nom || '',
      prenom: data.prenom || '',
      sexe: data.sexe || null,
      dateNaissance: data.dateNaissance ? new Date(data.dateNaissance) : null,
      age: data.age ? parseInt(data.age) : null,
      nationalite: data.nationalite || null,
      matricule: data.matricule || null,
      service: data.service || null,
      lit: data.lit || null,
      residence: data.residence || null,
      telephone: data.telephone || null,
      etatCivil: data.etatCivil || null,
      couvertureSociale: Array.isArray(data.couvertureSociale) ? data.couvertureSociale : [],
      groupeSanguin: data.groupeSanguin || null,
      poids: data.poids ? parseFloat(data.poids) : null,
      taille: data.taille ? parseFloat(data.taille) : null,
      allergie: data.allergie === true || data.allergie === 'true',
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
      kinesitherapie: data.kinesitherapie === true || data.kinesitherapie === 'true',
      traitements: {
        create: Array.isArray(data.traitements)
          ? data.traitements.map((t: any) => ({
              traitement: t.traitement || '',
              dose: t.dose || '',
            }))
          : [],
      },
    },
    include: {
      traitements: true,
    },
  });
}

export async function deleteMedicalForm(id: number) {
  const existingForm = await prisma.medicalForm.findUnique({
    where: { id },
  });

  if (!existingForm) {
    throw new Error('Dossier non trouvé');
  }

  await prisma.treatment.deleteMany({
    where: { medicalFormId: id },
  });

  return prisma.medicalForm.delete({
    where: { id },
  });
}