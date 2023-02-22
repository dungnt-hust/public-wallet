import {doQuery, sql} from '../databases';
import {ActiveStatus, ErrorCode, logger, Utils} from '../utils';

export const BlockchainModel = {
    list: async () => {
        let query: string = `select *
                             from blockchains where status = ${ActiveStatus.ACTIVATED}`;
        let [result, ignored]: any[] = await sql.query(query);
        return result;
    },
    get: async (id: number) => {
        const query: string = `select *
                             from blockchains
                             where id = ${id}`;
        return doQuery.getOne(query);
    },
    add: async (data:any) => {
        return await doQuery.insertRow("blockchains", data);
    },
    update_block_number: async (blockchain_id: number, block_number: number, old_block_number: number, conn?: any) => {
        if (!conn)
            conn = sql;
        let query = `update blockchains SET block_number = ${block_number} WHERE id = ${blockchain_id} and block_number = ${old_block_number}`;
        let [result, ignored] = await conn.query(query);

        // @ts-ignore
        if (result.affectedRows !== 1)
            throw ErrorCode.UPDATE_ZERO_FIELD;
    }
};
