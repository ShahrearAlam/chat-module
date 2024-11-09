import jwt from "jsonwebtoken"

export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d"
    })
}

export const generateSSOTokenForIqSocial = (id) => {
    return jwt.sign({ id }, process.env.IQSOCIAL_SSO_JWT_SECRET, {
        expiresIn: "30d"
    })
}
