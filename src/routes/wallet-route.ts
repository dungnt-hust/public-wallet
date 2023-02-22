import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {TransferController, UserController, WalletController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    return routeResSuccess(res, await WalletController.get());
};

const getBalance = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id: Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})

    data.user_id = res.locals.userId
    return routeResSuccess(res, await WalletController.getBalance(data));
};


const create = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id: Joi.number().required(),
            name: Joi.string().optional()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await WalletController.create(data));
};


const getPrivateKey = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id: Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await WalletController.getPrivateKey(data));
};

const listCurrency = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id: Joi.number().required(),
            ...Utils.baseFilter
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await WalletController.listCurrency(data));
};

const listWallet = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id: Joi.number().required(),
            ...Utils.baseFilter
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    data.user_id = res.locals.userId
    return routeResSuccess(res, await WalletController.listWallet(data));
};




export const WalletRoute = (app: Application) => {
    const router = Router();
    app.use("/wallet", router);

    router.get("/get", checkAuth, hpr(get));
    router.get("/get-balance",checkAuth, hpr(getBalance));
    router.post("/create", checkAuth, hpr(create));
    router.get("/get-private-key",checkAuth, hpr(getPrivateKey));
    router.get("/list-currency",checkAuth, hpr(listCurrency));
    router.get("/list-wallet",checkAuth, hpr(listWallet));
};
