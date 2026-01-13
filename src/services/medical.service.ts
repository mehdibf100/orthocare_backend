import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createMedicalForm(body: any) {
  return prisma.medicalForm.create({
    data: {
      userId: body.userId,

      nom: body.nom,
      prenom: body.prenom,
      sexe: body.sexe,
      dateNaissance: body.dateNaissance,
      age: body.age,
      nationalite: body.nationalite,
      matricule: body.matricule,
      service: body.service,
      lit: body.lit,
      residence: body.residence,
      telephone: body.telephone,
      etatCivil: body.etatCivil,

      couvertureSociale: body.couvertureSociale,

      groupeSanguin: body.groupeSanguin,
      poids: body.poids,
      taille: body.taille,

      allergie: body.allergie,
      allergieDetails: body.allergieDetails,

      dateHospitalisation: body.dateHospitalisation,
      motifHospitalisation: body.motifHospitalisation,
      diagnosticMedical: body.diagnosticMedical,
      diagnosticChirurgical: body.diagnosticChirurgical,

      membreConcerne: body.membreConcerne,
      typeIntervention: body.typeIntervention,
      autreIntervention: body.autreIntervention,
      dateIntervention: body.dateIntervention,

      typeAnesthesie: body.typeAnesthesie,
      dispositifPlace: body.dispositifPlace,

      antecedentsMedicaux: body.antecedentsMedicaux,
      antecedentsChirurgicaux: body.antecedentsChirurgicaux,

      kinesitherapie: body.kinesitherapie,

      traitements: {
        create: body.traitements.map((t: any) => ({
          traitement: t.traitement,
          dose: t.dose,
        })),
      },
    },
  });
}
