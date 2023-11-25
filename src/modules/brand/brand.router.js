import { Router } from "express";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { validation } from "../../middleware/validation.js";
import * as validators from './brand.validation.js'
import * as brandController from './controller/brand.js'
import { idValid } from "../globalValidation.js";
import isAuthenticated from "../../middleware/authentication.js";
import isAuthorized, { roles } from "../../middleware/authorization.js";
const router = Router()



router.route( '/' )
    .post(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( 'image' ),
        validation( validators.addBrandVal ),
        brandController.addBrand
    ).get(
        brandController.getAllBrands
)

router.route( '/:id' )
    .get(
        validation( idValid ),
        brandController.getBrandById
    )
    .put(
        isAuthenticated,
        isAuthorized(roles.admin),
        fileUpload( fileValidation.image ).single( 'image' ),
        validation( validators.updateBrandVal ),
        brandController.updateBrand
    )
    .delete(
        isAuthenticated,
        isAuthorized(roles.admin),
        validation( idValid ),
        brandController.deleteBrand
    );


export default router