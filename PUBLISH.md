# Publishing ArtMapper to npm

This guide explains how to publish ArtMapper to npm.

## Prerequisites

1. npm account (create at https://www.npmjs.com/signup)
2. npm CLI installed (comes with Node.js)
3. Build the project first

## Steps to Publish

### 1. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 2. Login to npm

```bash
npm login
```

Enter your npm username, password, and email when prompted.

### 3. Verify Package Name Availability

The package name `artmapper` should be available. If not, you may need to:
- Use a scoped package: `@sanjaysokal/artmapper`
- Choose a different name

To check availability, try:
```bash
npm view artmapper
```

If it returns 404, the name is available.

### 4. Update Version (if needed)

Before publishing, update the version in `package.json`:

```bash
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

Or manually edit `package.json`:
```json
{
  "version": "1.0.0"
}
```

### 5. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows what files will be included in the package.

### 6. Publish to npm

For first-time publish:

```bash
npm publish --access public
```

For subsequent publishes:

```bash
npm publish
```

If using a scoped package:

```bash
npm publish --access public
```

### 7. Verify Publication

Check that your package is published:

```bash
npm view artmapper
```

Or visit: https://www.npmjs.com/package/artmapper

## Post-Publication

### 1. Create a Git Tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. Create a GitHub Release

1. Go to https://github.com/SanjaySokal/artmapper/releases
2. Click "Create a new release"
3. Choose the tag (v1.0.0)
4. Add release notes
5. Publish release

### 3. Update Documentation

Update README.md with installation instructions:

```markdown
npm install artmapper
```

## Updating the Package

For future updates:

1. Make your changes
2. Update version: `npm version patch|minor|major`
3. Build: `npm run build`
4. Publish: `npm publish`
5. Create git tag and GitHub release

## Troubleshooting

### Package name already taken

If `artmapper` is taken, use a scoped package:

```json
{
  "name": "@sanjaysokal/artmapper"
}
```

Then users install with:
```bash
npm install @sanjaysokal/artmapper
```

### Authentication errors

Make sure you're logged in:
```bash
npm whoami
```

If not logged in:
```bash
npm login
```

### Build errors

Make sure TypeScript compiles without errors:
```bash
npm run build
```

Check `tsconfig.json` configuration.

### Missing files

Verify `.npmignore` includes only what should be excluded. The `files` field in `package.json` specifies what to include.

## Package.json Configuration

The `package.json` is already configured with:

- ✅ Proper `main` and `types` fields
- ✅ `files` array specifying what to publish
- ✅ `prepublishOnly` script to build before publishing
- ✅ Repository and homepage URLs
- ✅ Keywords for discoverability
- ✅ License information

## Testing Installation

After publishing, test the installation:

```bash
mkdir test-install
cd test-install
npm init -y
npm install artmapper
```

Verify it works:
```bash
node -e "const { Entity, Table } = require('artmapper'); console.log('ArtMapper installed successfully!');"
```

## Next Steps

1. ✅ Publish to npm
2. ✅ Create GitHub release
3. ✅ Share on social media
4. ✅ Add to awesome lists
5. ✅ Write blog post (optional)
6. ✅ Monitor issues and feedback

Good luck with your publication! 🚀

