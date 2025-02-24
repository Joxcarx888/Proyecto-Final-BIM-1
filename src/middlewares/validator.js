import { body } from "express-validator";
import { validarCampos } from "./validar-campos.js";
import { existenteEmail } from "../helpers/db-validator.js";


export const registerValidator = [
    
    body("name", "The name is required").not().isEmpty(),
    body("email", "You must enter a valid email").not().isEmpty().isEmail(),
    body("email").custom(existenteEmail),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),
    validarCampos
];

export const loginValidator = [
    body("email").optional().isEmail().withMessage("Enter a valid email address"),
    body("username").optional().isString().withMessage("Enter a valid username"),
    body("password", "Password must be at least 8 characters").isLength({ min: 8 }),
    validarCampos
];