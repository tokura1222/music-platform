
type GitHubFile = {
    path: string;
    content: string; // base64 encoded
};

type GitResult = {
    success: boolean;
    message: string;
    details?: string;
    sha?: string;
};

export async function uploadToGitHub(
    token: string,
    repo: string,
    branch: string,
    message: string,
    files: GitHubFile[]
): Promise<GitResult> {
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

        return {
            success: true,
            message: 'GitHub APIでコミット＆プッシュが完了しました',
            sha: newCommitData.sha
        };
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('GitHub API Error:', error);
        return {
            success: false,
            message: 'GitHub APIでの操作に失敗しました',
            details: error.message || String(error),
        };
    }
}
