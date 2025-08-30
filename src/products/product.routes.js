import { Router } from "express";
import { check } from "express-validator";
import { createProduct, updateProduct, listProducts, softDeleteProduct, hardDeleteProduct } from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";
import upload from "../middlewares/upload.js";

const router = Router();

// Crear producto (Admin)
router.post(
  "/",
  [validarJWT, tieneRole("ADMIN")],
  upload.array("imagenes", 5),
  createProduct
);


// Editar producto (Admin)
router.put(
  "/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  upload.array("imagenes", 5),
  updateProduct
);


// Listar productos
router.get("/", listProducts);

// Soft delete (Admin)
router.delete(
  "/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  softDeleteProduct
);

// Hard delete (Admin)
router.delete(
  "/hard/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "ID inválido").isMongoId(),
  ],
  hardDeleteProduct
);

export default router;
