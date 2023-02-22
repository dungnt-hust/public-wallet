import {doQuery, sql} from '../databases';
import {ActiveStatus} from '../utils';
const TABLE = 'abi_contract'
export const AbiContractModel = {
    list: async (userId: number) => {
        let query: string = `select *
                             from ${TABLE} where user_id = ? and status = ${ActiveStatus.ACTIVATED}`;
        let [result, ignored]: any[] = await sql.query(query, [userId]);
        return result;
    },
    get: async (abiId: number) => {
        let query: string = `select * from ${TABLE} where id = ? and status = ${ActiveStatus.ACTIVATED}`;
        let [result, ignored]: any[] = await sql.query(query, [abiId]);
        return result.length ? result[0] : null;
    },
    create: async (data:any) => {
        return await doQuery.insertRow(TABLE, data);
    }
};
