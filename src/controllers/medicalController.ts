import { Request, Response } from "express";
import * as medicalService from "../services/medical.service";

export async function createMedicalFormController(req: Request, res: Response) {
  try {
    const form = await medicalService.createMedicalForm(req.body);
    return res.status(201).json({ success: true, data: form });
  } catch (error: any) {
    console.error("Error creating medical form:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création du dossier",
      error: error?.message ?? String(error),
    });
  }
}

export async function getAllMedicalFormsController(_req: Request, res: Response) {
  try {
    const forms = await medicalService.getAllMedicalForms();
    return res.status(200).json({ success: true, data: forms });
  } catch (error: any) {
    console.error("Error getting medical forms:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des dossiers",
      error: error?.message ?? String(error),
    });
  }
}

export async function getMedicalFormByIdController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    const form = await medicalService.getMedicalFormById(id);
    if (!form) return res.status(404).json({ success: false, message: "Dossier non trouvé" });

    return res.status(200).json({ success: true, data: form });
  } catch (error: any) {
    console.error("Error getting medical form by id:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error?.message ?? String(error),
    });
  }
}

export async function updateMedicalFormController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    const updated = await medicalService.updateMedicalForm(id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: "Dossier non trouvé" });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    console.error("Error updating medical form:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour",
      error: error?.message ?? String(error),
    });
  }
}

export async function deleteMedicalFormController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: "ID invalide" });

    await medicalService.deleteMedicalForm(id);
    return res.status(204).send();
  } catch (error: any) {
    console.error("Error deleting medical form:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression",
      error: error?.message ?? String(error),
    });
  }
}
