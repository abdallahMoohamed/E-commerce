import { Router } from "express";
import isAuthenticated from "../../middleware/authentication.js";
import isAuthorized, { roles } from "../../middleware/authorization.js";
import { validation } from "../../middleware/validation.js";
import * as validators from './coupon.validation.js'
import * as couponController from './controller/coupon.js'
const router = Router()


//create
router.post( '/',
    isAuthenticated,
    isAuthorized( [roles.admin] ),
    validation(validators.createCouponSchema),
    couponController.createCoupon
)

//update
router.put( '/:code',
    isAuthenticated,
    isAuthorized( [roles.admin] ),
    validation(validators.updateCouponSchema),
    couponController.updateCoupon
)
//delete
router.delete( '/:code',
    isAuthenticated,
    isAuthorized( [roles.admin] ),
    validation(validators.deleteCouponSchema),
    couponController.deleteCoupon
)

// read 
router.get("/",couponController.allCoupons)


export default router