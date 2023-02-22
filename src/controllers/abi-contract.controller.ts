
import {ErrorCode} from "../utils";
import {AbiContractModel} from "../models";

export class AbiContractController {
    public static async get(id:number) {
        const abiData = await AbiContractModel.get(id)
        if(!abiData)
            throw ErrorCode.ABI_INVALID;
        return abiData;
    }

    public static async create(data: any) {
        return await AbiContractModel.create(data)
    }

}