import {sql, doQuery} from '../databases';
import {ConfigType, ErrorCode, Gender, logger, UserStatus, Utils} from '../utils';

export const CurrencyModel = {

    getByType: async (type: string, value: string) => {
        let query: string = `select * from users where LOWER(${type}) = ?`;
        let [result, ignored]: any[] = await sql.query(query, [value.trim().toLowerCase()]);
        return result.length ? result[0] : null;
    },

    get: async (id: number) => {
        const query: string = `select *
                             from currencies
                             where id = ${id}`;
        return doQuery.getOne(query);
    },
};
