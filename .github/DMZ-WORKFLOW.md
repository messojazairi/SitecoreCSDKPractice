# DMZ Git Workflow Guide

## Overview

This repository uses a DMZ git workflow to ensure the `main` branch is always clean, deployable, and never breaks. All changes go through a validation layer before being merged to `main`.

## Branch Structure

- **`main`**: Always clean, deployable, and production-ready. Never commit directly to this branch.
- **`dmz`**: Validation branch. PRs are merged here first, validated by CI, then fast-forwarded to `main`.
- **Feature branches**: Created from `main`, PRs target `dmz`.

## Workflow Steps

### 1. Create a Feature Branch

**Always create feature branches from the latest `main`:**

```bash
# Ensure you have the latest main
git checkout main
git pull origin main

# Create your feature branch
git checkout -b feature/my-feature
```

### 2. Work on Your Feature

Make your commits as usual:

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### 3. Create a Pull Request to `dmz`

1. Go to GitHub and create a PR
2. **Important**: Set the base branch to `dmz` (not `main`)
3. The PR validation workflow will automatically check:
   - ✅ Your branch is based on the latest `main`
   - ✅ No merge conflicts with `dmz`
   - ✅ Linting passes
   - ✅ Formatting is correct
   - ✅ TypeScript type checking passes
   - ✅ All starters build successfully
   - ✅ All tests pass

### 4. If Validation Fails: "Not Based on Latest Main"

If you see this error, it means `main` was updated after you created your branch. Fix it:

```bash
# Fetch the latest main
git fetch origin main

# Rebase your branch onto the latest main
git checkout feature/my-feature
git rebase origin/main

# If there are conflicts, resolve them, then:
git add .
git rebase --continue

# Force push (use --force-with-lease for safety)
git push --force-with-lease origin feature/my-feature
```

### 5. Merge to `dmz` (Reviewers Only)

Once approved, reviewers will:
1. **Use "Squash and merge"** (this is required)
2. Ensure the squash commit message is descriptive
3. Delete the feature branch after merging

### 6. Automatic Validation and Fast-Forward

After merging to `dmz`:
1. The DMZ validation workflow runs as a **final gate** (double-checks everything)
2. If validation passes: `main` is automatically fast-forwarded to `dmz`
3. If validation fails: `dmz` can be rebased to remove the problematic commits

**Note**: Since PR validation already checked everything, dmz validation should almost always pass. This is a safety net in case something changes between PR approval and merge.

### 7. Keep Your Branches Updated

If you have a long-running feature branch, regularly update it:

```bash
# Fetch the latest main
git fetch origin main

# Rebase your branch
git checkout feature/my-feature
git rebase origin/main
git push --force-with-lease origin feature/my-feature
```

## Common Issues and Solutions

### Issue: "Previous commits showing in my PR"

**Cause**: Your branch was created from an outdated `main` before other PRs were merged.

**Solution**: Rebase your branch onto the latest `main` (see Step 4 above).

### Issue: "Merge conflicts with dmz"

**Cause**: Another PR changed the same files you're working on.

**Solution**:
```bash
git fetch origin main
git rebase origin/main
# Resolve conflicts
git add .
git rebase --continue
git push --force-with-lease origin feature/my-feature
```

### Issue: "My PR includes commits from other PRs"

**Cause**: You created your branch from `dmz` or another feature branch instead of `main`.

**Solution**: Create a new branch from `main` and cherry-pick your commits:
```bash
git checkout main
git pull origin main
git checkout -b feature/my-feature-fixed

# Cherry-pick only YOUR commits
git cherry-pick <commit-hash-1> <commit-hash-2>
git push origin feature/my-feature-fixed
```

## Best Practices

1. **Always branch from `main`**, never from `dmz` or other feature branches
2. **Keep feature branches short-lived** (merge within 1-2 days if possible)
3. **Rebase frequently** if you have a long-running branch
4. **Squash is mandatory** - don't use regular merge commits for PRs to `dmz`
5. **Clean up**: Delete feature branches after they're merged
6. **Communication**: Coordinate with team if working on overlapping areas

## Why This Workflow?

### Two-Tier Validation

This workflow uses **defense in depth** with two validation layers:

1. **PR Validation** (before merge to dmz):
   - Checks if branch is based on latest main
   - Runs lint, format, type-check, build, tests
   - Catches issues early, before they reach dmz
   - Provides fast feedback to developers

2. **DMZ Validation** (after merge to dmz, before fast-forward to main):
   - Double-checks everything again
   - Safety net in case something changes between PR approval and merge
   - Only fast-forwards to main if validation passes
   - Protects main from any issues that slip through

### Benefits

- **`main` is always clean**: Never breaks, always deployable
- **Early feedback**: Issues caught at PR time, not after merge
- **Automated validation**: CI catches issues before they reach `main`
- **Fast rollback**: Can rebase `dmz` to remove bad commits without affecting `main`
- **Clear history**: Squash commits create a clean, linear history
- **Safe fast-forward**: `main` only moves forward when CI passes
- **No duplicate commits**: Enforcing base branch prevents "previous commits" in PRs

### Why Squash and Merge?

- Creates a single commit per feature
- Clean, linear history on `main`
- Easy to revert entire features
- Removes "fix typo" and "address review comments" noise

### Why Fast-Forward?

- `main` and `dmz` share the same commit SHAs
- No merge commits cluttering history
- Easy to understand what's deployed
- Predictable git graph

## Troubleshooting

If you're stuck, try this checklist:

- [ ] Am I on the latest `main`? (`git fetch origin main && git rebase origin/main`)
- [ ] Have I resolved all conflicts?
- [ ] Did I push with `--force-with-lease`?
- [ ] Is my PR targeting `dmz` (not `main`)?
- [ ] Did the PR validation pass?

For more help, contact the repository maintainers.


