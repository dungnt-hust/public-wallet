import {logger} from "../utils";

import {ethers} from 'ethers';
import {config} from "../config";
import router_abi from "../../assets/Router.json"
import {ETH} from "./eth";
import {hexToNumberString} from "web3-utils";
import Web3 from 'web3';

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
const sleep = (ms:number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// We need to wait until any miner has included the transaction
// in a block to get the address of the contract

export const Router = {
    getAmountsOut: async (blockchain: any, contract_address: string, quantity: string, address1: string, address2: string) => {
        return await get_contract(blockchain, contract_address).getAmountsOut(quantity, [address1, address2]);
    },
    swapExactTokensForTokens: async (blockchain: any, contract_address: string, amountIn: string, amountOut:string, address1: string, address2: string) => {
        let walletAddress = config.blockchain.hot_wallet_address;
        let signer = await get_contract_signer(blockchain, contract_address)
        let tx = await signer.swapExactTokensForTokens(amountIn, amountOut, [address1, address2], walletAddress, Math.round(Date.now() / 1000) + 3600,
            {gasLimit: '200000'});
        logger.info(tx.hash)
        // const tx_hash = await  ETH.get_provider(blockchain).getTransaction(blockchain, tx.hash);
        // console.log(tx_hash)
        // const inter = new ethers.utils.Interface(router_abi);
        // const decodedInput = inter.parseTransaction({
        //     data: tx_hash.data,
        //     value: tx_hash.value
        // });
        // console.log("abc " + decodedInput.args.amountOutMin);
        //const amoountOut = hexToNumberString(decodedInput.args.amountOutMin)
        return await tx.wait();
    }
}
