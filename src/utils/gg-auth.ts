import speakeasy from "speakeasy";
import {config} from "../config";

const requestGoogleAuth = async (email: string) => {
    try {
        let secret = speakeasy.generateSecret({ length: 10 });
        // Use otpauthURL() to get a custom authentication URL for SHA512
        let url = speakeasy.otpauthURL({ secret: secret.ascii, label: `${config.app_name}:` + email, issuer: config.app_name });

        return {
            key_2fa: secret.base32,
            secret: secret,
            url: url
        };
    }
    catch (err) {
        console.log('request_google_auth', err);
        return null;
    }
};

const checkAuthCode = (code: string, key: string) => {
    // Use verify() to check the token against the secret
    const verified = speakeasy.totp.verify({
        secret: key,
        encoding: 'base32',
        token: code,
    })

    return verified
}

export const GGAuth = {
    requestGoogleAuth,
    checkAuthCode,
}
