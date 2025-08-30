import { Router } from "express";
import { check } from "express-validator";
import { createProvider, updateProvider, listProviders, softDeleteProvider, hardDeleteProvider } from "./provider.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

// Crear proveedor (Admin)
router.post(
  "/",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("name", "El nombre es obligatorio").notEmpty(),
    check("number", "El número es obligatorio").notEmpty(),
  ],
  createProvider
);

// Editar proveedor (Admin)
router.put(
  "/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  updateProvider
);

// Listar proveedores activos
router.get("/", listProviders);

// Soft delete (Admin)
router.delete(
  "/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  softDeleteProvider
);

// Hard delete (Admin)
router.delete(
  "/hard/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  hardDeleteProvider
);

export default router;
