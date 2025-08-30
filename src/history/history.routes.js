import { Router } from "express";
import { registerProduct, withdrawProduct, getHistory } from "./history.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";

const router = Router();

router.get('/get-history/', getHistory)

router.post(
  "/register-product/:id", 
  [
    validarCampos
  ], 
  registerProduct
)

router.post(
  "/withdraw-product/:id", 
  [
    validarCampos,
  ], 
  withdrawProduct
)

export default router;