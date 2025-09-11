#!/usr/bin/env node

const { execSync } = require('child_process');

function getCurrentBranch() {
    // In GitHub Actions, try to get the source branch from environment or commit message
    if (process.env.GITHUB_HEAD_REF) {
        // This is set for pull requests
        return process.env.GITHUB_HEAD_REF;
    }
    
    if (process.env.GITHUB_REF_NAME) {
        const currentBranch = process.env.GITHUB_REF_NAME;
        
        // If we're on main or release, try to detect source branch from recent commit
        if (currentBranch === 'main' || currentBranch === 'release') {
            try {
                // Get the most recent commit message
                const commitMessage = execSync('git log -1 --pretty=format:"%s"', { encoding: 'utf8' }).trim();
                
                // Look for merge commit patterns
                const mergeMatch = commitMessage.match(/Merge pull request #\d+ from .+\/(feat|fix)\/(.+)/);
                if (mergeMatch) {
                    return `${mergeMatch[1]}/branch-from-merge`;
                }
                
                // Look for commit message prefixes
                if (commitMessage.startsWith('feat:') || commitMessage.startsWith('feat(')) {
                    return 'feat/from-commit';
                }
                if (commitMessage.startsWith('fix:') || commitMessage.startsWith('fix(')) {
                    return 'fix/from-commit';
                }
            } catch (error) {
                console.log('Could not detect source branch from commit message');
            }
        }
        
        return currentBranch;
    }
    
    // Fallback to git command (local usage)
    return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

function getLatestTag() {
    try {
        return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch {
        return 'v0.1.0'; // Default base tag
    }
}

function getAllTags() {
    try {
        const tags = execSync('git tag -l', { encoding: 'utf8' }).trim();
        return tags ? tags.split('\n') : [];
    } catch {
        return [];
    }
}

function parseVersion(tag) {
    const match = tag.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-beta\.(\d+))?$/);
    if (!match) return null;
    
    return {
        major: parseInt(match[1]),
        minor: parseInt(match[2]),
        patch: parseInt(match[3]),
        beta: match[4] ? parseInt(match[4]) : null
    };
}

function formatVersion(version, isBeta = false) {
    let versionStr = `v${version.major}.${version.minor}.${version.patch}`;
    if (isBeta && version.beta !== null) {
        versionStr += `-beta.${version.beta}`;
    }
    return versionStr;
}

function getBranchType(branchName) {
    if (branchName.startsWith('feat/')) return 'feat';
    if (branchName.startsWith('fix/')) return 'fix';
    if (branchName === 'main') return 'main';
    if (branchName === 'release') return 'release';
    return 'other';
}

function getNextVersion(currentBranch, allTags) {
    const branchType = getBranchType(currentBranch);
    console.log(`Branch type: ${branchType}`);
    
    if (branchType === 'release') {
        // For release branch, convert latest beta to stable
        const latestTag = getLatestTag();
        const version = parseVersion(latestTag);
        if (version && version.beta !== null) {
            return formatVersion(version, false);
        }
        return latestTag;
    }
    
    if (branchType === 'main') {
        // For main branch, create beta versions
        const baseVersion = getBaseVersion();
        const latestBetaVersion = getLatestBetaForBase(baseVersion, allTags);
        
        if (latestBetaVersion) {
            // Increment beta version
            latestBetaVersion.beta++;
            return formatVersion(latestBetaVersion, true);
        } else {
            // First beta for this base version
            const newVersion = { ...baseVersion, beta: 0 };
            return formatVersion(newVersion, true);
        }
    }
    
    // For feat/* and fix/* branches on main, determine version based on branch type
    const baseVersion = getBaseVersion();
    
    if (branchType === 'feat') {
        // Increment minor version for feat
        const newVersion = {
            major: baseVersion.major,
            minor: baseVersion.minor + 1,
            patch: 0,
            beta: 0
        };
        
        const latestBeta = getLatestBetaForBase(newVersion, allTags);
        if (latestBeta) {
            latestBeta.beta++;
            return formatVersion(latestBeta, true);
        }
        
        return formatVersion(newVersion, true);
    }
    
    if (branchType === 'fix') {
        // Increment patch version for fix
        const newVersion = {
            major: baseVersion.major,
            minor: baseVersion.minor,
            patch: baseVersion.patch + 1,
            beta: 0
        };
        
        const latestBeta = getLatestBetaForBase(newVersion, allTags);
        if (latestBeta) {
            latestBeta.beta++;
            return formatVersion(latestBeta, true);
        }
        
        return formatVersion(newVersion, true);
    }
    
    return null;
}

function getBaseVersion() {
    const packageJson = require('../package.json');
    const version = parseVersion(`v${packageJson.version}`);
    return version || { major: 0, minor: 1, patch: 0, beta: null };
}

function getLatestBetaForBase(baseVersion, allTags) {
    const betaTags = allTags
        .map(tag => parseVersion(tag))
        .filter(v => v && 
            v.major === baseVersion.major && 
            v.minor === baseVersion.minor && 
            v.patch === baseVersion.patch && 
            v.beta !== null
        )
        .sort((a, b) => b.beta - a.beta);
    
    return betaTags.length > 0 ? betaTags[0] : null;
}

function createTag(tagName) {
    try {
        execSync(`git tag ${tagName}`, { stdio: 'inherit' });
        console.log(`Created tag: ${tagName}`);
        
        // Push the tag to remote
        execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
        console.log(`Pushed tag: ${tagName}`);
        
        return true;
    } catch (error) {
        console.error(`Failed to create/push tag: ${error.message}`);
        return false;
    }
}

function main() {
    const currentBranch = getCurrentBranch();
    const allTags = getAllTags();
    
    console.log(`Current branch: ${currentBranch}`);
    console.log(`Existing tags: ${allTags.join(', ') || 'none'}`);
    
    const nextVersion = getNextVersion(currentBranch, allTags);
    
    if (!nextVersion) {
        console.log('No version update needed for this branch type');
        return;
    }
    
    if (allTags.includes(nextVersion)) {
        console.log(`Tag ${nextVersion} already exists, skipping`);
        return;
    }
    
    console.log(`Next version: ${nextVersion}`);
    
    const success = createTag(nextVersion);
    if (success) {
        console.log('Tagging completed successfully');
    } else {
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    getCurrentBranch,
    getLatestTag,
    parseVersion,
    formatVersion,
    getBranchType,
    getNextVersion
};