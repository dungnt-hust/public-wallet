import {ErrorCode, logger, OtpType, OtpWay, SendEmail, Utils,} from "../utils";
import {Redis} from "../databases"

export class OTPController {
    public static async sendOtp(otpType: OtpType, id: string, otpWay: OtpWay = OtpWay.EMAIL, data?: any, expTime?: number) {
        if(!expTime) expTime = 300;
        let _otpType: string = OtpType[otpType].toLowerCase();
        let _otpWay: string = OtpWay[otpWay].toLowerCase();
        const key = ['code', _otpType, _otpWay, id.trim().toLowerCase()].join('-');
        let obj_code: any = await Redis.defaultCli.get(key);
        if (obj_code) {
            obj_code = JSON.parse(obj_code);
            if (obj_code.time_create + 60000 > Date.now())
                throw ErrorCode.TOO_MANY_REQUEST;
        }

        let otp_code = Utils.generateCode();
        let obj = {
            code: otp_code,
            time_create: Date.now()
        }


        await Redis.defaultCli.set(key, JSON.stringify(obj), 'ex', expTime);
        logger.debug(key, otp_code);


        switch (otpType) {
            case OtpType.VERIFY_EMAIL: {
                if (otpWay == OtpWay.EMAIL) {
                    await SendEmail.verify_email({
                        email: id,
                        code: otp_code
                    })
                }
                break;
            }
            case OtpType.VERIFY_TRANSFER: {
                if(otpWay == OtpWay.EMAIL) {
                    await SendEmail.verify_Transfer({
                        email: id,
                        code: otp_code,
                        symbol: data.symbol,
                        network: data.network,
                        amount: data.amount,
                        from_address: data.from_address,
                        to_address: data.to_address,
                    })
                }
                break;
            }
        }
    };


    public static async verify_otp(otpType: OtpType, id: string, code: string, otpWay: OtpWay = OtpWay.EMAIL) {
        let _otpType: string = OtpType[otpType].toLowerCase();
        let _otpWay: string = OtpWay[otpWay].toLowerCase();
        const key = ['code', _otpType, _otpWay, id.trim().toLowerCase()].join('-');

        let objCode: any = await Redis.defaultCli.get(key);
        if (!objCode)
            throw ErrorCode.OTP_INVALID_OR_EXPIRED;
        objCode = JSON.parse(objCode);

        if (objCode.time_create + 300000 < Date.now() || objCode.code != code)
            throw ErrorCode.OTP_INVALID_OR_EXPIRED;

        await Redis.defaultCli.del(key);
    };
    //
    // public static async confirm_otp_code(otp_type: OTP_TYPE, id: string, otp_code: string, message_type: MESSAGE_TYPE) {
    //     let correct_id = id;
    //     const confirm_type: string = MESSAGE_TYPE[message_type].toLowerCase();
    //     let type: string = OTP_TYPE[otp_type].toLowerCase();
    //     let obj_code: any = await Redis.defaultCli.get([type, 'code', correct_id].join('-'));
    //     if (!obj_code)
    //         throw ErrorCode.OTP_INVALID_OR_EXPIRED;
    //
    //     obj_code = JSON.parse(obj_code);
    //     if (obj_code.code != otp_code)
    //         throw ErrorCode.OTP_INVALID;
    //
    //     let confirm_id: string = Utils.generateSalt(6);
    //     await Redis.defaultCli.set([type, 'confirm_code', confirm_id].join('-'), correct_id, 'ex', 6000);
    //     await Redis.defaultCli.del([type, 'code', correct_id].join('-'));
    //
    //     return confirm_id;
    // };
}
