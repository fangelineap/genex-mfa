# Automatic Tagging System

This project uses an automatic tagging system that creates version tags based on branch types and merge targets.

## How It Works

The tagging system follows these rules:

### Base Version
- The base version is read from `package.json` (currently `0.1.0`)
- This becomes the reference point `v0.1.0`

### Branch-Based Versioning

#### Feature Branches (`feat/*`)
- **First merge to main**: Creates `v0.2.0-beta.0` (increments minor version)
- **Subsequent merges**: `v0.2.0-beta.1`, `v0.2.0-beta.2`, etc.
- **Merged to release**: Removes `-beta.x` suffix → `v0.2.0`

#### Fix Branches (`fix/*`) 
- **First merge to main**: Creates `v0.1.1-beta.0` (increments patch version)
- **Subsequent merges**: `v0.1.1-beta.1`, `v0.1.1-beta.2`, etc.
- **Merged to release**: Removes `-beta.x` suffix → `v0.1.1`

#### Main Branch
- Continues incrementing beta versions based on the last merged branch type
- If last merge was from `feat/*`: continues `v0.2.0-beta.x` sequence
- If last merge was from `fix/*`: continues `v0.1.1-beta.x` sequence

#### Release Branch
- Converts the latest beta version to stable by removing `-beta.x` suffix
- `v0.2.0-beta.5` → `v0.2.0`
- `v0.1.1-beta.3` → `v0.1.1`

## Examples

### Scenario 1: Feature Development
```
Base: v0.1.0
feat/login → main: v0.2.0-beta.0
fix/typo → main: v0.2.0-beta.1
feat/signup → main: v0.2.0-beta.2
main → release: v0.2.0
```

### Scenario 2: Hotfix Development  
```
Base: v0.1.0
fix/bug → main: v0.1.1-beta.0
fix/another → main: v0.1.1-beta.1
feat/feature → main: v0.1.1-beta.2
main → release: v0.1.1
```

### Scenario 3: Mixed Development
```
Base: v0.1.0
feat/new → main: v0.2.0-beta.0
main → release: v0.2.0
fix/bug → main: v0.2.1-beta.0  (patch increment from v0.2.0)
main → release: v0.2.1
feat/next → main: v0.3.0-beta.0  (minor increment from v0.2.1)
```

## Manual Usage

You can run the tagging script manually:

```bash
node scripts/auto-tag.js
```

This will:
1. Detect the current branch
2. Analyze existing tags
3. Calculate the next version
4. Create and push the appropriate tag

## Automatic Usage

The GitHub workflow (`.github/workflows/release.yml`) automatically runs the tagging script when:
- Code is pushed to `main` branch
- Code is pushed to `release` branch
- Workflow is manually triggered

## Files

- `scripts/auto-tag.js` - The main tagging script
- `.github/workflows/release.yml` - GitHub Actions workflow
- `package.json` - Contains the base version reference