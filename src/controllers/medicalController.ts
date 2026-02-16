import { Router, Request, Response } from "express";
import * as medicalService from "../services/medical.service";

const router = Router();

/* CREATE */
router.post("/", async (req: Request, res: Response) => {
  try {
    const form = await medicalService.createMedicalForm(req.body);
    return res.status(201).json({ success: true, data: form });
  } catch (err: any) {
    if (err.message === "InvalidMedicalFormData") {
      return res.status(400).json({ error: "Données médicales invalides" });
    }
    console.error("Create medical form error:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* GET ALL */
/* GET ALL - avec filtre optionnel par codeService */
router.get("/", async (req: Request, res: Response) => {
  try {
    const codeServiceRaw = req.query.codeService;

    const codeService =
      typeof codeServiceRaw === "string" ? codeServiceRaw : undefined;

    console.log("Query params:", req.query);
    console.log("codeService utilisé:", codeService);

    const forms = await medicalService.getAllMedicalForms(codeService);

    return res.status(200).json({
      success: true,
      count: forms.length,
      data: forms,
    });
  } catch (err: any) {
    console.error("GET medical error:", err.message);
    console.error(err.stack);

    return res.status(500).json({
      error: "Erreur serveur",
      details: err.message,
    });
  }
});


/* GET BY ID */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const form = await medicalService.getMedicalFormById(id);
    return res.status(200).json({ success: true, data: form });
  } catch (err: any) {
    if (err.message === "MedicalFormNotFound") {
      return res.status(404).json({ error: "Dossier non trouvé" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* UPDATE */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    const updated = await medicalService.updateMedicalForm(id, req.body);
    return res.status(200).json({ success: true, data: updated });
  } catch (err: any) {
    if (err.message === "MedicalFormNotFound") {
      return res.status(404).json({ error: "Dossier non trouvé" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

/* DELETE */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "ID invalide" });

    await medicalService.deleteMedicalForm(id);
    return res.status(204).send();
  } catch (err: any) {
    if (err.message === "MedicalFormNotFound") {
      return res.status(404).json({ error: "Dossier non trouvé" });
    }
    console.error(err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
