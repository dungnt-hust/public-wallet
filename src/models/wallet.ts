import {sql, doQuery} from '../databases';
import {ConfigType, ErrorCode, Gender, logger, UserStatus, Utils} from '../utils';

export const WalletModel = {
    get: async (id: number) => {
        const query: string = `select *
                             from wallet_addresses
                             where id = ${id}`;
        return doQuery.getOne(query);
    },

    getByType: async (type: string, value: string) => {
        let query: string = `select * from users where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },
    create: async (data:any) => {
        return doQuery.insertRow("wallet_addresses", data);
    },

    listWallet: async (data:any) => {
        let query = `select wa.id,wa.user_id, wa.blockchain_id, wa.name, wa.address, wa.status, wa.updated_time, wa.created_time
                     from wallet_addresses wa
                     where wa.user_id = ? and blockchain_id = ?`;
        return {
            data: await doQuery.listRows(query, [data.user_id,data.blockchain_id], data),
            total: await doQuery.countRows(query, [data.user_id,data.blockchain_id])
        }
    },


};
