import ollama from "ollama";
import Book from "../models/product.model.js";

const EMBEDDING_MODEL = "nomic-embed-text";

function chunkBookText(book) {
  let text = `
    name: ${book.bookName || ""},
    author: ${book.author || ""},
    category: ${book.category || ""},
    price: ${book.price || 0},
    Stock: ${book.stock || 0},
  `.trim();

  const description = book.description || "";
  const chunkSize = 200;
  const descriptionChunks = [];

  for (let i = 0; i < description.length; i += chunkSize) {
    descriptionChunks.push(description.slice(i, i + chunkSize));
  }

  const chunks = [text, ...descriptionChunks];
  return chunks;
}

export async function generateAndSaveEmbedding(bookId) {
  try {
    const book = await Book.findById(bookId);

    if (!book) {
      throw new Error(`Book with ID ${bookId} not found`);
    }

    // FIX 1: Generate chunks from book text
    const chunks = chunkBookText(book); // ← THIS WAS MISSING!
    const mainChunk = chunks[0];

    console.log(`🔄 Generating embedding for: ${book.bookName || book.title}`);

    // FIX 2: Rename 'res' to avoid confusion with Express response object
    const embedResponse = await ollama.embed({
      model: EMBEDDING_MODEL,
      input: mainChunk,
    });

    // FIX 3: Save the embedding
    book.embedding = embedResponse.embeddings[0];
    await book.save();

    console.log(`✅ Successfully embedded: ${book.bookName || book.title}`);
    return true; // Return success
  } catch (error) {
    // FIX 4: Proper error handling without using 'res'
    console.error(`❌ Error embedding book ${bookId}:`, error.message);
    throw error; // Re-throw so the caller knows it failed
  }
}

export async function removeEmbedding(bookId) {
  await Book.updateOne({ _id: bookId }, { $unset: { embedding: 1 } });
  console.log(`✅ Removed embedding for book ${bookId}`);
}

export async function backfillEmbeddings() {
  try {
    const books = await Book.find({ embedding: { $exists: false } });
    console.log(`📚 Found ${books.length} books to process`);

    let processed = 0;
    let failed = 0;

    for (const book of books) {
      try {
        await generateAndSaveEmbedding(book._id);
        processed++;
        console.log(
          `Progress: ${processed}/${books.length} (${Math.round((processed / books.length) * 100)}%)`,
        );
      } catch (error) {
        failed++;
        console.error(`❌ Failed for book ${book._id}: ${error.message}`);
        // Continue with next book even if one fails
      }
    }

    console.log(`
    ✅ Backfill completed!
    ✅ Successfully embedded: ${processed}
    ❌ Failed: ${failed}
    `);
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    throw error;
  }
}
