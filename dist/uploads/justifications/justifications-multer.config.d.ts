export declare const justificationMulterOptions: {
    storage: import("multer").StorageEngine;
    limits: {
        fileSize: number;
    };
    fileFilter: (req: any, file: Express.Multer.File, cb: Function) => any;
};
