import { errorsAuth } from "../../constants.js";

export const authorizationMiddleware  = (req, res, next) => {

    try {
      const auth = req.headers.authorization ?? null;
      if (auth.split(' ')[1] === 'null') {
        throw new Error(errorsAuth.NOT_TOKEN_PROVIDE);
    
      }
      const verifyAuth = verifyToken(auth.split(' ')[1], process.env.SECRET_KEY);
  
      if (!verifyAuth) {
        throw new Error(errorsAuth.NOT_AUTHORIZED);
      }
      next()
    } catch (error) {
      res.status(401).json(
        {
         message:  error.message,
         access: 'Access denied'
        })
  }
  }