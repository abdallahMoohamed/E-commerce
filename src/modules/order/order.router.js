import { Router } from "express";
import isAuthenticated from "../../middleware/authentication.js";
import * as orderController from './controller/order.js'
import * as Val from './order.validation.js'
import { validation } from '../../middleware/validation.js';
const router = Router()



router.post( '/', isAuthenticated, validation( Val.addProductsVal ), orderController.createOrder )



export default router