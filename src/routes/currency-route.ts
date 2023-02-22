import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {CurrencyController, UserController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    const {id} = await Joi.object()
        .keys({
            id: Joi.number().required()
        })
        .and('email', 'password')
        .validateAsync({...req.query, ...req.params, ...req.body})
    return routeResSuccess(res, await CurrencyController.get(id));
};




export const CurrencyRoute = (app: Application) => {
    const router = Router();
    app.use("/currency", router);

    router.get("/get", checkAuth, hpr(get));
};
