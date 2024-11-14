import express from "express";
import {
  createMediaHandler,
  getAllMediaHandler,
  getMediaHandler,
  updateMediaHandler,
  deleteMediaHandler,
  likeMediaHandler,
  unlikeMediaHandler,
  getMediaURL,
} from "../controllers/mediaController";

const router = express.Router();

router.post("/", createMediaHandler);
router.get("/", getAllMediaHandler);
router.get("/preSignedURL", getMediaURL);
router.get("/:id", getMediaHandler);
router.put("/:id", updateMediaHandler);
router.delete("/:id", deleteMediaHandler);
router.post("/:id/like", likeMediaHandler);
router.post("/:id/unlike", unlikeMediaHandler);

export default router;
