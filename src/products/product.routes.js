import { Router } from "express";
import {saveProduct, listProducts, bestSellingProducts, searchProductsByName, filterProductsByCategory, updateProduct, deleteProduct, stockOut} from "./product.controller.js";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { existenteProducto } from "../helpers/db-validator.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

router.post(
  "/",
  [
    validarJWT,
    tieneRole("ADMIN"),
    validarCampos,
  ],
  saveProduct
);

router.get("/", listProducts);

router.get("/best-sellers", bestSellingProducts);

router.get("/search/:name", searchProductsByName);

router.get("/category/:categoryName", filterProductsByCategory);

router.put(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "No es un ID válido").isMongoId(),
        check("id").custom(existenteProducto),
        validarCampos,
    ],
    updateProduct
);

router.delete(
    "/:id",
    [
        validarJWT,
        tieneRole("ADMIN"),
        check("id", "No es un ID válido").isMongoId(),
        check("id").custom(existenteProducto),
        validarCampos,
    ],
    deleteProduct
);

router.get(
    "/stock-out",
    [
        validarJWT,
        tieneRole("ADMIN"),
    ],
    stockOut
);


export default router;
