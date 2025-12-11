# DMZ Workflow Testing Plan - Edge Cases

## Overview

This document outlines comprehensive edge case testing scenarios for the DMZ workflow validation system. The testing plan covers PR validation, DMZ validation, and various edge cases that could occur in real-world scenarios.

## Test Categories

### 1. PR Validation Workflow (`pr-validation.yml`) Edge Cases

#### 1.1 Base Branch Validation Edge Cases

**Test Case: TC-PR-001 - PR Branch Based on Outdated Main**
- **Setup**: Create a feature branch from an old main commit (before latest main HEAD)
- **Expected**: ❌ Validation fails with "Not based on latest main" error
- **Verification**: 
  - Check that `base-check-passed=false` is set
  - Verify error message provides clear rebase instructions
  - Confirm PR comment is created/updated with failure status

**Test Case: TC-PR-002 - PR Branch Based on Latest Main**
- **Setup**: Create a feature branch from the latest main HEAD
- **Expected**: ✅ Base check passes
- **Verification**: 
  - Check that `base-check-passed=true` is set
  - Verify no error messages about outdated branch

**Test Case: TC-PR-003 - PR Branch Created from DMZ Instead of Main**
- **Setup**: Create feature branch from `dmz` branch instead of `main`
- **Expected**: ❌ Validation fails (merge base will not match main HEAD)
- **Verification**: Error message should indicate branch is not based on main

**Test Case: TC-PR-004 - PR Branch with Multiple Commits Ahead of Main**
- **Setup**: Create branch from main, add multiple commits, then main gets updated
- **Expected**: ❌ Validation fails until rebased
- **Verification**: After rebase, validation should pass

**Test Case: TC-PR-005 - Empty PR (No Changes)**
- **Setup**: Create PR with no actual changes (branch equals main)
- **Expected**: Should handle gracefully (may pass or fail depending on implementation)
- **Verification**: Check workflow doesn't crash

#### 1.2 Merge Conflict Detection Edge Cases

**Test Case: TC-PR-006 - PR with Merge Conflicts**
- **Setup**: Create PR that conflicts with current dmz branch
- **Expected**: ❌ Merge check fails
- **Verification**: 
  - Check that `merge-check-passed=false` is set
  - Verify error message provides rebase instructions
  - Confirm test-merge branch is cleaned up

**Test Case: TC-PR-007 - PR Without Merge Conflicts**
- **Setup**: Create PR that can be cleanly squash merged
- **Expected**: ✅ Merge check passes
- **Verification**: 
  - Check that `merge-check-passed=true` is set
  - Verify test-merge branch is cleaned up properly

**Test Case: TC-PR-008 - PR with Conflicts in Deleted Files**
- **Setup**: PR deletes a file that was modified in dmz
- **Expected**: ❌ Merge check should detect conflict
- **Verification**: Proper conflict detection

**Test Case: TC-PR-009 - PR with Conflicts in Renamed Files**
- **Setup**: PR renames a file that was modified in dmz
- **Expected**: ❌ Merge check should detect conflict
- **Verification**: Proper conflict detection

**Test Case: TC-PR-010 - Concurrent PRs with Overlapping Changes**
- **Setup**: Two PRs modify the same file, first one merges, second one conflicts
- **Expected**: Second PR should fail merge check until rebased
- **Verification**: After rebase, merge check should pass

#### 1.3 Change Detection Edge Cases

**Test Case: TC-PR-011 - Single Starter Change**
- **Setup**: PR modifies only files in `examples/kit-nextjs-skate-park/`
- **Expected**: ✅ Only `kit-nextjs-skate-park` is validated
- **Verification**: 
  - Check `changed-starters` output contains only one starter
  - Verify other starters are not processed

**Test Case: TC-PR-012 - Multiple Starter Changes**
- **Setup**: PR modifies files in multiple starters
- **Expected**: ✅ All changed starters are validated
- **Verification**: Check `changed-starters` output contains all modified starters

**Test Case: TC-PR-013 - Global File Changes (xmcloud.build.json)**
- **Setup**: PR modifies `xmcloud.build.json`
- **Expected**: ✅ All starters are validated (global change)
- **Verification**: 
  - Check `changed-starters` contains all 4 starters
  - Verify all starters go through full validation

**Test Case: TC-PR-014 - Global File Changes (.github/workflows)**
- **Setup**: PR modifies workflow files
- **Expected**: ✅ All starters are validated
- **Verification**: All starters validated

**Test Case: TC-PR-015 - Global File Changes (README.md)**
- **Setup**: PR modifies README.md
- **Expected**: ✅ All starters are validated
- **Verification**: All starters validated

**Test Case: TC-PR-016 - Mixed Changes (Global + Starter)**
- **Setup**: PR modifies both global files and starter files
- **Expected**: ✅ All starters are validated
- **Verification**: Global change takes precedence

**Test Case: TC-PR-017 - Changes Outside Examples Directory**
- **Setup**: PR modifies files outside `examples/` directory (e.g., root level config files)
- **Expected**: Should handle gracefully (may trigger global validation)
- **Verification**: Check behavior matches expected logic

**Test Case: TC-PR-018 - Changes to Non-Starter Directories**
- **Setup**: PR modifies files in `authoring/` or other non-starter directories
- **Expected**: Should not trigger starter validation unless global files changed
- **Verification**: Verify change detection logic

**Test Case: TC-PR-019 - File Deletion in Starter**
- **Setup**: PR deletes files from a starter directory
- **Expected**: ✅ Starter should still be detected and validated
- **Verification**: Change detection works for deletions

**Test Case: TC-PR-020 - File Rename in Starter**
- **Setup**: PR renames files within a starter directory
- **Expected**: ✅ Starter should be detected and validated
- **Verification**: Change detection works for renames

#### 1.4 Dependency Installation Edge Cases

**Test Case: TC-PR-021 - Missing package.json**
- **Setup**: Starter directory exists but package.json is missing
- **Expected**: ❌ Installation step should fail gracefully
- **Verification**: Error handling and clear error messages

**Test Case: TC-PR-022 - Corrupted package.json**
- **Setup**: Starter has invalid JSON in package.json
- **Expected**: ❌ Installation step should fail with clear error
- **Verification**: Error handling

**Test Case: TC-PR-023 - npm install Failure**
- **Setup**: Starter has dependency conflicts or network issues
- **Expected**: ❌ Workflow should fail with clear error
- **Verification**: Error propagation

**Test Case: TC-PR-024 - Multiple Starters with Different Node Versions**
- **Setup**: Different starters require different Node versions (if applicable)
- **Expected**: Should use NODE_VERSION from env (22.11.0)
- **Verification**: All starters use correct Node version

#### 1.5 Sitecore File Generation Edge Cases

**Test Case: TC-PR-025 - Missing Sitecore Credentials**
- **Setup**: PR validation runs without Sitecore credentials
- **Expected**: ✅ Should fallback to minimal Sitecore files
- **Verification**: 
  - Check minimal files are created (.sitecore/sites.json, metadata.json, etc.)
  - Verify workflow continues successfully

**Test Case: TC-PR-026 - Sitecore Tools Generation Success**
- **Setup**: PR validation runs with valid Sitecore credentials
- **Expected**: ✅ Sitecore files generated successfully
- **Verification**: Check .sitecore directory contains generated files

**Test Case: TC-PR-027 - Sitecore Tools Generation Failure (Non-Credential)**
- **Setup**: Sitecore tools fail for non-credential reasons
- **Expected**: Should fallback to minimal files
- **Verification**: Fallback mechanism works

**Test Case: TC-PR-028 - Partial Sitecore File Generation**
- **Setup**: Sitecore tools generate some files but not all
- **Expected**: Should handle gracefully (may need fallback)
- **Verification**: Error handling

#### 1.6 Linting and Formatting Edge Cases

**Test Case: TC-PR-029 - Linting Errors**
- **Setup**: PR contains code with linting errors
- **Expected**: ❌ Linting step fails
- **Verification**: 
  - Workflow fails with clear error
  - PR comment shows linting failure

**Test Case: TC-PR-030 - Formatting Errors**
- **Setup**: PR contains code with formatting errors
- **Expected**: ❌ Format check fails
- **Verification**: 
  - Workflow fails with clear error
  - Error message suggests running prettier

**Test Case: TC-PR-031 - Missing Lint Script**
- **Setup**: Starter package.json missing "lint" script
- **Expected**: ❌ Should fail (2>/dev/null may hide error)
- **Verification**: Check error handling

**Test Case: TC-PR-032 - Missing Format:check Script**
- **Setup**: Starter package.json missing "format:check" script
- **Expected**: ❌ Should fail
- **Verification**: Check error handling

**Test Case: TC-PR-033 - Linting Passes but Formatting Fails**
- **Setup**: Code passes lint but fails format check
- **Expected**: ❌ Workflow fails at format check step
- **Verification**: Proper error reporting

#### 1.7 Type Checking Edge Cases

**Test Case: TC-PR-034 - TypeScript Errors**
- **Setup**: PR contains TypeScript type errors
- **Expected**: ❌ Type check fails
- **Verification**: 
  - Workflow fails with clear error
  - PR comment shows type check failure

**Test Case: TC-PR-035 - Missing Type-Check Script**
- **Setup**: Starter package.json missing "type-check" script
- **Expected**: ❌ Should fail (2>/dev/null may hide error)
- **Verification**: Check error handling

**Test Case: TC-PR-036 - Type Check Passes After Sitecore File Generation**
- **Setup**: Type check requires generated Sitecore files
- **Expected**: ✅ Type check should pass (files generated in previous step)
- **Verification**: Correct step ordering

#### 1.8 Build Edge Cases

**Test Case: TC-PR-037 - Build Failure**
- **Setup**: PR contains code that fails to build
- **Expected**: ❌ Build step fails
- **Verification**: 
  - Workflow fails with clear error
  - PR comment shows build failure

**Test Case: TC-PR-038 - Missing Build Script**
- **Setup**: Starter package.json missing "build" script
- **Expected**: ❌ Build step fails
- **Verification**: Error handling

**Test Case: TC-PR-039 - Build Success but Warnings**
- **Setup**: Build succeeds but with warnings
- **Expected**: ✅ Build step passes (warnings don't fail build)
- **Verification**: Warnings don't cause failure

**Test Case: TC-PR-040 - Missing Environment Variables**
- **Setup**: Build requires Sitecore env vars but they're missing
- **Expected**: ❌ Build may fail or succeed depending on build logic
- **Verification**: Check behavior with missing secrets

**Test Case: TC-PR-041 - Partial Environment Variables**
- **Setup**: Some Sitecore env vars present, some missing
- **Expected**: Build behavior depends on which vars are missing
- **Verification**: Check build behavior

#### 1.9 Test Execution Edge Cases

**Test Case: TC-PR-042 - Test Failures**
- **Setup**: PR contains code that causes tests to fail
- **Expected**: ❌ Test step fails
- **Verification**: 
  - Workflow fails with clear error
  - PR comment shows test failure

**Test Case: TC-PR-043 - Missing Test Script**
- **Setup**: Starter package.json missing "test" script
- **Expected**: ❌ Test step fails with "tests are mandatory" error
- **Verification**: 
  - Error message indicates tests are mandatory
  - Workflow fails

**Test Case: TC-PR-044 - Empty Test Suite**
- **Setup**: Starter has test script but no tests
- **Expected**: ✅ Tests pass (empty suite passes)
- **Verification**: Empty test suite doesn't fail

**Test Case: TC-PR-045 - Test Timeout**
- **Setup**: Tests take too long to run
- **Expected**: ❌ Tests fail due to timeout
- **Verification**: Timeout handling

**Test Case: TC-PR-046 - Flaky Tests**
- **Setup**: Tests that sometimes pass, sometimes fail
- **Expected**: May pass or fail depending on run
- **Verification**: Consider test stability

#### 1.10 PR Comment Edge Cases

**Test Case: TC-PR-047 - PR Comment Creation**
- **Setup**: First validation run on a PR
- **Expected**: ✅ New comment is created
- **Verification**: 
  - Comment contains validation results
  - Comment has correct format

**Test Case: TC-PR-048 - PR Comment Update**
- **Setup**: Second validation run on same PR
- **Expected**: ✅ Existing comment is updated (not new comment created)
- **Verification**: 
  - Only one comment exists
  - Comment content is updated

**Test Case: TC-PR-049 - PR Comment Permission Error (Fork)**
- **Setup**: PR from a fork with limited permissions
- **Expected**: ✅ Workflow continues, logs warning about comment
- **Verification**: 
  - Workflow doesn't fail
  - Warning logged about comment permissions
  - Validation still runs

**Test Case: TC-PR-050 - PR Comment with All Checks Passing**
- **Setup**: All validation checks pass
- **Expected**: ✅ Comment shows success status
- **Verification**: Comment format and content

**Test Case: TC-PR-051 - PR Comment with Multiple Failures**
- **Setup**: Multiple validation checks fail
- **Expected**: ✅ Comment shows all failures
- **Verification**: All failures are reported

**Test Case: TC-PR-052 - PR Comment Update After Fix**
- **Setup**: PR fails validation, then fixes are pushed
- **Expected**: ✅ Comment updates to show success
- **Verification**: Comment is updated correctly

### 2. DMZ Validation Workflow (`dmz-validation.yml`) Edge Cases

#### 2.1 Basic Validation Edge Cases

**Test Case: TC-DMZ-001 - Successful DMZ Validation**
- **Setup**: Valid code pushed to dmz branch
- **Expected**: ✅ All validation steps pass
- **Verification**: 
  - Success notification created
  - All starters validated

**Test Case: TC-DMZ-002 - DMZ Validation Failure**
- **Setup**: Invalid code pushed to dmz (e.g., linting errors)
- **Expected**: ❌ Validation fails
- **Verification**: 
  - Failure notification created
  - Error details in step summary

**Test Case: TC-DMZ-003 - DMZ Validation After Squash Merge**
- **Setup**: PR is squash merged to dmz
- **Expected**: ✅ DMZ validation triggers automatically
- **Verification**: Workflow runs on push to dmz

**Test Case: TC-DMZ-004 - DMZ Validation on Direct Push**
- **Setup**: Code pushed directly to dmz (bypassing PR)
- **Expected**: ✅ DMZ validation still runs
- **Verification**: Workflow triggers on any push to dmz

#### 2.2 Dependency Installation Edge Cases

**Test Case: TC-DMZ-005 - All Starters Present**
- **Setup**: All 4 starters exist in examples/
- **Expected**: ✅ All starters have dependencies installed
- **Verification**: Check installation logs

**Test Case: TC-DMZ-006 - Missing Starter Directory**
- **Setup**: One starter directory is missing
- **Expected**: ✅ Workflow continues, skips missing starter
- **Verification**: Only existing starters are processed

**Test Case: TC-DMZ-007 - npm install Failure**
- **Setup**: Dependency installation fails for one starter
- **Expected**: ❌ Workflow fails
- **Verification**: Error propagation

#### 2.3 Sitecore File Generation Edge Cases

**Test Case: TC-DMZ-008 - Sitecore File Generation for All Starters**
- **Setup**: All starters need Sitecore files generated
- **Expected**: ✅ All starters get files generated (or minimal fallback)
- **Verification**: Check .sitecore directories

**Test Case: TC-DMZ-009 - Partial Sitecore File Generation Failure**
- **Setup**: Sitecore generation fails for one starter
- **Expected**: Should fallback to minimal files for that starter
- **Verification**: Fallback mechanism works

#### 2.4 Linting and Formatting Edge Cases

**Test Case: TC-DMZ-010 - Linting Failure**
- **Setup**: Code in dmz has linting errors
- **Expected**: ❌ Workflow fails at lint step
- **Verification**: 
  - `set -e` causes immediate exit
  - Error logged with `::error::`

**Test Case: TC-DMZ-011 - Formatting Failure**
- **Setup**: Code in dmz has formatting errors
- **Expected**: ❌ Workflow fails at format check step
- **Verification**: Error logged with `::error::`

**Test Case: TC-DMZ-012 - Linting Passes, Formatting Fails**
- **Setup**: Code passes lint but fails format
- **Expected**: ❌ Workflow fails at format check
- **Verification**: Proper step ordering

#### 2.5 Type Checking Edge Cases

**Test Case: TC-DMZ-013 - Type Check Failure**
- **Setup**: Code in dmz has type errors
- **Expected**: ❌ Workflow fails at type check step
- **Verification**: Error propagation

**Test Case: TC-DMZ-014 - Type Check with 2>/dev/null**
- **Setup**: Type check step uses `2>/dev/null` which may hide errors
- **Expected**: Should still fail if type check fails
- **Verification**: Error detection works despite stderr redirection

#### 2.6 Build Edge Cases

**Test Case: TC-DMZ-015 - Build Failure**
- **Setup**: Code in dmz fails to build
- **Expected**: ❌ Workflow fails at build step
- **Verification**: 
  - `set -e` causes immediate exit
  - Error logged with `::error::`

**Test Case: TC-DMZ-016 - Build Success for All Starters**
- **Setup**: All starters build successfully
- **Expected**: ✅ Build step passes
- **Verification**: All starters built

**Test Case: TC-DMZ-017 - Partial Build Failure**
- **Setup**: One starter fails to build
- **Expected**: ❌ Workflow fails
- **Verification**: Error propagation

**Test Case: TC-DMZ-018 - Build with Missing Environment Variables**
- **Setup**: Build runs without required env vars
- **Expected**: May fail or succeed depending on build logic
- **Verification**: Check behavior

#### 2.7 Test Execution Edge Cases

**Test Case: TC-DMZ-019 - Test Failure**
- **Setup**: Tests fail in dmz branch
- **Expected**: ❌ Workflow fails at test step
- **Verification**: 
  - `set -e` causes immediate exit
  - Error logged with `::error::`

**Test Case: TC-DMZ-020 - Missing Test Script**
- **Setup**: Starter missing test script
- **Expected**: ❌ Workflow fails with "tests are mandatory" error
- **Verification**: Error message indicates tests are mandatory

**Test Case: TC-DMZ-021 - All Tests Pass**
- **Setup**: All starters have passing tests
- **Expected**: ✅ Test step passes
- **Verification**: All tests executed

#### 2.8 Notification Edge Cases

**Test Case: TC-DMZ-022 - Success Notification**
- **Setup**: All validation passes
- **Expected**: ✅ Success notification created in step summary
- **Verification**: 
  - Step summary contains success message
  - Next steps are provided

**Test Case: TC-DMZ-023 - Failure Notification**
- **Setup**: Validation fails
- **Expected**: ✅ Failure notification job runs
- **Verification**: 
  - Failure notification in step summary
  - Next steps provided

**Test Case: TC-DMZ-024 - Failure Notification Job Dependency**
- **Setup**: Validation fails
- **Expected**: ✅ `notify-failure` job runs only if `validate-dmz` fails
- **Verification**: Job dependency works correctly

### 3. Integration Edge Cases

#### 3.1 Workflow Interaction Edge Cases

**Test Case: TC-INT-001 - PR Merged While Validation Running**
- **Setup**: PR validation running, PR gets merged
- **Expected**: Should handle gracefully
- **Verification**: No race conditions

**Test Case: TC-INT-002 - Multiple PRs Merged Sequentially**
- **Setup**: Multiple PRs merged to dmz one after another
- **Expected**: ✅ Each merge triggers DMZ validation
- **Verification**: All validations run

**Test Case: TC-INT-003 - PR Validation Passes, DMZ Validation Fails**
- **Setup**: PR validation passes, but DMZ validation fails after merge
- **Expected**: ❌ DMZ validation fails (safety net catches issue)
- **Verification**: DMZ validation catches the issue

**Test Case: TC-INT-004 - Rapid Sequential PR Merges**
- **Setup**: Multiple PRs merged quickly to dmz
- **Expected**: ✅ DMZ validation runs for each push
- **Verification**: No skipped validations

#### 3.2 Branch State Edge Cases

**Test Case: TC-INT-005 - DMZ Ahead of Main**
- **Setup**: DMZ has commits not in main
- **Expected**: Normal state, ready for manual merge to main
- **Verification**: DMZ validation should pass if code is valid

**Test Case: TC-INT-006 - DMZ Behind Main**
- **Setup**: Main has commits not in dmz (shouldn't happen normally)
- **Expected**: Should handle gracefully
- **Verification**: Check behavior

**Test Case: TC-INT-007 - DMZ Diverged from Main**
- **Setup**: DMZ and main have diverged
- **Expected**: Should handle gracefully
- **Verification**: Check behavior

#### 3.3 Concurrent Operations Edge Cases

**Test Case: TC-INT-008 - Multiple PRs Open Simultaneously**
- **Setup**: Multiple PRs targeting dmz at the same time
- **Expected**: ✅ Each PR validation runs independently
- **Verification**: No interference between PR validations

**Test Case: TC-INT-009 - PR Updated While Validation Running**
- **Setup**: New commits pushed to PR while validation is running
- **Expected**: ✅ New validation run starts
- **Verification**: Previous run may be cancelled or both run

**Test Case: TC-INT-010 - DMZ Validation While PR Validation Running**
- **Setup**: PR merged to dmz while another PR validation is running
- **Expected**: ✅ Both workflows run independently
- **Verification**: No conflicts

### 4. Error Handling and Recovery Edge Cases

#### 4.1 Workflow Failure Recovery

**Test Case: TC-ERR-001 - Partial Workflow Failure**
- **Setup**: Workflow fails partway through
- **Expected**: ✅ Failure is reported clearly
- **Verification**: Error messages are helpful

**Test Case: TC-ERR-002 - Network Failure During npm install**
- **Setup**: Network issues during dependency installation
- **Expected**: ❌ Workflow fails with network error
- **Verification**: Error is clear

**Test Case: TC-ERR-003 - GitHub Actions Runner Failure**
- **Setup**: Runner fails mid-execution
- **Expected**: Workflow should be retried or fail gracefully
- **Verification**: Check retry behavior

**Test Case: TC-ERR-004 - Timeout Issues**
- **Setup**: Workflow takes too long
- **Expected**: Should timeout or complete
- **Verification**: Timeout handling

#### 4.2 Data Consistency Edge Cases

**Test Case: TC-ERR-005 - Stale Git References**
- **Setup**: Git references are stale
- **Expected**: ✅ `fetch-depth: 0` and explicit fetches should handle this
- **Verification**: Fresh references are used

**Test Case: TC-ERR-006 - Corrupted Git Repository**
- **Setup**: Git repository state is corrupted
- **Expected**: ❌ Workflow should fail with clear error
- **Verification**: Error handling

### 5. Security and Permissions Edge Cases

#### 5.1 Permission Edge Cases

**Test Case: TC-SEC-001 - PR from Fork with Limited Permissions**
- **Setup**: PR created from a fork
- **Expected**: ✅ Workflow runs but may have limited permissions
- **Verification**: 
  - PR comment may fail (handled gracefully)
  - Validation still runs

**Test Case: TC-SEC-002 - Missing GITHUB_TOKEN**
- **Setup**: GITHUB_TOKEN is missing or invalid
- **Expected**: ❌ Workflow should fail or handle gracefully
- **Verification**: Error handling

**Test Case: TC-SEC-003 - Missing Secrets**
- **Setup**: Required secrets are missing
- **Expected**: Should handle gracefully (may use fallbacks)
- **Verification**: Check fallback behavior

#### 5.2 Branch Protection Edge Cases

**Test Case: TC-SEC-004 - Direct Push to Main (Should Be Blocked)**
- **Setup**: Attempt to push directly to main
- **Expected**: ❌ Should be blocked by branch protection
- **Verification**: Branch protection rules work

**Test Case: TC-SEC-005 - Force Push to DMZ (Should Be Blocked)**
- **Setup**: Attempt to force push to dmz
- **Expected**: ❌ Should be blocked by branch protection
- **Verification**: Branch protection rules work

**Test Case: TC-SEC-006 - PR to Main Instead of DMZ**
- **Setup**: PR created targeting main instead of dmz
- **Expected**: ❌ Should be blocked or PR validation shouldn't run
- **Verification**: Workflow only triggers for dmz PRs

### 6. Performance and Scalability Edge Cases

#### 6.1 Performance Edge Cases

**Test Case: TC-PERF-001 - Large PR with Many Files**
- **Setup**: PR with hundreds of changed files
- **Expected**: ✅ Workflow should complete (may take longer)
- **Verification**: Performance is acceptable

**Test Case: TC-PERF-002 - PR with Large Files**
- **Setup**: PR includes large binary files
- **Expected**: ✅ Workflow should handle (may be slow)
- **Verification**: Performance is acceptable

**Test Case: TC-PERF-003 - Multiple Starters Changed**
- **Setup**: PR changes all 4 starters
- **Expected**: ✅ All starters validated (may take longer)
- **Verification**: Performance is acceptable

**Test Case: TC-PERF-004 - Long-Running Tests**
- **Setup**: Tests take a long time to run
- **Expected**: ✅ Workflow completes (may need timeout adjustment)
- **Verification**: Timeout handling

### 7. Configuration Edge Cases

#### 7.1 Configuration Edge Cases

**Test Case: TC-CFG-001 - Wrong Node Version**
- **Setup**: NODE_VERSION doesn't match xmcloud.build.json
- **Expected**: May cause issues
- **Verification**: Check version compatibility

**Test Case: TC-CFG-002 - Missing Starter in Detection Logic**
- **Setup**: New starter added but not in change detection logic
- **Expected**: ❌ Starter won't be validated
- **Verification**: Detection logic needs update

**Test Case: TC-CFG-003 - Starter Removed from Repository**
- **Setup**: Starter directory removed but still in validation logic
- **Expected**: ✅ Workflow should skip missing starter
- **Verification**: Graceful handling

**Test Case: TC-CFG-004 - Invalid Workflow Syntax**
- **Setup**: Workflow file has syntax errors
- **Expected**: ❌ Workflow won't run
- **Verification**: Syntax validation

## Test Execution Strategy

### Phase 1: Critical Path Testing
1. Execute all TC-PR-001 through TC-PR-010 (Base branch and merge checks)
2. Execute all TC-DMZ-001 through TC-DMZ-010 (Basic DMZ validation)
3. Execute TC-INT-001 through TC-INT-004 (Integration basics)

### Phase 2: Validation Logic Testing
1. Execute all change detection test cases (TC-PR-011 through TC-PR-020)
2. Execute all validation step test cases (TC-PR-021 through TC-PR-046)
3. Execute DMZ validation test cases (TC-DMZ-011 through TC-DMZ-021)

### Phase 3: Edge Case Testing
1. Execute error handling test cases (TC-ERR-001 through TC-ERR-006)
2. Execute security test cases (TC-SEC-001 through TC-SEC-006)
3. Execute performance test cases (TC-PERF-001 through TC-PERF-004)

### Phase 4: Integration Testing
1. Execute integration test cases (TC-INT-005 through TC-INT-010)
2. Execute configuration test cases (TC-CFG-001 through TC-CFG-004)

## Test Data Requirements

### Test Branches Needed
- `test/pr-outdated-main` - Branch based on old main
- `test/pr-latest-main` - Branch based on latest main
- `test/pr-from-dmz` - Branch created from dmz
- `test/pr-conflicts` - Branch with merge conflicts
- `test/pr-single-starter` - Changes to one starter
- `test/pr-multiple-starters` - Changes to multiple starters
- `test/pr-global-changes` - Changes to global files
- `test/pr-linting-errors` - Code with linting errors
- `test/pr-formatting-errors` - Code with formatting errors
- `test/pr-type-errors` - Code with type errors
- `test/pr-build-failure` - Code that fails to build
- `test/pr-test-failure` - Code with failing tests
- `test/pr-missing-scripts` - Starters missing npm scripts

### Test Scenarios Setup
1. Create test branches from appropriate base commits
2. Make specific changes to trigger edge cases
3. Create PRs targeting dmz branch
4. Monitor workflow execution and results
5. Verify expected outcomes

## Success Criteria

### Critical Tests (Must Pass)
- ✅ TC-PR-001: Outdated main detection
- ✅ TC-PR-002: Latest main detection
- ✅ TC-PR-006: Merge conflict detection
- ✅ TC-PR-011: Single starter change detection
- ✅ TC-PR-013: Global change detection
- ✅ TC-PR-029: Linting error detection
- ✅ TC-PR-030: Formatting error detection
- ✅ TC-PR-034: Type check error detection
- ✅ TC-PR-037: Build failure detection
- ✅ TC-PR-042: Test failure detection
- ✅ TC-DMZ-001: Successful DMZ validation
- ✅ TC-DMZ-002: DMZ validation failure
- ✅ TC-SEC-004: Direct push to main blocked

### Important Tests (Should Pass)
- All other test cases should pass or be handled gracefully
- Error messages should be clear and actionable
- Workflows should not crash or hang
- Performance should be acceptable

## Reporting

### Test Results Template
For each test case, document:
1. **Test Case ID**: TC-XXX-XXX
2. **Status**: ✅ Pass / ❌ Fail / ⚠️ Warning / ⏭️ Skipped
3. **Execution Date**: YYYY-MM-DD
4. **Execution Time**: HH:MM:SS
5. **Actual Result**: Description of what happened
6. **Expected Result**: Description of what should happen
7. **Notes**: Any observations or issues
8. **Screenshots/Logs**: Links to workflow runs or screenshots

### Test Report Structure
1. Executive Summary
2. Test Execution Summary
3. Critical Test Results
4. Edge Case Test Results
5. Issues Found
6. Recommendations
7. Appendix (Detailed logs)

## Maintenance

### Regular Testing Schedule
- **Weekly**: Run critical path tests (Phase 1)
- **Monthly**: Run full test suite (All phases)
- **After Workflow Changes**: Run affected test cases immediately
- **Before Releases**: Run full test suite

### Test Case Updates
- Add new test cases when new edge cases are discovered
- Update test cases when workflow logic changes
- Remove obsolete test cases when features are removed

## Notes

- Some test cases may require manual setup (e.g., creating specific branch states)
- Some test cases may require coordination with GitHub Actions environment
- Some test cases may need to be run in specific order
- Consider using GitHub Actions workflow_dispatch for manual testing
- Consider creating a test workflow that runs a subset of these tests automatically


