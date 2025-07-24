// helpers/generarJWT.js
import jwt from 'jsonwebtoken';

const generarJWT = (id) => {
    // Se va almacenar el id del usuario
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

export default generarJWT;