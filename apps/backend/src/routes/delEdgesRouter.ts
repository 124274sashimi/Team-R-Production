import express, { Router, Request, Response } from "express";
const delEdgesRouter: Router = express.Router();
import PrismaClient from "../bin/database-connection.ts";

/**
 * Asyncrhonous function for handling an HTTP delete request for deleting all edges.
 * API route is /api/admin/edge/del
 * @param req HTTP request information
 * @param res HTTP response information (200 OK, 204 NO CONTENT, 400 BAD REQUEST)
 */
delEdgesRouter.delete("/", async function (req: Request, res: Response) {
  try {
    //Attempt to delete all edges in the database.
    console.log(req.body);
    await PrismaClient.edges.deleteMany();

    //If successfully wiped Edges DB, send 200 OK
    res.sendStatus(200);
  } catch (error) {
    console.log("unable to clear edges database!");
    console.log(error);
    res.sendStatus(400);
  }
});

export default delEdgesRouter;
