import { Router } from "express";
import { check } from "express-validator";
import { createProduct, updateProduct, listProducts, softDeleteProduct, hardDeleteProduct } from "./product.controller.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

// Crear producto (Admin)
router.post(
  "/",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("sku", "El SKU es obligatorio").notEmpty(),
    check("nombreArticulo", "El nombre del artículo es obligatorio").notEmpty(),
    check("descripcion", "La descripción es obligatoria").notEmpty(),
    check("proveedor", "Proveedor inválido").isMongoId(),
    check("unidad", "La unidad es obligatoria").notEmpty(),
    check("cantidad", "Cantidad inválida").isNumeric(),
    check("costoUnitario", "Costo unitario inválido").isNumeric(),
    check("valorInventario", "Valor inventario inválido").isNumeric(),
    check("valorConIvaSugerido", "Valor con IVA inválido").isNumeric(),
    check("valorReal", "Valor real inválido").isNumeric(),
  ],
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
