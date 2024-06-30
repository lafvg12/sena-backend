import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const verifyToken = (token, secretKey) => {
    try {
        const verifyToken = jwt.verify(token,secretKey);
        return verifyToken;
    } catch (error) {
        return null;
    }
}

export const generateHashPassword = async (password) => {
    const passwordHashed = await bcrypt.hash(password, 10);
    return passwordHashed;
}

export const signTokenJWT = (data, secretKey) => {
    const token = jwt.sign(data, secretKey);
    return token;
}

export const comparePassword = async (password, hashStored ) => {
    const passwordHashed = await bcrypt.compare(password, hashStored);
    return passwordHashed;
}