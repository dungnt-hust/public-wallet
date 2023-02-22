import {Application, Request, Response, Router} from "express";
import {Gender, hpr, routeResSuccess, Utils} from "../utils";
import Joi from "joi";
import {UserController} from "../controllers";
import {checkAuth} from "../middlewares";

const get = async (req: Request, res: Response) => {
    return routeResSuccess(res, await UserController.get(res.locals.userId));
};

const changePassword = async (req: Request, res: Response) => {
    const {
        password,
        new_password,
    }: { password: string; new_password: string } = await Joi.object()
        .keys({
            password: Joi.string().custom(Utils.passwordMethod).optional(),
            new_password: Joi.string().custom(Utils.passwordMethod).required(),
        })
        .validateAsync(req.body);

    await UserController.changePassword(
        res.locals.userId,
        password,
        new_password
    );

    routeResSuccess(res, {});
};




const requestGGAuth = async (req: Request, res: Response) => {
    let data = await UserController.requestGGAuth(res.locals.userId);
    return routeResSuccess(res, data);
}

const enableGGAuth = async (req: Request, res: Response) => {
    const {auth_code, gg_auth_key} = await Joi.object()
        .keys({
            auth_code: Joi.string().required(),
            gg_auth_key: Joi.string().required(),
        })
        .and('auth_code', 'gg_auth_key')
        .validateAsync(req.body)

    let data = await UserController.enableGGAuth(res.locals.userId, auth_code, gg_auth_key);
    return routeResSuccess(res, data);
}

const disableGGAuth = async (req: Request, res: Response) => {
    const {auth_code} = await Joi.object()
        .keys({
            auth_code: Joi.string().required(),
        })
        .and('auth_code')
        .validateAsync(req.body)

    let data = await UserController.disableGGAuth(res.locals.userId, auth_code);
    return routeResSuccess(res, data);
}


export const UserRoute = (app: Application) => {
    const router = Router();
    app.use("/user", router);

    router.get("/get", checkAuth, hpr(get));
    router.post("/change-password", checkAuth, hpr(changePassword));
    router.post("/request-gg-auth", checkAuth, hpr(requestGGAuth));
    router.post("/enable-gg-auth", checkAuth, hpr(enableGGAuth));
    router.post("/disable-gg-auth", checkAuth, hpr(disableGGAuth));
};
