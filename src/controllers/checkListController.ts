// checkListController.ts
import { Router, Request, Response } from "express";
import checkListService from "../services/checkList.service";

const router = Router();

// Créer une nouvelle checklist
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId, ...checklistData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId est requis" });
    }

    const result = await checkListService.createOrUpdateChecklist(
      userId,
      checklistData
    );

    if (result.exists) {
      return res.status(409).json({
        message: "Vous avez déjà soumis une checklist aujourd'hui",
        checklist: result.checklist,
      });
    }

    return res.status(201).json({
      message: "Checklist créée avec succès",
      checklist: result.checklist,
    });
  } catch (error: any) {
    console.error("Erreur lors de la création de la checklist:", error);
    return res.status(500).json({
      error: "Erreur lors de la création de la checklist",
      details: error.message,
    });
  }
});

// Récupérer la checklist d'aujourd'hui pour un utilisateur
router.get("/today/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "userId invalide" });
    }

    const checklist = await checkListService.getTodayChecklist(userId);

    if (!checklist) {
      return res.status(404).json({ message: "Aucune checklist trouvée pour aujourd'hui" });
    }

    return res.status(200).json(checklist);
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la checklist:", error);
    return res.status(500).json({
      error: "Erreur lors de la récupération de la checklist",
      details: error.message,
    });
  }
});

// Récupérer toutes les checklists d'un utilisateur
router.get("/user/:userId", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "userId invalide" });
    }

    const checklists = await checkListService.getUserChecklists(userId);

    return res.status(200).json(checklists);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des checklists:", error);
    return res.status(500).json({
      error: "Erreur lors de la récupération des checklists",
      details: error.message,
    });
  }
});

// Supprimer une checklist
router.delete("/:id/:userId", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const userId = parseInt(req.params.userId);

    if (isNaN(id) || isNaN(userId)) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    await checkListService.deleteChecklist(id, userId);

    return res.status(200).json({ message: "Checklist supprimée avec succès" });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la checklist:", error);
    return res.status(500).json({
      error: "Erreur lors de la suppression de la checklist",
      details: error.message,
    });
  }
});

export default router;