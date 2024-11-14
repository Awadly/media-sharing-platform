import { Request, Response } from "express";
import config from "../../knexfile";
import knex from "knex";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const db = knex(config.development);
const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
  },
});
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
    const mediaList = await db("media").select("*");
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

    // Extract the S3 key from the file_url (e.g., uploads/filename.ext)
    const fileKey = media.file_url.split(`${process.env.BUCKET_NAME}/`)[1];

    // Delete the file from S3
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
    });

    await s3.send(deleteCommand);

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

export const getMediaURL = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { fileName, fileType } = req.query;

    if (
      !fileName ||
      !fileType ||
      typeof fileName !== "string" ||
      typeof fileType !== "string"
    ) {
      res
        .status(400)
        .json({ error: "Missing or invalid file name or file type" });
      return;
    }

    const bucketName = "mediabucketapp";

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: `uploads/${fileName}`,
      ContentType: fileType,
    });

    // Generate the pre-signed URL
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 }); // URL expires in 10 minutes

    res.send({
      uploadURL: url,
      fileURL: `https://${bucketName}.s3.amazonaws.com/uploads/${fileName}`,
    });
  } catch (err) {
    console.error("Error generating pre-signed URL", err);
    res.status(500).json({ error: "Could not generate pre-signed URL" });
  }
};
