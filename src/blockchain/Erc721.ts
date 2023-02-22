import {logger} from "../utils";

import {ethers} from 'ethers';
import {config} from "../config";
import Erc721ABI from "../../assets/Erc721ABI.json"
import {ETH} from "./eth";


const get_contract = (blockchain: any, contract_address: string) => {
    return new ethers.Contract(
        contract_address,
        Erc721ABI,
        ETH.get_provider(blockchain),
    )
}

const get_contract_signer = (blockchain: any, contract_address: string, privateKey:string) => {
    // A Signer from a private key
    // let privateKey = config.blockchain.hot_wallet_private_key;
    let wallet = new ethers.Wallet(privateKey, ETH.get_provider(blockchain));
    return get_contract(blockchain, contract_address).connect(wallet);
}

export const Erc721 = {
    transfer: async (blockchain: any, contract_address: string,privateKey:string, from_address:string, to_address:string, token_id : number) => {
        return get_contract_signer(blockchain, contract_address,privateKey).transferFrom(from_address,to_address, token_id);
    },
}
