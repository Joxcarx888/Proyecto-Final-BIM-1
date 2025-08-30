import User from '../users/user.model.js';
import Producto from '../products/product.model.js';
import Provider from "../providers/provider.model.js";




export const existenteEmail = async (email = '') =>{
    const existeEmail = await User.findOne({ email });

    if(existeEmail){
        throw new Error(`El email ${ email } ya existe en la base de datos`);
    }
}

export const existeUsuarioById = async (id = '') => {
    const existeUsuario = await User.findById(id);

    if(!existeUsuario){
        throw new Error(`El ID ${id} no existe`);
    }
}


export const existenteProducto = async (name = '') =>{
    const existenteProducto = await Producto.findOne({ name });

    if(existenteProducto){
        throw new Error(` ${ name } ya existe en la base de datos`);
    }
}

export const existenteProvider = async (name = '') => {
    const existente = await Provider.findOne({ name });
  
    if (existente) {
      throw new Error(`El proveedor con nombre "${name}" ya existe en la base de datos`);
    }
  };
