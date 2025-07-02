import express, { Request, Response } from "express";
import lighthouse from "@lighthouse-web3/sdk";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const lighthouseApiKey = process.env.LIGHTHOUSE_API_KEY || "";

app.post("/api/send", async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  const { content: blogContent, wallet_address } = req.body;

  if (!blogContent) {
    res.status(400).json({ message: "Content is required." });
    return;
  }

  try {
    console.log("Uploading content to Lighthouse...");
    const lighthouseResponse = await lighthouse.uploadText(
      blogContent,
      lighthouseApiKey,
      wallet_address
    );
    console.log("Lighthouse response:", lighthouseResponse);

    console.log("Generating summary with AI...");
    const hash = lighthouseResponse.data.Hash;
    const fetchResponse = await fetch(
      `https://gateway.lighthouse.storage/ipfs/${hash}`
    );
    const text = await fetchResponse.text();
    console.log("Blog Content:", text);

    res.status(200).json({
      message: "Content monetized successfully!",
      lighthouseHash: lighthouseResponse.data.Hash,
    });
  } catch (error) {
    console.error("Error in /api/send:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
