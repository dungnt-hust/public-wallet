import {Application, Request, Response, Router} from "express"
import {hpr, OtpType, OtpWay, routeResSuccess, Utils,} from "../utils"
import Joi from "joi"
import {checkAuth} from "../middlewares";
import {TransferController, WalletController} from "../controllers";

const getOtpCode = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            // from_address: Joi.string().required(),
            // quantity: Joi.number().required(),
            // currency_id: Joi.number().integer().required(),
            // blockchain_id: Joi.number().integer().required(),
            // to_address: Joi.string().required(),
        })
        .validateAsync(req.body, { stripUnknown: true })

    await TransferController.requestOtp({...data});
    return routeResSuccess(res, { message: "OTP has been sent successfully" })
}

const transfer = async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id: Joi.number().required(),
            blockchain_id: Joi.number().required(),
            to_address: Joi.string().required(),
            currency_id: Joi.number().required(),
            amount: Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})

    data.user_id = res.locals.userId
    return routeResSuccess(res, await TransferController.transfer(data));
}

const transferNative =  async (req: Request, res: Response) => {
    const data = await Joi.object()
        .keys({
            wallet_id: Joi.number().required(),
            blockchain_id: Joi.number().required(),
            to_address: Joi.string().required(),
            amount: Joi.number().required()
        })
        .validateAsync({...req.query, ...req.params, ...req.body})

    data.user_id = res.locals.userId
    return routeResSuccess(res, await TransferController.transferNative(data));
}


export const TransferRoute = (app: Application) => {
    const router = Router()
    app.use("/transfer", checkAuth, router)
    // Children
    router.post("/request-otp", checkAuth, hpr(getOtpCode));
    router.post("/request-transfer", checkAuth, hpr(transfer));
    router.post("/request-transfer-native", checkAuth, hpr(transferNative));

}

