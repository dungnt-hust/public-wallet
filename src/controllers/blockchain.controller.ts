import {BlockchainModel} from "../models";
import {ErrorCode} from "../utils";


export class BlockchainController {
    public static async get(data:any) {
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        if(!blockchain)
            throw ErrorCode.BLOCKCHAIN_NOT_EXISTS;
        return blockchain;
    }
    public static async list() {
        return await BlockchainModel.list();
    }

    public static async add(data:any) {
        return await BlockchainModel.add(data);
    }


}
