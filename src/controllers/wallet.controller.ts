import {ActiveStatus, ErrorCode, GGAuth, MathUtils, TransactionType, UserStatus, Utils} from "../utils";
import {doQuery} from "../databases";
import {WalletModel} from "../models/wallet";
import Joi from "joi";
import {hexToNumberString} from "web3-utils";
import {ethers} from "ethers";
import {BalanceModel, BlockchainModel, CurrencyModel, TransactionModel, UserModel} from "../models";
import {CurrencyController} from "./currency.controller";
import {Router} from "../blockchain/router";
import {Erc20, ETH} from "../blockchain";
import pair_abi from "../../assets/Pair.json"
import Web3 from "web3";
import crypto from "crypto"
import {config} from "../config";
import axios from "axios";
import {Erc721Enumerable} from "../blockchain/Erc721Enumerable";
import {Erc721Metadata} from "../blockchain/Erc721Metadata.json";
import {Erc721} from "../blockchain/Erc721";

const Web3Utils = require('web3-utils');

const algorithm = 'aes-256-cbc'; //Using AES encryption
// const key = crypto.randomBytes(32);
const key = config.secret_key_encrypt;
const iv = crypto.randomBytes(16);

export class WalletController {
    public static async get() {

    }

    public static async getBalance(data: any) {
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        const web3 = new Web3(blockchain.rpc_url);
        const currency = await web3.eth.getBalance("0xc864Ef06fa26A3BCA5E26003069EacF45BF9db70")
        // const result = await web3.eth.getv
        return web3.eth.defaultChain;

    }

    public static async create(data: any) {
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        const web3 = new Web3(blockchain.rpc_url);
        const wallet = web3.eth.accounts.create();
        const privateKey = await this.encrypt(wallet.privateKey)
        const dataWallet = {
            user_id: data.user_id,
            blockchain_id: data.blockchain_id,
            name: data.name,
            address: wallet.address,
            encrypt_private_key: privateKey.encryptedData,
            iv: privateKey.iv
        }
        return await WalletModel.create(dataWallet);
    }

    public static async getPrivateKey(data: any) {
        const wallet = await WalletModel.get(data.wallet_id);
        if (!wallet)
            throw ErrorCode.WALLET_INVALID;
        if (data.user_id != wallet.user_id)
            throw ErrorCode.WALLET_NOT_BELONG_TO_YOU
        return await this.decrypt({iv: wallet.iv, encryptedData: wallet.encrypt_private_key});
    }


    public static async listCurrency(data: any) {
        const wallet = await WalletModel.get(data.wallet_id);
        if (wallet.user_id != data.user_id)
            throw ErrorCode.WALLET_NOT_BELONG_TO_YOU;
        const result = await BalanceModel.getListCurrency(data);
        return result;
    }

    public static async listWallet(data: any) {
        const result = await WalletModel.listWallet(data);
        return result;
    }

    public static async encrypt(text: any) {
        // @ts-ignore
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {iv: iv.toString('hex'), encryptedData: encrypted.toString('hex')};
    }

    public static async decrypt(text: any) {
        let iv = Buffer.from(text.iv, 'hex');
        let encryptedText = Buffer.from(text.encryptedData, 'hex');
        // @ts-ignore
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    }

}
