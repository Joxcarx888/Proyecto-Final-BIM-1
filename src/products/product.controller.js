import Product from "./product.model.js";

// Crear producto (sin asignar factura todavía)
export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      nombreArticulo,
      descripcion,
      proveedor,
      unidad,
      cantidad,
      costoUnitario,
      valorInventario,
      valorConIvaSugerido,
      valorReal,
    } = req.body;

    const product = new Product({
      sku,
      nombreArticulo,
      descripcion,
      proveedor,
      unidad,
      cantidad,
      costoUnitario,
      valorInventario,
      valorConIvaSugerido,
      valorReal,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      product,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el producto",
      error: error.message || error,
    });
  }
};

// Editar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el producto",
      error,
    });
  }
};

// Listar productos activos
export const listProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true })
      .populate("proveedor", "name email number")
      .populate("factura", "fecha numero serie"); // si ya existe

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error,
    });
  }
};

// Soft delete (status: false)
export const softDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndUpdate(
      id,
      { status: false },
      { new: true }
    );

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado (soft) correctamente",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error,
    });
  }
};

// Hard delete
export const hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      message: "Producto eliminado permanentemente",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error,
    });
  }
};
