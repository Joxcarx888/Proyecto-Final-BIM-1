import { Router } from "express";
import { check } from "express-validator";
import { updateUser, deleteUser, deleteUserHard } from "./user.controller.js";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { tieneRole } from "../middlewares/validar-roles.js";

const router = Router();

// Editar usuario (solo ADMIN)
router.put(
  "/editar/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "No es un ID válido").isMongoId(),
    check("password", "La contraseña debe tener al menos 8 caracteres").optional().isLength({ min: 8 }),
    check("role", "Rol inválido").optional().isIn(["ADMIN", "USER"]),
    validarCampos
  ],
  updateUser
);


// Eliminar usuario lógico (solo ADMIN)
router.delete(
  "/eliminar/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "No es un ID válido").isMongoId(),
    validarCampos
  ],
  deleteUser
);

// Eliminar usuario físico (solo ADMIN)
router.delete(
  "/hard/:id",
  [
    validarJWT,
    tieneRole("ADMIN"),
    check("id", "No es un ID válido").isMongoId(),
    validarCampos
  ],
  deleteUserHard
);

export default router;
