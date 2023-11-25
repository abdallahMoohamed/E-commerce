import { validation } from '../../middleware/validation.js';
import * as validators from './subcategory.validation.js'
import * as subcategoryController from './controller/subcategory.js'

import { Router } from "express";
import { fileUpload, fileValidation } from '../../utils/multer.js';
import isAuthenticated from '../../middleware/authentication.js';
import isAuthorized, { roles } from '../../middleware/authorization.js';
const router = Router({mergeParams:true})

router.route( '/' )
    .get( subcategoryController.getAllSubCategories )
    .post(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( "image" ),
        validation( validators.addSubCategory ),
        subcategoryController.addSubCategory
);
    
router.route( '/:subCategoryId' )
    .put(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( "image" ),
        validation( validators.updateSubCategory ),
        subcategoryController.updateSubCategory
    )
    .delete(
        isAuthenticated,
        isAuthorized(roles.admin),
        validation( validators.deleteSubCategory ),
        subcategoryController.deleteSubCategory
    )
    .get(
        validation(validators.getSubCategoryById),
        subcategoryController.getById
    )



   





export default router