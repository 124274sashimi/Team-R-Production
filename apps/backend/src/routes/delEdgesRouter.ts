import express, { Router, Request, Response } from "express";
const delEdgesRouter: Router = express.Router();
import PrismaClient from "../bin/database-connection.ts";

/**
 * Asyncrhonous function for handling an HTTP delete request for deleting all edges.
 * API route is /api/admin/edge/del
 * Specified with /delType/delID
 * (e.g. /api/admin/edge/del/Single/CREST003L1_CHALL015L1 or /api/admin/edge/del/All/none)
 * /delID is arbitrary when /delType is All
 * @param req HTTP request information
 * @param res HTTP response information (200 OK, 204 NO CONTENT, 400 BAD REQUEST)
 */
delEdgesRouter.delete(
  "/:delType/:delID",
  async function (req: Request, res: Response) {
    try {
      //Firstly, get parameters
      const delType: string = req.params.delType;
      const delID: string = req.params.delID;

      if (delType != "Single" && delType != "All") {
        console.log(
          "delType is not of a supported string! Must be Single or All",
        );
      }

      //Attempt to delete all edges in the database.
      if (delType == "All") {
        await PrismaClient.edges.deleteMany();
      } else {
        await PrismaClient.edges.delete({
          where: {
            EdgeID: delID,
          },
        });
      }

      //If successfully wiped Edges DB, send 200 OK
      res.sendStatus(200);
    } catch (error) {
      console.log("unable to clear edges database!");
      console.log(error);
      res.sendStatus(400);
    }
  },
);

export default delEdgesRouter;
