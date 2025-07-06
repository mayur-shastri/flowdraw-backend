import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import expressAsyncHandler from "express-async-handler";
import DiagramService from "../services/diagram.services";

class DiagramController {

    static create = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        const diagram = await DiagramService.create(user.id);
        if(!diagram){
            res.status(400).json({ error: "Failed to create diagram" });
        }
        res.status(201).json(diagram);
    });

    static updateMetadata = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        res.status(501).json({ error: "Update functionality not implemented yet" });
    });
    
    static updateElements = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        res.status(501).json({ error: "Update functionality not implemented yet" });
    });

};

export default DiagramController;