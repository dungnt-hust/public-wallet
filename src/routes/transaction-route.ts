import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {TransactionController, UserController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    const {transactionId} = await Joi.object()
        .keys({
            transaction_id: Joi.string().required(),
        })
        .validateAsync(req.query)
    return routeResSuccess(res, await TransactionController.get(transactionId));
};

const listOfAddress = async (req: Request, res: Response) => {
    const {address, options} = await Joi.object()
        .keys({
            address: Joi.string().required(),
            ...Utils.baseFilter
        })
        .validateAsync(req.query)
    return routeResSuccess(res, await TransactionController.listOfAddress(address, options));
}


export const TransactionRoute = (app: Application) => {
    const router = Router();
    app.use("/transaction", router);

    router.get("/get", hpr(get));
    router.get("/list-of-address", hpr(listOfAddress));
};
