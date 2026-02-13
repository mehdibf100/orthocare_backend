import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CheckListService {
  // Créer ou mettre à jour une checklist
  async createOrUpdateChecklist(userId: number, data: any) {
    // Obtenir la date d'aujourd'hui sans l'heure (format: YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Vérifier si une checklist existe déjà pour cet utilisateur aujourd'hui
      const existingChecklist = await prisma.checklist.findFirst({
        where: {
          userId: userId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        },
      });

      if (existingChecklist) {
        return { exists: true, checklist: existingChecklist };
      }

      // Nettoyer les données avant l'insertion
      const cleanedData = this.cleanChecklistData(data);

      // Créer une nouvelle checklist
      const checklist = await prisma.checklist.create({
        data: {
          userId: userId,
          date: today,
          ...cleanedData,
        },
      });

      return { exists: false, checklist };
    } catch (error) {
      console.error("Erreur dans createOrUpdateChecklist:", error);
      throw error;
    }
  }

  // Nettoyer les données pour éviter les erreurs de type
  private cleanChecklistData(data: any) {
    const cleaned: any = {};

    // Liste des champs String
    const stringFields = [
      'typeIntervention',
      'coteOperer',
      'autreCote',
      'etatSiteOperatoire',
      'examenPreAG'
    ];

    // Liste des champs Boolean
    const booleanFields = [
      // Accueil et évaluation
      'identiteConfirmee',
      'allergieMedicamenteuse',
      'allergieMateriel',
      
      // Préparation administrative
      'consentementVerifie',
      'biaisAdmission',
      'dossierComplet',
      'informationPatient',
      'dossierSoins',
      
      // Contrôle prescriptions
      'arretAnticoagulant',
      'arretAntiagregantsPlaquettaires',
      'arretAINS',
      'arretAntidiabetiqueOral',
      'ajustementInsuline',
      'ajustementCorticoides',
      'autreTraitement',
      'premedication',
      'perfusionsPrescrites',
      'nebulisationOxygenotherapie',
      'transfusionSanguine',
      
      // Préparation physique
      'jeunConfirme',
      'examensComplementaires',
      'preparationCutanee',
      'doucheAntiseptique',
      'habillagePatient',
      'surveillanceParametresVitaux',
      
      // Phase préopératoire
      'materielSterile',
      'epi',
      'systemeAspiration',
      'garrouPneumatique',
      'bistouriElectrique',
      'tableOperatoire',
      'scialytique',
      'scope',
      'checklistDMI',
      'coordinationMateriel',
      'preparationChariot',
      'accueilPatient',
      'verificationIdentite',
      'concordanceDossier',
      'consentementLibreEclaire',
      'confirmationIntervention',
      'documentationDisponible',
      'retraitBijoux',
      'retraitProteses',
      'retraitLunettes',
      'jeunConfirmeBloc',
      'priseEnChargePsy',
      'positionnementPatient',
      'assistanceMedecin',
      'collaborationEquipe',
      
      // Phase per-opératoire
      'realisationPansement',
      'interventionIncident',
      
      // Phase post-opératoire
      'gestionComptageMatériel',
      'tracabiliteRegistre',
      'declarationIncident',
      'sterilisationMateriel',
      'surveillanceTransport',
      
      // Surveillance immédiate
      'verificationConstantes',
      'surveillancePansement',
      'surveillanceDrains',
      'evaluationDouleur',
      'surveillanceBiologique',
      'perfusionTransfusion',
      'medicationPrescrite',
      'accompagnementLever',
      'surveillanceAutonomie',
      'aideSoinsHygiene'
    ];

    // Traiter les champs String
    stringFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
        cleaned[field] = String(data[field]);
      }
    });

    // Traiter les champs Boolean
    booleanFields.forEach(field => {
      if (data[field] !== undefined && data[field] !== null) {
        cleaned[field] = Boolean(data[field]);
      }
    });

    return cleaned;
  }

  // Récupérer la checklist d'aujourd'hui pour un utilisateur
  async getTodayChecklist(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    try {
      const checklist = await prisma.checklist.findFirst({
        where: {
          userId: userId,
          date: {
            gte: today,
            lt: tomorrow
          }
        },
      });

      return checklist;
    } catch (error) {
      console.error("Erreur dans getTodayChecklist:", error);
      throw error;
    }
  }

  // Récupérer toutes les checklists d'un utilisateur
  async getUserChecklists(userId: number) {
    try {
      const checklists = await prisma.checklist.findMany({
        where: {
          userId: userId,
        },
        orderBy: {
          date: 'desc',
        },
      });

      return checklists;
    } catch (error) {
      console.error("Erreur dans getUserChecklists:", error);
      throw error;
    }
  }

  // Supprimer une checklist
  async deleteChecklist(id: number, userId: number) {
    try {
      const checklist = await prisma.checklist.deleteMany({
        where: {
          id: id,
          userId: userId,
        },
      });

      return checklist;
    } catch (error) {
      console.error("Erreur dans deleteChecklist:", error);
      throw error;
    }
  }
}

export default new CheckListService();