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
    
    static getUserViewOnlyDiagrams = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
        const user = req.user;
        const viewOnlydiagrams = await DiagramService.getUserViewOnlyDiagrams(user.id);
        if (!viewOnlydiagrams) {
            res.status(404).json({ error: "No view-only diagrams found" });
            return;
        }
        res.status(200).json(viewOnlydiagrams);
    });

};

export default DiagramController;