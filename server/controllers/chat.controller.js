import ollama from "ollama";
import { appError } from "../utils/appError.js";
import Book from "../models/product.model.js";

export const chat = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return appError(res, 400, "Query required");
  }

  // 1️ Create embedding
  const embedRes = await ollama.embed({
    model: "nomic-embed-text",
    input: query,
  });

  const queryVector = embedRes.embeddings[0];

  // 2️ Vector search
  const vectorResults = await Book.aggregate([
    {
      $vectorSearch: {
        index: "vector_index",
        path: "embedding",
        queryVector: queryVector,
        numCandidates: 100,
        limit: 5,
      },
    },
    {
      $project: {
        _id: 1,
        bookName: 1,
        author: 1,
        category: 1,
        price: 1,
        stock: 1,
        description: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  // 3️ Keyword search
  const keywordResults = await Book.aggregate([
    {
      $match: {
        $or: [
          { bookName: { $regex: query, $options: "i" } },
          { author: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
      },
    },
    {
      $limit: 2,
    },
    {
      $project: {
        _id: 1,
        bookName: 1,
        author: 1,
        category: 1,
        price: 1,
        stock: 1,
        description: 1,
      },
    },
  ]);

  // 4️ Merge results (remove duplicates)
  const mergedMap = new Map();

  [...keywordResults, ...vectorResults].forEach((book) => {
    mergedMap.set(book._id.toString(), book);
  });

  const results = Array.from(mergedMap.values()).slice(0, 5);

  // 5️ Build context
  const context = results
    .map(
      (book, i) =>
        `Book ${i + 1}
bookName: ${book.bookName}
Author: ${book.author}
Category: ${book.category}
Price: $${book.price}
Description: ${book.description}`,
    )
    .join("\n\n");

  // 6️ Prompt
  const prompt = `
You are an AI assistant for an online bookstore.

Only use the provided book data to answer.
If the question is unrelated to books, say politely that you can only help with books.

BOOK DATA:
${context || "No relevant books found."}

USER QUESTION:
${query}

Respond naturally in 3–4 sentences.
If appropriate, recommend specific books.
`;

  // 7️ Generate response
  const response = await ollama.chat({
    model: "llama3",
    messages: [{ role: "user", content: prompt }],
  });

  // 8️⃣ Same response format as before
  res.json({
    answer: response.message?.content,
    books: results,
  });
};
