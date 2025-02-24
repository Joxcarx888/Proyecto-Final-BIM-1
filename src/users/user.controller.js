import { response } from "express";
import { hash, verify } from "argon2";
import User from "./user.model.js";

export const updateUser = async (req, res = response) => {
    try {
        const { id } = req.params; 
        const userId = req.usuario._id; 
        const userRole = req.usuario.role; 
        const { password, newPassword, role, ...data } = req.body;

        // Si es CLIENT, solo puede editar su propio perfil
        const userToUpdateId = userRole === "CLIENT" ? userId.toString() : id;

        const existingUser = await User.findById(userToUpdateId);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        // Permitir solo a ADMIN modificar el rol
        if (userRole === "ADMIN" && role) {
            data.role = role;
        } else if (userRole !== "ADMIN" && userId.toString() !== userToUpdateId) {
            // Si no es ADMIN y no está editando su propio perfil
            return res.status(403).json({
                success: false,
                msg: "No tienes permisos para modificar este usuario"
            });
        }

        // Asegura que el email no se modifique
        data.email = existingUser.email;

        // Manejo de cambio de contraseña
        if (newPassword) {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    msg: "Debe ingresar su contraseña actual para cambiarla"
                });
            }

            const esIgual = await verify(existingUser.password, password);
            if (!esIgual) {
                return res.status(400).json({
                    success: false,
                    msg: "La contraseña actual es incorrecta"
                });
            }

            data.password = await hash(newPassword);
        }

        const user = await User.findByIdAndUpdate(userToUpdateId, data, { new: true });

        res.status(200).json({
            success: true,
            msg: "Usuario actualizado",
            user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            msg: "Error al actualizar usuario",
            error
        });
    }
};




export const deleteUser = async (req, res) => {
    try {
        
        const { id } = req.params; 
        const userId = req.usuario._id; 
        const userRole = req.usuario.role; 

        const userToDeleteId = userRole === "CLIENT" ? userId : id;

        const user = await User.findById(userToDeleteId);
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado",
            });
        }

        if (userRole === "CLIENT") {
            const { password } = req.body; 
            if (!password) {
                return res.status(400).json({
                    success: false,
                    msg: "Debe ingresar su contraseña para desactivar su cuenta"
                });
            }

            const esIgual = await verify(user.password, password);
            if (!esIgual) {
                return res.status(400).json({
                    success: false,
                    msg: "La contraseña actual es incorrecta"
                });
            }
        }

        user.estado = false;
        await user.save();

        res.status(200).json({
            success: true,
            msg: "Usuario desactivado",
            user
        });

    } catch (error) {
        console.error("Error en deleteUser:", error);

        res.status(500).json({
            success: false,
            msg: "Error al desactivar usuario",
            error: error.message || error
        });
    }
};
