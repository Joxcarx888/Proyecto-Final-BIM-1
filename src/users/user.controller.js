import User from "./user.model.js";
import argon2 from "argon2";

// Editar usuario (solo ADMIN)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, role, ...resto } = req.body;

    const updateData = { ...resto };

    // Si viene nueva contraseña, la encriptamos
    if (password) {
      updateData.password = await argon2.hash(password);
    }

    // Si viene rol, lo actualizamos
    if (role) {
      updateData.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el usuario" });
  }
};

// Eliminar usuario (solo ADMIN) - eliminación lógica
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const userDeleted = await User.findByIdAndUpdate(
      id,
      { state: false },
      { new: true }
    );

    if (!userDeleted) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Usuario deshabilitado correctamente", user: userDeleted });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Eliminar físico (solo ADMIN)
export const deleteUserHard = async (req, res) => {
  try {
    const { id } = req.params;

    const userDeleted = await User.findByIdAndDelete(id);

    if (!userDeleted) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Usuario eliminado permanentemente" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// Listar usuarios (solo los activos)
export const listUsers = async (req, res) => {
  try {
    const users = await User.find({ state: true }).select("-password"); // excluimos el password
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al listar usuarios" });
  }
};

