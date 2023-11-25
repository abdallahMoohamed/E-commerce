import isAuthenticated from "../../middleware/authentication.js";
import { validation } from "../../middleware/validation.js";
import * as cartController from './controller/cart.js'
import * as schema from './cart.validation.js'
import { Router } from "express";
const router = Router()



router.route( '/' )
    .post(
        isAuthenticated,
        validation( schema.cartSchema ),
        cartController.addToCart
    )
    .get(
        isAuthenticated,
        cartController.getUserCart
    );

// update cart 
router.patch( '/udpateCart', isAuthenticated, validation( schema.cartSchema ), cartController.updateCart )

// clear cart 
router.patch( '/clearCart', isAuthenticated, cartController.clearCart )

// remove product from cart 
router.patch( '/:productId',
    isAuthenticated,
    validation( schema.removeProdcutFromCartSchema ),
    cartController.removeProductFromCart
)


export default router