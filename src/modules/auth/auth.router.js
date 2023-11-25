import { fileUpload, fileValidation } from '../../utils/multer.js';
import * as authController from './controller/registration.js'
import { Router } from "express";
const router = Router()


router.post( '/signUp',
    // must be written to use FORM-DATA on postman
    fileUpload(fileValidation.image).single('image'),
    authController.signUp
);
router.post( '/signIn',
    authController.signIn
);

router.patch( '/sendCode', authController.sendCode );

router.patch( '/resetPassword', authController.resetPassword );

router.patch( '/confirmEmail',
    authController.confirmEmail
);

    
export default router