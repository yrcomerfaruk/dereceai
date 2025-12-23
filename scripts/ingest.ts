
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { TaskType } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!sbUrl || !sbKey || !googleKey) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const client = createClient(sbUrl, sbKey);

async function ingestData() {
    try {
        const subjectsPath = path.join(process.cwd(), 'app', 'onboarding', 'subjects.json');
        const subjectsRaw = fs.readFileSync(subjectsPath, 'utf-8');
        const subjects = JSON.parse(subjectsRaw);

        const docs = [];

        for (const subject of subjects) {
            // Chunking strategy: Each subject is a document, with its topics as content.
            // We could also chunk by topic if we want granular retrieval.
            // For now, let's try 1 doc per subject to keep context together.

            const content = `Ders: ${subject.name} (${subject.category})
Konular:
${subject.topics.join('\n')}
`;

            docs.push({
                pageContent: content,
                metadata: {
                    subject_id: subject.id,
                    name: subject.name,
                    category: subject.category,
                    type: 'curriculum'
                }
            });
        }

        console.log(`Prepared ${docs.length} documents.`);

        const embeddings = new GoogleGenerativeAIEmbeddings({
            apiKey: googleKey,
            modelName: "text-embedding-004",
            taskType: TaskType.RETRIEVAL_DOCUMENT
        });

        console.log('Generating embeddings...');
        try {
            // Simple test to ensure model works before batch processing
            await embeddings.embedQuery("test");
            console.log("Embedding model check passed.");
        } catch (e) {
            console.error("Embedding check failed:", e);
            throw e;
        }

        console.log('Initializing Vector Store...');

        // Check if store exists or just use fromDocuments which does upsert-ish logic usually if IDs provided, 
        // but here we are just adding. Ideally we should clear old data first or use specific IDs.
        // For simplicity in this script, we'll assuming appending or fresh start.

        // Optional: Clear existing curriculum docs
        const { error } = await client.from('documents').delete().eq('metadata->>type', 'curriculum');
        if (error) console.warn('Error clearing old docs:', error.message);
        else console.log('Cleared old curriculum documents.');

        const vectorStore = await SupabaseVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                client,
                tableName: 'documents',
                queryName: 'match_documents',
            }
        );

        console.log('Ingestion complete!');

    } catch (error) {
        console.error('Ingestion failed:', error);
    }
}

ingestData();
