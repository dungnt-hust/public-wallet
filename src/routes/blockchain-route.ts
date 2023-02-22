import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {BlockchainController, UserController, WalletController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id:Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})
    return routeResSuccess(res, await BlockchainController.get(data));
};

const list = async (req: Request, res: Response) => {
    // const data = await Joi.object()
    //     .keys({
    //         ...Utils.baseFilter
    //     })
    //     .validateAsync({...req.query, ...req.params, ...req.body})

    return routeResSuccess(res, await BlockchainController.list());
};

const add = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            name:Joi.string(),
            symbol:Joi.string(),
            rpc_url:Joi.string(),
            chain_id: Joi.number(),
            block_number: Joi.number(),
            status: Joi.number()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})

    return routeResSuccess(res, await BlockchainController.add(data));
};



export const BlockchainRoute = (app: Application) => {
    const router = Router();
    app.use("/blockchain", router);

    router.get("/get", hpr(get));
    router.get("/list", hpr(list));
    router.post("/add", hpr(add));

};
