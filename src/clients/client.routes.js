import { Router } from "express";
import { check } from "express-validator";
import {
  createClient,
  updateClient,
  listClients,
  hardDeleteClient,
} from "./client.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";

const router = Router();

// Crear cliente
router.post(
  "/",
  [
    validarJWT,
  ],
  createClient
);

// Editar cliente
router.put(
  "/:id",
  [
    validarJWT,
    check("id", "ID inválido").isMongoId(),
  ],
  updateClient
);

// Listar clientes activos
router.get("/", listClients);

// Hard delete cliente
router.delete(
  "/:id",
  [
    validarJWT,
    check("id", "ID inválido").isMongoId(),
  ],
  hardDeleteClient
);

export default router;
