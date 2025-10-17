# DMZ Workflow - Complete Solution

## Problem Solved

When using **squash and merge** to `dmz` followed by **fast-forward** to `main`, developers were seeing "previous commits appearing in their PRs." This happened when developers created feature branches from an outdated `main` that hadn't yet been fast-forwarded with the latest squashed commits.

## Solution Overview

A **two-tier validation system** that:
1. ✅ Prevents PRs based on outdated `main` from being merged
2. ✅ Validates code quality at PR time (before merge)
3. ✅ Double-checks everything after merge to `dmz` (before fast-forward to `main`)
4. ✅ Maintains both requirements: squash merge + fast-forward

## Implementation

### Gate 1: PR Validation (`.github/workflows/pr-validation.yml`)

**Triggers**: When a PR is opened or updated targeting `dmz`

**Validates**:
- ✅ PR branch is based on the **latest `main` HEAD**
- ✅ PR can be squash merged without conflicts
- ✅ Linting passes
- ✅ Formatting is correct
- ✅ TypeScript type checking passes
- ✅ All starters build successfully
- ✅ All tests pass

**Result**: 
- If validation fails → PR blocked, developer must fix issues
- If validation passes → PR can be reviewed and merged

**Benefits**:
- Catches issues **before** merge
- Fast feedback to developers
- Prevents "duplicate commits" problem
- Ensures code quality before reaching `dmz`

### Gate 2: DMZ Validation (`.github/workflows/dmz-validation.yml`)

**Triggers**: When code is pushed to `dmz` (after PR is squash merged)

**Validates**:
- ✅ Linting passes (double-check)
- ✅ Formatting is correct (double-check)
- ✅ TypeScript type checking passes (double-check)
- ✅ All starters build successfully (double-check)
- ✅ All tests pass (double-check)

**Result**:
- If validation fails → `main` is NOT updated, `dmz` can be rebased
- If validation passes → `main` is automatically fast-forwarded to `dmz`

**Benefits**:
- Final safety net before touching `main`
- Catches issues if something changes between PR approval and merge
- Ensures `main` is ALWAYS clean and deployable

## How It Prevents Duplicate Commits

### The Old Problem

```
Timeline:
1. Developer A creates feature-a from main (commit A→B→C)
2. Developer A adds commits D, E
3. Developer A's PR is squash merged to dmz as commit F
4. Main is fast-forwarded to include F
5. Developer B created feature-b from main at step 1 (has A→B→C)
6. Developer B's PR shows commits D, E, G, H ❌
   - D and E are from Developer A
   - G and H are from Developer B
   - GitHub doesn't know D and E were squashed into F
```

### The New Solution

```
Timeline:
1. Developer A creates feature-a from main (commit A→B→C)
2. Developer A adds commits D, E
3. Developer A's PR validation checks: based on latest main? ✅
4. PR is squash merged to dmz as commit F
5. Main is fast-forwarded to include F
6. Developer B created feature-b from main at step 1 (has A→B→C)
7. Developer B's PR validation checks: based on latest main? ❌
8. PR is REJECTED with clear instructions
9. Developer B rebases: git rebase origin/main
10. Now Developer B's branch has A→B→C→F→G→H
11. Developer B's PR validation checks: based on latest main? ✅
12. Developer B's PR shows only commits G, H ✅
```

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Workflow                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              Create feature branch from main
                            │
                            ▼
                  Make changes and commit
                            │
                            ▼
                 Push and create PR to dmz
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              GATE 1: PR Validation Workflow                  │
├─────────────────────────────────────────────────────────────┤
│  1. Check if based on latest main                           │
│  2. Check if can be squash merged                           │
│  3. Run lint, format, type-check                            │
│  4. Build all starters                                      │
│  5. Run all tests                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
             ❌ FAIL                  ✅ PASS
         (Fix issues)            (Ready for review)
                                        │
                                        ▼
                               Code review + approval
                                        │
                                        ▼
                            Squash and merge to dmz
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────┐
│            GATE 2: DMZ Validation Workflow                   │
├─────────────────────────────────────────────────────────────┤
│  1. Run lint, format, type-check (double-check)             │
│  2. Build all starters (double-check)                       │
│  3. Run all tests (double-check)                            │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
             ❌ FAIL                  ✅ PASS
      (Rebase dmz to              (Fast-forward
       remove bad commit)           main to dmz)
                                        │
                                        ▼
                              Main is updated ✅
                           (Always clean, always deployable)
```

## Key Configuration

### Required Branch Protection Rules

**For `dmz` branch**:
- ✅ Require pull request before merging
- ✅ Require status checks: `Validate PR Base Branch` + `Validate PR Code Quality`
- ✅ Allow squash merging ONLY (disable merge commits and rebase merging)
- ✅ Require approvals (recommended)

**For `main` branch**:
- ✅ Block direct pushes (except from `github-actions[bot]`)
- ✅ Require linear history
- ✅ Block force pushes
- ✅ No PRs accepted (only fast-forward from CI)

See [BRANCH-PROTECTION-SETUP.md](BRANCH-PROTECTION-SETUP.md) for detailed configuration.

## Developer Quick Reference

### Daily Workflow

```bash
# 1. Start feature from latest main
git checkout main
git pull origin main
git checkout -b feature/my-feature

# 2. Make changes
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# 3. Create PR to dmz on GitHub
# 4. PR validation runs automatically
# 5. If "not based on latest main" error:
git fetch origin main
git rebase origin/main
git push --force-with-lease origin feature/my-feature
``` 

### Common Error: "Not Based on Latest Main"

**What it means**: Your branch was created before `main` was updated.

**How to fix**:
```bash
git fetch origin main
git rebase origin/main
git push --force-with-lease origin feature/my-feature
```

**Why `--force-with-lease`**: It's a safer version of force push that checks no one else pushed to your branch first.

## Benefits Summary

| Benefit | Description |
|---------|-------------|
| **No Duplicate Commits** | PRs only show new changes, not previous squashed commits |
| **Early Feedback** | Issues caught at PR time, not after merge |
| **Always Clean Main** | Two validation gates ensure main never breaks |
| **Fast-Forward Works** | Enforcing base branch makes fast-forward reliable |
| **Clean History** | Squash merge creates one commit per feature |
| **Safety Net** | Two tiers of validation catch issues before they reach main |
| **Clear Process** | Automated checks guide developers with clear messages |

## Files Created/Modified

### New Files
- `.github/workflows/pr-validation.yml` - First gate validation
- `.github/DMZ-WORKFLOW.md` - Complete developer guide
- `.github/DMZ-QUICK-REFERENCE.md` - Quick reference card
- `.github/BRANCH-PROTECTION-SETUP.md` - Setup guide for maintainers
- `.github/DMZ-COMPLETE-SOLUTION.md` - This document

### Modified Files
- `.github/workflows/dmz-validation.yml` - Enhanced with comments explaining second gate
- `README.md` - Added development workflow section

## Testing the Solution

### 1. Test PR Validation - Happy Path

```bash
# Create branch from latest main
git checkout main
git pull origin main
git checkout -b test-feature

# Make a change
echo "test" >> README.md
git add README.md
git commit -m "test: happy path"
git push origin test-feature

# Create PR to dmz on GitHub
# Expected: ✅ All checks pass
```

### 2. Test PR Validation - Outdated Branch

```bash
# Create branch from old main
git checkout -b test-outdated <old-commit-hash>

# Make a change
echo "test" >> README.md
git add README.md
git commit -m "test: outdated branch"
git push origin test-outdated

# Create PR to dmz on GitHub
# Expected: ❌ "Not based on latest main" error

# Fix it
git fetch origin main
git rebase origin/main
git push --force-with-lease origin test-outdated

# Expected: ✅ Now checks pass
```

### 3. Test DMZ Validation

```bash
# After merging a PR to dmz
# Check Actions tab on GitHub
# Expected: ✅ DMZ validation passes and main is fast-forwarded
```

## Next Steps

1. **Configure Branch Protection** - Follow [BRANCH-PROTECTION-SETUP.md](BRANCH-PROTECTION-SETUP.md)
2. **Test the Workflows** - Use the test scenarios above
3. **Share with Team** - Send [DMZ-QUICK-REFERENCE.md](DMZ-QUICK-REFERENCE.md) to all developers
4. **Monitor First Week** - Watch for issues and gather feedback
5. **Iterate** - Update documentation based on team feedback

## Support

- **Quick Help**: [DMZ-QUICK-REFERENCE.md](DMZ-QUICK-REFERENCE.md)
- **Complete Guide**: [DMZ-WORKFLOW.md](DMZ-WORKFLOW.md)
- **Setup Help**: [BRANCH-PROTECTION-SETUP.md](BRANCH-PROTECTION-SETUP.md)
- **Main README**: [../README.md](../README.md)

## Success Metrics

Track these to measure workflow effectiveness:

- ✅ Number of PRs rejected for outdated base → should decrease over time as team learns
- ✅ Number of dmz validation failures → should be very low (< 1%)
- ✅ Time from PR creation to merge → should improve with early feedback
- ✅ Number of "duplicate commits" complaints → should be zero
- ✅ Main branch stability → should be 100% (never breaks)

