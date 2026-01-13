import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { createMedicalForm } from "../services/medical.service";

const prisma = new PrismaClient();
const router = Router();

router.post('/medical-form', async (req, res) => {
  try {
    const result = await createMedicalForm(req.body);
    res.status(201).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur enregistrement dossier" });
  }
});
export default router;