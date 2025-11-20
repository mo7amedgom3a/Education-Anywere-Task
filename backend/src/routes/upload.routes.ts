import { Router } from "express";
import  upload  from "../middlewares/upload";
import { uploadToS3 } from "../utils/s3-upload";

const router = Router();

router.post(
  "/image",
  upload.single("image"), // "image" = field name in frontend
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileUrl = await uploadToS3(req.file);

      return res.json({
        success: true,
        imageUrl: fileUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
