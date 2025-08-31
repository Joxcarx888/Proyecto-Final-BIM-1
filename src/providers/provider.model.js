import { Schema, model } from "mongoose";

const ProviderSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre del proveedor es requerido"],
      maxLength: [100, "No más de 100 caracteres"],
      minLength: [3, "Mínimo 3 caracteres"],
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
    },
    number: {
      type: String,
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

export default model("Provider", ProviderSchema);
