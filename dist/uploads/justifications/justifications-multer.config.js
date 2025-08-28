"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.justificationMulterOptions = void 0;
const multer_1 = require("multer");
exports.justificationMulterOptions = {
    storage: (0, multer_1.diskStorage)({
        destination: 'uploads/justifications',
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const safeName = file.originalname.replace(/[^\w.-]/g, '_');
            cb(null, `${uniqueSuffix}-${safeName}`);
        },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
        if (!allowedTypes.includes(file.mimetype))
            return cb(new Error('Type de fichier non autorisé'), false);
        cb(null, true);
    },
};
//# sourceMappingURL=justifications-multer.config.js.map