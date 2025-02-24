import { Schema, model } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre de la categoría es requerido"],
      maxLength: [100, "No más de 100 caracteres"],
      minLength: [3, "Mínimo 3 caracteres"],
      trim: true,
      unique: true,
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

export default model("Category", CategorySchema);
