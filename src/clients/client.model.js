import { Schema, model } from "mongoose";

const ClientSchema = new Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del cliente es requerido"],
      maxLength: [100, "No más de 100 caracteres"],
      minLength: [3, "Mínimo 3 caracteres"],
      trim: true,
    },
    nit: {
      type: String,
      required: [true, "El NIT es requerido"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default model("Client", ClientSchema);
