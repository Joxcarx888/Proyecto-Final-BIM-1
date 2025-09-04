import Client from "./client.model.js";

// Crear cliente
export const createClient = async (req, res) => {
  try {
    const { nombre, nit, email, telefono } = req.body;

    const client = new Client({ nombre, nit, email, telefono });
    await client.save();

    res.status(201).json({
      success: true,
      message: "Cliente creado exitosamente",
      client,
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el cliente",
      error: error.message || error,
    });
  }
};

// Editar cliente
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nit, email, telefono } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      id,
      { nombre, nit, email, telefono },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Cliente actualizado exitosamente",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el cliente",
      error: error.message || error,
    });
  }
};

// Listar clientes activos
export const listClients = async (req, res) => {
  try {
    const clients = await Client.find({ status: true });
    res.json({
      success: true,
      clients,
    });
  } catch (error) {
    console.error("Error al listar clientes:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener los clientes",
      error: error.message || error,
    });
  }
};

// Hard delete (Eliminar cliente permanentemente)
export const hardDeleteClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClient = await Client.findByIdAndDelete(id);

    if (!deletedClient) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Cliente eliminado permanentemente",
      client: deletedClient,
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar cliente",
      error: error.message || error,
    });
  }
};
