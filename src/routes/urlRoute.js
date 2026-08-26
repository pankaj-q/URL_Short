import express from 'express';
import {
  createShortUrl,
  getShortenUrl,
} from "../controllers/urlController.js";

const router = express.Router();

router.post("/shorten", createShortUrl);
router.get("/:shortCode", getShortenUrl);



export default router;


