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

export class NftController {

    public static async listNft(data: any) {
        const wallet = await WalletModel.get(data.wallet_id);
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        let nftsResult : any  = [];
        try{
            let listNft :any  ;
            var configCall = {
                method: 'get',
                maxBodyLength: Infinity,
                url: `${config.url_get_nfts}&address=${wallet.address}`,
                headers: { }
            };

            await axios(configCall)
                .then(function (response:any) {
                    listNft = [...response.data.result];
                })
                .catch(function (error:any) {
                    console.log(error);
                });
            for(let collection of listNft){
                {
                    if(collection.type === "ERC-721"){
                        for(let j = 0 ; j < collection.balance ; j++)
                        {
                            const result = await Erc721Enumerable.tokenOfOwnerByIndex(blockchain, collection.contractAddress,wallet.address, j);
                            const tokenId = +hexToNumberString(result)
                            const tokenURI = await Erc721Metadata.tokenURI(blockchain,collection.contractAddress, tokenId);
                            let config = {
                                method: 'get',
                                maxBodyLength: Infinity,
                                url: tokenURI,
                                headers: {}
                            };

                            await axios(config)
                                .then(function (response) {
                                    nftsResult.push({collectionAddress : collection.contractAddress,collectionName : collection.name, token_id: tokenId, metadata : response.data})
                                })
                                .catch(function (error) {
                                    console.log(error);
                                });
                        }
                    }
                }
            }
        }catch (e : any){

        }
        return nftsResult;
    }

    public static async nftDetail(data:any){
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        let metadata:any;
        try{
            const tokenURI = await Erc721Metadata.tokenURI(blockchain,data.collection_address, data.token_id);
            let config = {
                method: 'get',
                maxBodyLength: Infinity,
                url: tokenURI,
                headers: { }
            };

            await axios(config)
                .then(function (response) {
                    metadata = response.data;
                    console.log(metadata)
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        catch (e:any){

        }
        return metadata;
    }

    public static async transferNft(data:any){
        const wallet = await WalletModel.get(data.wallet_id);
        if(wallet.user_id != data.user_id)
            throw ErrorCode.WALLET_NOT_BELONG_TO_YOU;
        const privateKey = await this.decrypt({iv: wallet.iv, encryptedData: wallet.encrypt_private_key});
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        try{
            await Erc721.transfer(blockchain, data.collection_address,privateKey, wallet.address,data.to_address, data.token_id )
        }
        catch (e :any){
            console.log(e)
        }
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
