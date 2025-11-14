# Publishing Guide

This document explains how to publish the `claude-agent-ai-provider` package to npm.

## Pre-Publishing Checklist

✅ Package is configured for publishing
✅ TypeScript build setup complete
✅ Type definitions generated
✅ Tests passing
✅ License file created (MIT)
✅ Repository URL set (https://github.com/mherod/claude-agent-ai-provider)

## Package Information

- **Name**: `claude-agent-ai-provider`
- **Version**: `0.1.0`
- **License**: MIT
- **Author**: Matthew Herod
- **Repository**: https://github.com/mherod/claude-agent-ai-provider

## What Gets Published

The published package includes:
- `dist/` - Compiled JavaScript and TypeScript declarations
- `README.md` - Package documentation
- `LICENSE` - MIT license
- `CLAUDE.md` - Development guide
- `package.json` - Package metadata

**Excluded** (via `.npmignore`):
- Source TypeScript files (`src/`, `index.ts`)
- Examples (`examples/`)
- Tests (`test/`)
- Development configuration files
- Git files

## Publishing Steps

### 1. Ensure you're logged into npm

```bash
npm login
```

### 2. Verify package contents

Preview what will be published:

```bash
npm pack --dry-run
```

This shows exactly which files will be included in the package.

### 3. Run prepublish checks

The `prepublishOnly` script automatically runs before publishing:

```bash
bun run prepublishOnly
```

This will:
1. ✅ Type-check source code
2. ✅ Build the package (JS + type definitions)
3. ✅ Run all tests

### 4. Publish to npm

For the first publish:

```bash
npm publish
```

For subsequent versions:

```bash
# Update version first
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Then publish
npm publish
```

### 5. Verify publication

After publishing, verify the package:

```bash
npm view claude-agent-ai-provider
```

Test installation:

```bash
# In a different directory
mkdir test-install && cd test-install
npm init -y
npm install claude-agent-ai-provider
```

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features (backwards compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

## Post-Publishing Tasks

1. **Tag the release in Git**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. **Create GitHub Release**:
   - Go to https://github.com/mherod/claude-agent-ai-provider/releases
   - Create a new release with the version tag
   - Add release notes

3. **Update documentation**:
   - Update README with installation instructions
   - Add any changelog entries

## Common Commands

```bash
# Clean build artifacts
bun run clean

# Build package
bun run build

# Type-check source
bun run typecheck:src

# Run tests
bun test

# Full pre-publish check
bun run prepublishOnly
```

## Troubleshooting

### "Package already exists"
If the package name is taken, you may need to:
1. Choose a different name
2. Publish under a scope: `@mherod/claude-agent-ai-provider`

### "403 Forbidden"
- Ensure you're logged in: `npm whoami`
- Check npm permissions for the package

### Build Errors
```bash
# Clean and rebuild
bun run clean
bun install
bun run build
```

### Test Failures
Fix any failing tests before publishing:
```bash
bun test --watch  # Run tests in watch mode
```

## Package Registry

Default registry: https://registry.npmjs.org

To publish to a different registry:
```bash
npm publish --registry https://your-registry.com
```

## Support

- Issues: https://github.com/mherod/claude-agent-ai-provider/issues
- npm page: https://www.npmjs.com/package/claude-agent-ai-provider (after first publish)
