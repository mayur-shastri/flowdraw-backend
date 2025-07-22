import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import expressAsyncHandler from "express-async-handler";
import DiagramService from "../services/diagram.service";

class DiagramController {

    static create = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        const diagram = await DiagramService.create(user.id);
        if(!diagram){
            res.status(400).json({ error: "Failed to create diagram" });
            return;
        }
        res.status(201).json(diagram);
    });

    static getDiagram = expressAsyncHandler(async (req : AuthenticatedRequest, res: Response)=>{
        const user = req.user;
        const { id } = req.params;
        const diagram = await DiagramService.getDiagram(user.id, id);
        if(!diagram){
            res.status(404).json({ error: "Diagram not found" });
            return;
        }
        res.status(200).json(diagram);
    });

    static getUserDiagrams = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        const diagrams = await DiagramService.getUserDiagrams(user.id);
        if (!diagrams) {
            res.status(404).json({ error: "No diagrams found" });
            return;
        }
        res.status(200).json(diagrams);
    });

    static getUserCollaborations = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        const collaborations = await DiagramService.getUserCollaborations(user.id);
        if (!collaborations) {
            res.status(404).json({ error: "No collaborations found" });
            return;
        }
        res.status(200).json(collaborations);
    });

    static updateDiagram = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response)=>{
        const user = req.user;
        const {id} = req.params;
        const {updatedElements, updatedConnections} = req.body;
        const updatedDiagram = await DiagramService.updateDiagram(user.id, id, updatedElements, updatedConnections);
        if(!updatedDiagram){
            res.status(400).json({ error: "Failed to save diagram" });
            return;
        }
        res.status(200).json({updatedDiagram, message: "Diagram saved successfully"});
    });

};

export default DiagramController;