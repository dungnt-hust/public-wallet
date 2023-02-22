import {ErrorCode} from "../utils";
import {TransactionModel} from "../models/transaction";

export class TransactionController {
    public static async get(transactionId: number) {
        const transaction = await TransactionModel.get(transactionId);

        if (!transaction) throw ErrorCode.TRANSACTION_ID_NOT_EXIST;

        return transaction;
    }

    public static async listOfAddress(address: string, options: any) {
        return TransactionModel.listOfAddress(address, options);
    }

}
