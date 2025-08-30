import multer from "multer";
import path from "path";

// Configuración de dónde guardar las imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products"); // Carpeta donde guardarás imágenes
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único
  },
});

// Validar solo imágenes
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|webp/;
  const extname = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Máx 5MB
  fileFilter,
});

export default upload;
