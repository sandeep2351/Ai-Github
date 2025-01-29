import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';
import { Document } from '@langchain/core/documents';
import { generateEmbedding, summariseCode } from './gemini';
import {db} from '@/server/db';


export const loadGithubRepo = async (githubUrl: string, githubAccessToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubAccessToken || '',
        branch: 'main',
        recursive: true,
        ignoreFiles: ['package.json', 'package-lock.json', 'yarn.lock', 'node_modules', 'dist', 'build', 'out', 'public', 'coverage', '.git', '.github', '.vscode', '.idea', '.gitignore', '.npmignore', '.eslintrc.js', '.prettierrc.js', '.babelrc.js', '.env', '.env.local', '.env.development', '.env.test', '.env.production', '.env'],
        unknown: 'warn',
        maxConcurrency: 5
    });

    const docs = await loader.load();

    return docs;
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubAccessToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubAccessToken);

    const allEmbeddings = await generateEmbeddings(docs);

    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        if (!embedding) return;

        const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
            data: {
                summary: embedding.summary,
                sourceCode: embedding.sourceCode,
                fileName: embedding.fileName,
                projectId, 
            }
        })

        await db.$executeRaw`
        UPDATE "SourceCodeEmbedding"
        SET "embedding" = ${embedding.embedding}::vector
        WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async (doc) => {
        const summary = await summariseCode(doc);
        const embedding = await generateEmbedding(summary);

        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}