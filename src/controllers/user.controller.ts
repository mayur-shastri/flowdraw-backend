import { Response } from "express";
import UserService from "../services/user.services";
import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../types";

class UserController {
    static create = expressAsyncHandler(
        async (req: AuthenticatedRequest, res: Response) => {
            
            const user = req.user;

            if (!user) {
                res.status(400).json({ error: "User is required" });
                return;
            }

            try {
                const {createdUser, newCreated} = await UserService.createUser(user.id);
                if(!createdUser) {
                    res.status(400).json({ error: "Failed to create user" });
                    return;
                }
                if(!newCreated) {
                    res.status(201).json({createdUser, message : "Signed in successfully"});
                }
                else{
                    res.status(201).json({createdUser, message : "User created successfully"});
                }
            } catch (error) {
                res.status(500).json({ error: "Internal server error" });
            }
        }
    );
};

export default UserController;