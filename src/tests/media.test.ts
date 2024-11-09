import request from "supertest";
import express from "express";
import router from "../routes/mediaRoutes"; // Adjust path as needed
import knex from "knex";
import config from "../../knexfile";

// Mock knex correctly with more precise query builder types
jest.mock("knex", () => {
  const mockKnex = jest.fn().mockReturnValue({
    insert: jest.fn().mockResolvedValue([1]), // Simulate successful insert with ID 1
    select: jest.fn().mockResolvedValue([
      {
        id: 1,
        title: "Sample",
        description: "Test",
        file_url: "http://example.com",
        type: "image",
      },
    ]),
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    increment: jest.fn().mockReturnThis(),
    decrement: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
  });

  return mockKnex;
});

const app = express();
app.use(express.json());
app.use("/test/media", router); // Ensure this points to the correct route

describe("Media API Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /test/media", () => {
    it("should create media", async () => {
      const mockMedia = {
        title: "Sample",
        description: "Test",
        file_url: "http://example.com",
        type: "image",
      };

      const mockMediaWithId = {
        ...mockMedia,
        id: 1, // Simulate the ID being returned from the database
      };

      const mockKnexInstance = knex(config.development);
      (mockKnexInstance.insert as jest.Mock).mockResolvedValueOnce([
        mockMediaWithId.id,
      ]);

      // Ensure the media is returned with the ID included
      (mockKnexInstance.select as jest.Mock).mockResolvedValueOnce([
        mockMediaWithId,
      ]);

      const response = await request(app).post("/test/media").send(mockMedia);
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMediaWithId); // Now the media should include the ID
    });
  });

  describe("GET /test/media", () => {
    it("should return all media", async () => {
      const mockMediaList = [
        {
          id: 1,
          title: "Sample",
          description: "Test",
          file_url: "http://example.com",
          type: "image",
        },
      ];

      const mockKnexInstance = knex(config.development);
      (mockKnexInstance.select as jest.Mock).mockResolvedValueOnce(
        mockMediaList
      );

      const response = await request(app).get("/test/media");
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMediaList);
    });
  });
});
