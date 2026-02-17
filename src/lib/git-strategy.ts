import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

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
            // Check if file still exists (it might have been deleted by fs.unlink)
            // But for git add, we might need git rm if it was deleted.
            // Actually, `git add -A` handles deletions too, but here we add specific files.

            // If we deleted the file via fs.unlink, `git add` limits to that file might be tricky if it doesn't exist.
            // Better to use `git add .` or check existence.

            // Strategy: 
            // If the file exists, git add it.
            // If it doesn't exist, git rm --cached it (or git add it which detects deletion in newer git versions?)
            // safely use `git add -A` for the specific path?

            // Simpler approach for this specific file array:
            // Since we passed absolute paths, and we know we touched them.
            // If we used `fs.unlink`, the file is gone.

            const relativePath = path.relative(cwd, filePath);

            // Check existence
            try {
                await fs.access(filePath);
                await execAsync(`git add "${relativePath}"`, { cwd });
            } catch {
                // File doesn't exist, so it must be a deletion
                await execAsync(`git add "${relativePath}"`, { cwd }); // git add handles deletion of tracked files
            }
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
    content?: string; // base64 encoded
    deleted?: boolean;
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
            if (file.deleted) {
                treeItems.push({
                    path: file.path,
                    mode: '100644' as const,
                    type: 'blob' as const,
                    sha: null, // Deletes the file
                });
                continue;
            }

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
    /** File content as string or Buffer */
    content?: string | Buffer;
    /** Whether to delete the file */
    deleted?: boolean;
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
        const githubFiles: GitHubFile[] = files.map(f => {
            if (f.deleted) {
                return {
                    path: f.relativePath,
                    deleted: true
                };
            }

            let contentBase64: string;
            // f.content should be present if not deleted
            const content = f.content || '';

            if (Buffer.isBuffer(content)) {
                contentBase64 = content.toString('base64');
            } else {
                contentBase64 = Buffer.from(content).toString('base64');
            }

            return {
                path: f.relativePath,
                content: contentBase64,
            };
        });
        return githubApiCommitAndPush(commitMessage, githubFiles);
    } else {
        // For local strategy, we need to write files first if they are passed as content
        // This function assumes files are already written if content is not provided, 
        // but here we allow writing content.

        // Actually, localGitCommitAndPush only takes paths. 
        // So we should write the content to disk first.
        // for local strategy
        for (const f of files) {
            if (f.deleted) {
                // If it was already deleted by the caller (like api/admin/delete/route.ts), await fs.unlink might fail.
                // But localGitCommitAndPush expects the file to be gone or ready to be `git add`ed.
                // If we want to be sure, we can try to unlink it here too, ignoring errors.
                try {
                    await fs.unlink(f.absolutePath);
                } catch {
                    // ignore if already deleted
                }
            } else if (f.content) {
                await fs.mkdir(path.dirname(f.absolutePath), { recursive: true });
                await fs.writeFile(f.absolutePath, f.content);
            }
        }

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
