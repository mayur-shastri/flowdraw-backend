import { Request, Response } from "express";
import crypto from 'crypto';

class TurnController {
    static getTurnCredentials(req: Request, res: Response) {
        const expiry = Math.floor(Date.now() / 1000) + 24 * 3600;

        const username = expiry.toString();

        const hmac = crypto.createHmac('sha1', process.env.TURN_SECRET!);
        hmac.update(username);
        const password = hmac.digest('base64');

        res.json({
            username,
            credential: password, // The password is the credential
            urls: [
                `stun:${process.env.TURN_URL}:3478`,
                `turn:${process.env.TURN_URL}:3478`,
            ]
        });
    }
};

export default TurnController;