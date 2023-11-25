import jwt from 'jsonwebtoken'
import crypto from 'crypto';


export const generateToken = ({ payload = {}, signature = process.env.TOKEN_SIGNATURE, expiresIn = 60 * 60 } = {}) => {
    const token = jwt.sign(payload, signature, { expiresIn: parseInt(expiresIn) });
    return token
}

export const verifyToken = ({ token, signature = process.env.TOKEN_SIGNATURE } = {}) => {
    const decoded = jwt.verify(token, signature);
    return decoded
}



export const generateCode = () => {
    const min = 100000, max = 999999;
    const randomBytes = crypto.randomBytes(4); // Generate 4 random bytes (32 bits)
    const randomValue = randomBytes.readUInt32BE(0); // Convert bytes to an unsigned 32-bit integer
    const range = max - min + 1;
    const scaledValue = min + (randomValue % range); // Scale to fit the desired range
    return scaledValue;
}


