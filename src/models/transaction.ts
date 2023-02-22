import {doQuery, sql} from '../databases';

const TABLE = 'transactions'


export const TransactionModel = {
    get: async (transactionId: number) => {
        let query: string = `select * from ${TABLE} where id = ?`;
        let [result, ignored]: any[] = await sql.query(query, [transactionId]);
        return result.length ? result[0] : null;
    },

    getByType: async (type:string, value:string) => {
        let query: string = `select * from ${TABLE} where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },

    create: async (data:any) => {
        let transactionId = await doQuery.insertRow(TABLE, data);
        return transactionId;
    },

    listOfAddress: async (address: string, options:any) => {
        let query: string = `select t.id,
                                    t.fee,
                                    t.type,
                                    t.total_value,
                                    t.extra_data,
                                    t.transaction_hash,
                                    t.created_time
                                    from ${TABLE} t
                                    where LOWER(t.account) = ?`;
        return {
            data: await doQuery.listRows(query, [address.trim().toLowerCase()], options),
            total: await doQuery.countRows(query,[address.trim().toLowerCase()])
        }
    }
};
