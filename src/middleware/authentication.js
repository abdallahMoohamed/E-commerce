import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import { ErrorClass } from "../utils/errorClass.js";
import { asyncHandler } from "../utils/errorHandling.js";



const isAuthenticated = asyncHandler (async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization?.startsWith(process.env.BEARER_KEY)) {
        // return res.json({ message: "In-valid bearer key" })
        return next(new ErrorClass('In-valid bearer key'))
    }
    const token = authorization.split(process.env.BEARER_KEY)[1]
    if (!token) {
        // return res.json({ message: "In-valid token" })
        return next(new ErrorClass('In-valid token'))
    }
    const decoded = jwt.verify(token, process.env.TOKEN_SIGNATURE)
    if (!decoded?.id) {
        // return res.json({ message: "In-valid token payload" })
        return next(new ErrorClass('In-valid token payload'))
    }
    const authUser = await userModel.findById(decoded.id).select('-password')
    if (!authUser) {
        // return res.json({ message: "Not register account" })
        return next(new ErrorClass('Not register account'))
    }
    
    req.user = authUser;
    return next();
})

export default isAuthenticated;