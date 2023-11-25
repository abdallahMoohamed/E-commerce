import { fileUpload, fileValidation } from '../../utils/multer.js';
import * as categoryController from './controller/category.js'
import * as validators from './category.validation.js'
import { Router } from "express";
import { validation } from '../../middleware/validation.js';
import subcategoryRouter from '../subcategory/subcategory.router.js'
import isAuthenticated from '../../middleware/authentication.js';
import isAuthorized, { roles } from '../../middleware/authorization.js';
const router = Router()

// merge params 
router.use( '/:categoryId/subCategory/', subcategoryRouter );


router.route( '/')
    .post(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( "image" ),
        validation( validators.addCategoryVal ),
        categoryController.addCategory
    )
    .get(
        categoryController.getAllCategories
    )
    
router.route( '/:categoryId' )
    .put(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( "image" ),
        validation( validators.updateCategoryVal ),
        categoryController.updateCategory
    )
    .delete(
        isAuthenticated,
        isAuthorized(roles.admin),
        validation( validators.deleteCategoryVal ), 
        categoryController.deleteCategory
    )
    .get(
        validation( validators.getCategoryByIdVal ),
        categoryController.getCategoryById
);
    



export default router