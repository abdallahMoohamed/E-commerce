
import * as productController from './controller/product.js'
import { fileUpload, fileValidation } from "../../utils/multer.js";
import * as validators from './product.validation.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import isAuthenticated from '../../middleware/authentication.js';
import isAuthorized, { roles } from '../../middleware/authorization.js';
const router = Router()


router.route( '/' )
    .get(
        productController.getAllProducts
    )
    .post(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).fields( [
            { name: 'image', maxCount: 1 }, // defualt array[{}]
            { name: 'coverImages', maxCount: 5 }
        ] ),    
        validation(validators.addProductsVal),
        productController.addProduct
    );
        

export default router