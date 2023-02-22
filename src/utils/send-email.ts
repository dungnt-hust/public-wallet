import {config} from "../config";
import sgMail from "@sendgrid/mail";
import {Utils} from "./utils";
import {TokenType} from "./enum";
import {logger} from "./logger";

sgMail.setApiKey(config.send_grid.api_key as string);
export const SendEmail = {
    sendTemplateEmail: async ({
                                  to,
                                  templateId,
                                  dynamicTemplateData,
                              }: {
        to: string;
        templateId: string;
        dynamicTemplateData?: any;
    }) => {
        console.log({
            to,
            from: config.send_grid.email_from,
            fromname: config.app_name,
            templateId,
            dynamicTemplateData: {
                ...dynamicTemplateData,
            },
        });

        return sgMail
            .send({
                to,
                from: {
                    email: config.send_grid.email_from as string,
                    name: config.app_name,
                },
                templateId,
                dynamicTemplateData: {
                    ...dynamicTemplateData,
                },
            })
            .then(() => {
                logger.log("Email sent to: ", to);
                return true;
            })
            .catch((error: any) => {
                logger.error(error);
                return false;
            });
    },

    verify_email: async ({email, code}: { email: string; code: string }) => {
        return SendEmail.sendTemplateEmail({
            to: email,
            templateId: config.send_grid.template_id_verify_email as string,
            dynamicTemplateData: {
                code,
            },
        });
    },
    verify_Transfer: async ({
                                email,
                                code,
                                symbol,
                                network,
                                amount,
                                from_address,
                                to_address
                            }: { email: string; code: string; symbol: string; network: string; amount: string; from_address: string; to_address: string; }) => {
        return SendEmail.sendTemplateEmail({
            to: email,
            templateId: config.send_grid.template_id_verify_transfer as string,
            dynamicTemplateData: {
                code,
                symbol,
                network,
                amount,
                from_address,
                to_address
            },
        });
    },
};
