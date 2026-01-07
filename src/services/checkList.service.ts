// checklist.service.ts
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
      'typeIntervention', 'coteOperer', 'autreCote', 'traitementEnCours',
      'autreRisque', 'perfusion', 'vidangeVesicale', 'oxygenotherapie',
      'transfusion', 'horaire', 'ta', 'fc', 'fr', 'spo2', 'gad', 'temp',
      'typeAnesthesie', 'heureInduction', 'heureIncision', 'heureFermeture',
      'heureExtubation', 'heureSortie', 'etatPeau', 'typeDrain',
      'quantiteDrain', 'aspectSecretions', 'dateChangement', 'dateAblation',
      'dateSortie'
    ];

    // Liste des champs Boolean
    const booleanFields = [
      'identiteConfirmee', 'siteMarque', 'rougeur', 'douleur', 'lesions',
      'allergie', 'douleurEVA', 'risque', 'chute', 'confusion', 'escarre',
      'saignement', 'troubleMobilite', 'consentement', 'informationPatient',
      'dossierSoins', 'jeun', 'douche', 'preparationPeau', 'bilanSanguin',
      'examensComplementaires', 'premedication', 'bijouxOtes',
      'installationSpecifique', 'aiderHabillage', 'gererInstruments',
      'assurerTracabilite', 'verifierDocumentation', 'surveillance',
      'surveillanceOperatoire', 'gestionDouleur', 'surveillanceConscience',
      'surveillanceEtat', 'passationDonnees', 'vitales', 'pansementSaignement',
      'pansementEcoulement', 'eva', 'perfusionPost', 'traitementPrescrit',
      'mobilisation', 'repriseMobilite', 'surveillanceParametres',
      'autonomieAideHygiene', 'changementPansement', 'changementDrains',
      'medicPrescription', 'surveillanceDouleur', 'surveillanceHydratationNutrition',
      'surveillancePsy', 'educationPatient', 'participationSortie'
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

    // Traiter le champ JSON pour les traitements
    if (data.traitements && Array.isArray(data.traitements) && data.traitements.length > 0) {
      cleaned.traitements = data.traitements;
    }

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