import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    // Dynamically import to avoid build-time issues
    const { HuggingFaceInferenceEmbeddings } = await import(
      "@langchain/community/embeddings/hf"
    );
    const { PineconeStore } = await import("@langchain/pinecone");
    const { Pinecone } = await import("@pinecone-database/pinecone");

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACE_API_KEY,
      model: "sentence-transformers/all-mpnet-base-v2",
    });

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "travelmind-index");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
    });

    // Retrieve relevant documents WITHOUT calling Gemini
    const docs = await vectorStore.similaritySearch(query, 5);
    const context = docs.map((doc) => doc.pageContent).join("\n\n---\n\n");

    return NextResponse.json({
      answer: context, // Raw retrieved text — no LLM call needed
      sources: docs.map((doc) => doc.metadata),
    });
  } catch (error) {
    console.error("RAG retrieval error:", error);
    // Return empty result instead of 500 — RAG is optional enrichment
    return NextResponse.json({ answer: "", sources: [] });
  }
}
