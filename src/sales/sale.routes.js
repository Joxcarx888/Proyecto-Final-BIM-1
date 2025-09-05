import { Router } from "express";
import {
  createSale,
  listSales,
  updateSale,
  softDeleteSale,
  hardDeleteSale,
} from "./sale.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

// Crear venta
router.post("/", validarJWT, createSale);

// Listar ventas
router.get("/", validarJWT, listSales);

// Editar venta
router.put("/:id", validarJWT, updateSale);

// Soft delete
router.delete("/:id", validarJWT, softDeleteSale);

// Hard delete
router.delete("/hard/:id", validarJWT, hardDeleteSale);

export default router;
