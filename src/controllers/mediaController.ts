import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";
import config from "../../knexfile";
import knex from "knex";

const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});
const bucketName = process.env.BUCKET_NAME;
const bucket = storage.bucket(bucketName);
const db = knex(config.development);

// Create media
export const createMediaHandler = async (req: Request, res: Response) => {
  try {
    const { title, description, file_url, type } = req.body;

    if (!["image", "video"].includes(type)) {
      res.status(400).json({
        error: "Invalid media type. Allowed values are 'image' or 'video'.",
      });
    }

    const [mediaId] = await db("media").insert({
      title,
      description,
      file_url,
      type,
    });
    res.status(201).json({ id: mediaId, title, description, file_url, type });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: "Failed to create media" });
  }
};

// Get all media
export const getAllMediaHandler = async (_req: Request, res: Response) => {
  try {
    const mediaList = await db("media")
      .select("*")
      .orderBy("created_at", "desc");
    res.status(200).json(mediaList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media list" });
  }
};

// Get media by ID
export const getMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await db("media").where({ id }).first();
    if (media) {
      res.status(200).json(media);
    } else {
      res.status(404).json({ error: "Media not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch media" });
  }
};

// Update media by ID
export const updateMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, url } = req.body;
    const updatedCount = await db("media")
      .where({ id })
      .update({ title, description, url });
    if (updatedCount) {
      res.status(200).json({ message: "Media updated successfully" });
    } else {
      res.status(404).json({ error: "Media not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update media" });
  }
};

// Delete media by ID
export const deleteMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Retrieve media entry to get the file URL
    const media = await db("media").where({ id }).first();
    if (!media) {
      res.status(404).json({ error: "Media not found" });
    }

    const fileUrlPrefix = `https://storage.googleapis.com/${bucketName}/`;
    const fileKey = media.file_url.startsWith(fileUrlPrefix)
      ? media.file_url.substring(fileUrlPrefix.length)
      : null;

    if (!bucketName || !fileKey) {
      console.error("Bucket name or file key is missing", {
        bucketName,
        fileKey,
      });
      res.status(500).json({ error: "Bucket name or file key is missing" });
    }

    await bucket.file(fileKey).delete();

    // Delete the media record from the database
    const deletedCount = await db("media").where({ id }).del();
    if (deletedCount) {
      res.status(200).json({ message: "Media deleted successfully" });
    } else {
      res.status(404).json({ error: "Media not found" });
    }
  } catch (error) {
    console.error("Error deleting media", error);
    res.status(500).json({ error: "Failed to delete media" });
  }
};

// Like media
export const likeMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await db("media").where({ id }).first();
    if (!media) {
      res.status(404).json({ error: "Media not found" });
    }
    await db("media").where({ id }).increment("likes", 1);
    res.status(200).json({ message: "Media liked successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to like media" });
  }
};

// Unlike media
export const unlikeMediaHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = await db("media").where({ id }).first();
    if (!media) {
      res.status(404).json({ error: "Media not found" });
    }
    if (media.likes > 0) {
      await db("media").where({ id }).decrement("likes", 1);
      res.status(200).json({ message: "Media unliked successfully" });
    } else {
      res.status(400).json({ error: "Cannot unlike media with zero likes" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to unlike media" });
  }
};

export const getMediaURL = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileName, fileType } = req.query;

    if (!fileName || !fileType || typeof fileName !== "string" || typeof fileType !== "string") {
      res.status(400).json({ error: "Missing or invalid file name or file type" });
      return;
    }

    const file = bucket.file(`uploads/${fileName}`);

    // Generate signed URL for upload
    const [url] = await file.getSignedUrl({
      version: "v4",   
      action: "write",
      expires: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    res.send({
      uploadURL: url,
      fileURL: `https://storage.googleapis.com/${bucketName}/uploads/${fileName}`,
    });
  } catch (err) {
    console.error("Error generating signed URL", err);
    res.status(500).json({ error: "Could not generate signed URL" });
  }
};