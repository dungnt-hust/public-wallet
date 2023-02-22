import {sql, doQuery} from '../databases';
import {ConfigType, ErrorCode, Gender, logger, UserStatus, Utils} from '../utils';

export const UserModel = {
    get: async (userId:number) => {
        let query: string = `select * from users where id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result.length ? result[0] : null;
    },
    getByType: async (type: string, value: string) => {
        let query: string = `select * from users where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    create: async (data: any) => {
        const item: any = {
            status: UserStatus.ACTIVATED
        };
        if (data.email) item.email = data.email.trim().toLowerCase();
        if (data.mobile) item.mobile = data.mobile;
        if (data.name) item.name = data.name;
        if (data.gender) item.gender = data.gender;

        let conn = await sql.getConnection();
        try {
            await conn.query("START TRANSACTION");
            logger.trace("start transaction");

            // create user
            let user_id = await doQuery.insertRow('users', item, conn);
            // create password
            await doQuery.insertRow('user_auths', {
                user_id,
                password_hash: await Utils.hashPassword(data.password)
            }, conn);
            if (!data.gender)
                data.gender = Gender.MALE;
            data.user_id = user_id;
            // init item default
            await conn.query("COMMIT");
            logger.trace("transaction COMMIT");
            conn.release();
            logger.trace("transaction release");
            return user_id;
        } catch (e) {
            logger.error(e);
            await conn.query("ROLLBACK");
            conn.release();
            throw ErrorCode.UNKNOWN_ERROR;
        }
    },
    updatePassword: async (user_id: number, password: string) => {
        const password_hash = await Utils.hashPassword(password);

        let query = ` Update user_auths set password_hash = '${password}' where  user_id = ${user_id} `
        let [result, ignored]: any[] = await sql.query(query);
        if (result.affectedRows === 0)
            throw ErrorCode.UNKNOWN_ERROR;
    },

    update: async (data: any) => {
        const item: any = {}
        if (data.email) item.email = data.email;
        if (data.mobile) item.mobile = data.mobile;
        if (data.name) item.mobile = data.name;
        if (data.gender) item.gender = data.gender;
        if (data.last_read_notification) item.last_read_notification = data.last_read_notification;
        if (data.level) item.level = data.level;
        if (data.status != undefined) item.status = data.status;
        return doQuery.updateRow('users', item, data.user_id)
    },
    getUserAuth: async (userId: number) => {
        let query: string = `select * from user_auths where user_id = ${userId}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result.length ? result[0] : null;
    },

    enableFactorAuth: async (user_id: number, gg_auth_key: string) => {
        const item: any = {}
        item.gg_auth_enable = 1;
        item.gg_auth_key = gg_auth_key;
        return doQuery.updateRow('users', item, user_id)
    },

    getByEmail: async (type: string, value: string) => {
        let query: string = `select u.*
                             from users u
                             where LOWER(u.${type})?`;
        let [result, ignored]: any[] = await sql.query(query, [
            value.trim().toLowerCase(),
        ]);
        return result.length ? result[0] : null;
    },

    disableFactorAuth: async (user_id: number) => {
        const item: any = {}
        item.gg_auth_enable = 0;
        item.gg_auth_key = "";
        return doQuery.updateRow('users', item, user_id)
    },

};
