import { diskStorage } from 'multer';

export const justificationMulterOptions = {
  storage: diskStorage({
    //Dossier de stockage
    destination: 'uploads/justifications',
    
    //) Nom unique pour éviter les collisions
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^\w.-]/g, '_'); 
      cb(null, `${uniqueSuffix}-${safeName}`);
    },
  }),

  // Limite taille fichier ( 5 Mo)
  limits: { fileSize: 5 * 1024 * 1024 },

  // Types autorisés
  fileFilter: (req: any, file: Express.Multer.File, cb: Function) => {
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.mimetype)) return cb(new Error('Type de fichier non autorisé'), false);
    cb(null, true);
  },
};
