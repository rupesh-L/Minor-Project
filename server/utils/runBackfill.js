// run-backfill-with-progress.js
import mongoose from "mongoose";
import { backfillEmbeddings, generateAndSaveEmbedding } from "./embeddings.js";
import Book from "../models/product.model.js";
import dotenv from "dotenv";
dotenv.config();

async function runWithProgress() {
  console.log(process.env.ATLAS_URI);
  try {
    await mongoose.connect(
      "mongodb+srv://rupeslekhy_db_user:MZlusrAiXxtmmcmH@books.t5pdmyl.mongodb.net/book_store",
    );
    console.log("✅ Connected to MongoDB");

    // Count books without embeddings
    const total = await Book.countDocuments({ embedding: { $exists: false } });
    console.log(`📚 Found ${total} books without embeddings`);

    if (total === 0) {
      console.log("✨ All books already have embeddings!");
      return;
    }

    console.log("🔄 Starting backfill...");

    // Process one by one with progress
    const books = await Book.find({ embedding: { $exists: false } });
    let processed = 0;
    let failed = 0;

    for (const book of books) {
      try {
        await generateAndSaveEmbedding(book._id);
        processed++;
        console.log(
          `Progress: ${processed}/${total} (${Math.round((processed / total) * 100)}%)`,
        );
      } catch (error) {
        failed++;
        console.error(`Failed for book ${book._id}: ${error.message}`);
      }
    }

    console.log(`
    ✅ Backfill completed!
    ✅ Successfully embedded: ${processed}
    ❌ Failed: ${failed}
    `);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Backfill failed:", error);
  }
}

runWithProgress();
