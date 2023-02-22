import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {NftController, TransferController, UserController, WalletController} from "../controllers";
import {checkAuth} from "../middlewares";


const listNft = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id: Joi.number().required(),
            blockchain_id:Joi.number().required(),
            ...Utils.baseFilter
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await NftController.listNft(data));
};

const nftDetail = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id:Joi.number().required(),
            collection_address: Joi.string().required(),
            token_id: Joi.number().required(),
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await NftController.nftDetail(data));
};

const transferNft = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id :Joi.number().required(),
            blockchain_id:Joi.number().required(),
            collection_address: Joi.string().required(),
            token_id: Joi.number().required(),
            to_address : Joi.string().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await NftController.transferNft(data));
};


export const NftRoute = (app: Application) => {
    const router = Router();
    app.use("/nft", router);

    router.get("/list-nft",checkAuth, hpr(listNft));
    router.get("/nft-detail",checkAuth, hpr(nftDetail));
    router.get("/transfer-nft",checkAuth, hpr(transferNft));
};
