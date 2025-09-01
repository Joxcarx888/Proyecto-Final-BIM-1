import Product from "./product.model.js";
import fs from "fs";

// Crear producto (con imágenes)
export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      nombreArticulo,
      descripcion,
      proveedor,
      factura,
      unidad,
      cantidad,
      costoUnitario,
      valorInventario,
      valorConIvaSugerido,
      valorReal,
    } = req.body;

    // Guardar rutas de imágenes
    const imagenes = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];


    const product = new Product({
      sku,
      nombreArticulo,
      descripcion,
      proveedor,
      factura,
      unidad,
      cantidad,
      costoUnitario,
      valorInventario,
      valorConIvaSugerido,
      valorReal,
      imagenes,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente con imágenes",
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

// Editar producto (opción de actualizar imágenes)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Actualizar campos normales
    const updateData = { ...req.body };

    // Si llegan nuevas imágenes
    if (req.files && req.files.length > 0) {
      // Borrar imágenes anteriores del servidor si quieres limpiar
      if (product.imagenes && product.imagenes.length > 0) {
        product.imagenes.forEach(imgPath => {
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        });
      }

      // Guardar nuevas imágenes
      updateData.imagenes = req.files.map(file => file.path);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });

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
      error: error.message || error,
    });
  }
};

// Listar productos activos con imágenes
export const listProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: true })
      .populate("proveedor", "name email number")
      .populate("factura", "fechaCompra noFactura serieFactura");

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error al listar productos:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error: error.message || error,
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
      error: error.message || error,
    });
  }
};

// Hard delete
export const hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Borrar imágenes del servidor
    if (product.imagenes && product.imagenes.length > 0) {
      product.imagenes.forEach(imgPath => {
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      });
    }

    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Producto eliminado permanentemente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message || error,
    });
  }
};
