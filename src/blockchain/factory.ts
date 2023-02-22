import {logger} from "../utils";

import {ethers} from 'ethers';
import {config} from "../config";
import router_abi from "../../assets/Router.json"
import {ETH} from "./eth";


const get_contract = (blockchain: any, contract_address: string) => {
    return new ethers.Contract(
        contract_address,
        router_abi,
        ETH.get_provider(blockchain),
    )
}
const get_contract_signer = (blockchain: any, contract_address: string) => {
    // A Signer from a private key
    let privateKey = config.blockchain.hot_wallet_private_key;
    let wallet = new ethers.Wallet(privateKey, ETH.get_provider(blockchain));
    return get_contract(blockchain, contract_address).connect(wallet);
}

export const Factory = {
    getAmountsOut: async (blockchain: any, contract_address: string, quantity: string, address1: string, address2: string) => {
        return await get_contract(blockchain, contract_address).getAmountsOut(quantity, [address1, address2]);
    },
    swapExactTokensForTokens: async (blockchain: any, contract_address: string, amountIn: string, amountOutMin:string, address1: string, address2: string) => {
        let privateKey = config.blockchain.hot_wallet_private_key;
        let tx = await get_contract_signer(blockchain, contract_address).swapExactTokensForTokens(amountIn, amountOutMin, [address1, address2], privateKey, Math.round(Date.now() / 1000) + 3600,
            {gasLimit: '200000'});
        logger.info(tx.hash);
        return tx.wait();
    }
}
