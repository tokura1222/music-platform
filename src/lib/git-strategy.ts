import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

type GitResult = {
    success: boolean;
    message: string;
    details?: string;
};

/**
 * Determine which git strategy to use based on environment.
 * - GITHUB_TOKEN set → GitHub API (works on Vercel/serverless)
 * - Otherwise → local git CLI (works on VPS/self-hosted)
 */
function getStrategy(): 'github-api' | 'local' {
    if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) {
        return 'github-api';
    }
    return 'local';
}

// ──────────────────────────────────────────────
// Strategy 1: Local Git CLI (VPS / self-hosted)
// ──────────────────────────────────────────────

async function localGitCommitAndPush(
    message: string,
    filePaths: string[]
): Promise<GitResult> {
    const cwd = process.cwd();

    try {
        // Stage specified files
        for (const filePath of filePaths) {
            const relativePath = path.relative(cwd, filePath);
            await execAsync(`git add "${relativePath}"`, { cwd });
        }

        // Commit
        await execAsync(`git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd });

        // Push
        const branch = process.env.GIT_BRANCH || 'main';
        await execAsync(`git push origin ${branch}`, { cwd });

        return { success: true, message: 'コミットとプッシュが完了しました' };
    } catch (error: unknown) {
        const err = error as { stderr?: string; message?: string };
        // Check if "nothing to commit" (not really an error)
        if (err.stderr?.includes('nothing to commit') || err.message?.includes('nothing to commit')) {
            return { success: true, message: '変更はすでにコミット済みです' };
        }
        return {
            success: false,
            message: 'Git操作に失敗しました',
            details: err.stderr || err.message || '不明なエラー',
        };
    }
}

// ──────────────────────────────────────────────
// Strategy 2: GitHub API (Vercel / serverless)
// ──────────────────────────────────────────────

type GitHubFile = {
    path: string;
    content: string; // base64 encoded
};

async function githubApiCommitAndPush(
    message: string,
    files: GitHubFile[]
): Promise<GitResult> {
    const token = process.env.GITHUB_TOKEN!;
    const repo = process.env.GITHUB_REPO!; // format: "owner/repo"
    const branch = process.env.GIT_BRANCH || 'main';

    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
    };

    const apiBase = `https://api.github.com/repos/${repo}`;

    try {
        // 1. Get the latest commit SHA of the branch
        const refRes = await fetch(`${apiBase}/git/ref/heads/${branch}`, { headers });
        if (!refRes.ok) throw new Error(`Failed to get ref: ${await refRes.text()}`);
        const refData = await refRes.json();
        const latestCommitSha: string = refData.object.sha;

        // 2. Get the tree SHA of that commit
        const commitRes = await fetch(`${apiBase}/git/commits/${latestCommitSha}`, { headers });
        if (!commitRes.ok) throw new Error(`Failed to get commit: ${await commitRes.text()}`);
        const commitData = await commitRes.json();
        const baseTreeSha: string = commitData.tree.sha;

        // 3. Create blobs for each file
        const treeItems = [];
        for (const file of files) {
            const blobRes = await fetch(`${apiBase}/git/blobs`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    content: file.content,
                    encoding: 'base64',
                }),
            });
            if (!blobRes.ok) throw new Error(`Failed to create blob: ${await blobRes.text()}`);
            const blobData = await blobRes.json();

            treeItems.push({
                path: file.path,
                mode: '100644' as const,
                type: 'blob' as const,
                sha: blobData.sha,
            });
        }

        // 4. Create a new tree
        const treeRes = await fetch(`${apiBase}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                base_tree: baseTreeSha,
                tree: treeItems,
            }),
        });
        if (!treeRes.ok) throw new Error(`Failed to create tree: ${await treeRes.text()}`);
        const treeData = await treeRes.json();

        // 5. Create a new commit
        const newCommitRes = await fetch(`${apiBase}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message,
                tree: treeData.sha,
                parents: [latestCommitSha],
            }),
        });
        if (!newCommitRes.ok) throw new Error(`Failed to create commit: ${await newCommitRes.text()}`);
        const newCommitData = await newCommitRes.json();

        // 6. Update the branch reference
        const updateRefRes = await fetch(`${apiBase}/git/refs/heads/${branch}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({
                sha: newCommitData.sha,
            }),
        });
        if (!updateRefRes.ok) throw new Error(`Failed to update ref: ${await updateRefRes.text()}`);

        return { success: true, message: 'GitHub APIでコミット＆プッシュが完了しました' };
    } catch (error: unknown) {
        const err = error as Error;
        return {
            success: false,
            message: 'GitHub APIでのGit操作に失敗しました',
            details: err.message,
        };
    }
}

// ──────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────

export type CommitFile = {
    /** Absolute file path (for local) or repo-relative path (for GitHub API) */
    absolutePath: string;
    /** Repo-relative path (e.g., "content/songs/my-song.json") */
    relativePath: string;
    /** File content as string (used for GitHub API) */
    content: string;
};

/**
 * Commit and push files using the appropriate strategy.
 */
export async function commitAndPush(
    commitMessage: string,
    files: CommitFile[]
): Promise<GitResult> {
    const strategy = getStrategy();

    if (strategy === 'github-api') {
        const githubFiles: GitHubFile[] = files.map(f => ({
            path: f.relativePath,
            content: Buffer.from(f.content).toString('base64'),
        }));
        return githubApiCommitAndPush(commitMessage, githubFiles);
    } else {
        const absolutePaths = files.map(f => f.absolutePath);
        return localGitCommitAndPush(commitMessage, absolutePaths);
    }
}

/**
 * Get the current git strategy name.
 */
export function getCurrentStrategy(): string {
    return getStrategy();
}
