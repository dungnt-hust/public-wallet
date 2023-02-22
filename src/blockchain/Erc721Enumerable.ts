import {logger} from "../utils";

import {ethers} from 'ethers';
import {config} from "../config";
import IErc721 from "../../assets/IERC721Enumerable.json"
import {ETH} from "./eth";


const get_contract = (blockchain: any, contract_address: string) => {
    return new ethers.Contract(
        contract_address,
        IErc721,
        ETH.get_provider(blockchain),
    )
}

const get_contract_signer = (blockchain: any, contract_address: string) => {
    // A Signer from a private key
    let privateKey = config.blockchain.hot_wallet_private_key;
    let wallet = new ethers.Wallet(privateKey, ETH.get_provider(blockchain));
    return get_contract(blockchain, contract_address).connect(wallet);
}

export const Erc721Enumerable = {

    tokenOfOwnerByIndex: async (blockchain: any, contract_address: string, owner_address:string,index:number) => {
        return get_contract(blockchain, contract_address).tokenOfOwnerByIndex(owner_address, index);
    },
}
