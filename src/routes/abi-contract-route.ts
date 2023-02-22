import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {AbiContractController, BlockchainController, UserController, WalletController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            id: Joi.number().required()
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

const create = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            blockchain_id: Joi.number().integer().required(),
            name: Joi.string().required(),
            address:Joi.string().required(),
            abi: Joi.string(),
            block_number: Joi.number(),
            status: Joi.number()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})

    data.userId = 1;
   // res.locals.userId;
    return routeResSuccess(res, await AbiContractController.create(data));
};



export const AbiContractRoute = (app: Application) => {
    const router = Router();
    app.use("/abi", router);

    router.post("/create", hpr(create));
    router.get("/get", hpr(get));
};
