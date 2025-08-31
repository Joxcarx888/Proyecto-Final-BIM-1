import jwt from 'jsonwebtoken';

export const generarJWT = (uid = '', role = 'USER') => {
    return new Promise((resolve, reject) => {
        const payload = { uid, role }; 
        jwt.sign(
            payload,
            process.env.SECRETORPRIVATEKEY,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) reject('No se pudo generar el token');
                else resolve(token);
            }
        );
    });
};
