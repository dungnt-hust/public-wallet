import {ActiveStatus, ErrorCode, GGAuth, UserStatus, Utils} from "../utils";
import {doQuery} from "../databases";
import {CurrencyModel} from "../models/currency";

export class CurrencyController {
    public static async get(id:number) {
        const currency = await CurrencyModel.get(id)
        if(!currency)
            throw ErrorCode.CURRENCY_INVALID;
        return currency;
    }


}
