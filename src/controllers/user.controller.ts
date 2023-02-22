import {UserModel} from "../models";
import {ActiveStatus, ErrorCode, GGAuth, UserStatus, Utils} from "../utils";
import {doQuery} from "../databases";

export class UserController {
    public static async getByEmail(email: string) {
        return UserModel.getByEmail("email", email);
    }

    public static async get(userId: number) {
        const user: any = await UserModel.get(userId);
        if (!user) throw ErrorCode.USER_NOT_FOUND;
        delete user.gg_auth_key;
        return user;
    }

    public static async changePassword(
        user_id: number,
        password: string,
        new_password: string
    ) {
        // check email exist
        const user_auth = await UserModel.getUserAuth(user_id);
        if (user_auth) {
            // check password
            const isValidPw = await Utils.comparePassword(
                password,
                user_auth.password_hash
            );
            if (!isValidPw) throw ErrorCode.PASSWORD_IS_INVALID;
            await UserModel.updatePassword(user_id, new_password);
        } else {
            await doQuery.insertRow("user_auths", {
                user_id,
                password_hash: await Utils.hashPassword(new_password),
            });
        }
        // update user
    }

    public static async requestGGAuth(user_id: number) {
        const userInfo = await UserModel.get(user_id);
        if (!userInfo) throw ErrorCode.USER_NOT_FOUND

        if (userInfo.status === UserStatus.BANNED)
            throw ErrorCode.USER_BANNED;

        if (userInfo.gg_auth_enable) {
            throw ErrorCode.GG_AUTH_ENABLED;
        }

        let authInfo = await GGAuth.requestGoogleAuth(userInfo.email);

        return authInfo;
    };

    public static async enableGGAuth(user_id: number, auth_code: string, gg_auth_key: string) {
        const userInfo = await UserModel.get(user_id);
        if (!userInfo) throw ErrorCode.USER_NOT_FOUND

        if (userInfo.status === UserStatus.BANNED)
            throw ErrorCode.USER_BANNED;
        if (userInfo.two_factor_enable == 1) {
            throw ErrorCode.GG_AUTH_ENABLED;
        }
        if (
            !auth_code ||
            !GGAuth.checkAuthCode(auth_code, gg_auth_key)
        ) {
            throw ErrorCode.AUTH_CODE_INVALID;
        }
        await UserModel.enableFactorAuth(user_id, gg_auth_key);
        return
    }

    public static async disableGGAuth(user_id: number, auth_code: string) {
        const userInfo = await UserModel.get(user_id);
        if (!userInfo) throw ErrorCode.USER_NOT_FOUND
        if (userInfo.status === UserStatus.BANNED)
            throw ErrorCode.USER_BANNED;
        if (userInfo.two_factor_enable == 0) {
            throw ErrorCode.GG_AUTH_DISABLED;
        }
        if (
            !auth_code ||
            !GGAuth.checkAuthCode(auth_code, userInfo.gg_auth_key)
        ) {
            throw ErrorCode.AUTH_CODE_INVALID;
        }
        await UserModel.disableFactorAuth(user_id);
        return
    }
}
