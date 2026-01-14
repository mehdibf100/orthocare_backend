import { Router } from "express";
import * as controller from "../controllers/medicalController";

const router = Router();

router.post("/", controller.createMedicalFormController);
router.get("/", controller.getAllMedicalFormsController);
router.get("/:id", controller.getMedicalFormByIdController);


export default router;
