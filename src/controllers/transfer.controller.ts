import {BlockchainModel, CurrencyModel, TransactionModel, UserModel, WalletModel} from "../models";
import {ErrorCode, MathUtils, OtpType, OtpWay, TransactionType, Utils} from "../utils";
import {Erc20} from "../blockchain/erc20";
import {OTPController} from "./otp.controller";
import Web3 from "web3";
import crypto from "crypto";
import {WalletController} from "./wallet.controller";
import {hexToNumberString} from "web3-utils";
import {ethers} from "ethers";

export class TransferController {
    public static async requestOtp(data: any) {
        const user: any = await UserModel.get(data.user_id);
        if (!user)
            throw ErrorCode.USER_NOT_FOUND;

        const currency: any = await CurrencyModel.get(data.currency_id);
        if (!currency)
            throw ErrorCode.CURRENCY_NOT_EXISTS;

        if (Utils.validateCryptoAddress(data.from_address))
            throw ErrorCode.ADDRESS_INVALID;

        if (Utils.validateCryptoAddress(data.to_address))
            throw ErrorCode.ADDRESS_INVALID;
        const blockchain = await BlockchainModel.get(data.blockchain_id)

        const user_balance = await Erc20.balanceOf(blockchain, currency.address, data.from_address);

        if (MathUtils.isLessThan(user_balance, data.quantity))
            throw ErrorCode.BALANCE_NOT_ENOUGH

        await OTPController.sendOtp(OtpType.VERIFY_TRANSFER, user.email, OtpWay.EMAIL, {
            symbol: currency.symbol,
            network: blockchain.symbol,
            amount: data.quantity,
            from_address: data.from_address,
            to_address: data.to_address
        })

    }

    public static async transfer(data: any) {
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        const web3 = new Web3(blockchain.rpc_url);
        const wallet = await WalletModel.get(data.wallet_id)

        const currency: any = await CurrencyModel.get(data.currency_id);
        if (!currency)
            throw ErrorCode.CURRENCY_NOT_EXISTS;

        const user: any = await UserModel.get(data.user_id);
        if (!user)
            throw ErrorCode.USER_NOT_FOUND;

        if (wallet.user_id != data.user_id)
            throw ErrorCode.WALLET_NOT_BELONG_TO_YOU;

        const user_balance = ethers.utils.formatEther(await Erc20.balanceOf(blockchain, currency.address, wallet.address));

        if (MathUtils.isLessThan(user_balance, data.amount))
            throw ErrorCode.BALANCE_NOT_ENOUGH

        const amount = MathUtils.mul(data.amount, MathUtils.pow(10, 18));
        // check code
        // await OTPController.verify_otp(OtpType.VERIFY_TRANSFER, user.email, data.otp_code);

        const privateKey = await WalletController.getPrivateKey(data);
        const transaction_hash = await Erc20.transfer_private_key(blockchain, currency.address, privateKey, data.to_address, amount);
        const transaction = await web3.eth.getTransaction(transaction_hash)
        const dataTransaction = {
            user_id: data.user_id,
            blockchain_id: data.blockchain_id,
            transaction_hash: transaction_hash,
            sender: wallet.address,
            total_value: amount,
            to_address: data.to_address,
            gas_limit: transaction.gas,
            type: TransactionType.TOKEN_TRANSFER
        }
        await TransactionModel.create(dataTransaction);
    }

    public static async transferNative(data: any) {
        const blockchain = await BlockchainModel.get(data.blockchain_id);
        const web3 = new Web3(blockchain.rpc_url);
        const wallet = await WalletModel.get(data.wallet_id)
        const user_balance = await web3.eth.getBalance(wallet.address)


        const balance = ethers.utils.formatEther(user_balance);
        const user: any = await UserModel.get(data.user_id);
        if (!user)
            throw ErrorCode.USER_NOT_FOUND;

        if (wallet.user_id != data.user_id)
            throw ErrorCode.WALLET_NOT_BELONG_TO_YOU;


        if (MathUtils.isLessThan(balance, data.amount))
            throw ErrorCode.BALANCE_NOT_ENOUGH

        // check code
        // await OTPController.verify_otp(OtpType.VERIFY_TRANSFER, user.email, data.otp_code);

        const amount = MathUtils.mul(data.amount, MathUtils.pow(10, 18));

        const privateKey = await WalletController.getPrivateKey(data);
        web3.eth.accounts.wallet.add(privateKey);
        const transaction = await web3.eth.sendTransaction({
            from: wallet.address,
            to: data.to_address,
            value: amount,
            gas: 2000000
        })
        const dataTransaction = {
            user_id: data.user_id,
            blockchain_id: data.blockchain_id,
            transaction_hash: transaction.transactionHash,
            sender: wallet.address,
            total_value: data.amount,
            to_address: data.to_address,
            type: TransactionType.TOKEN_TRANSFER
        }
        await TransactionModel.create(dataTransaction);
    }
}