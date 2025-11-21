# Governance Addendum — No-Questions Best-Effort Execution (NQBE)

This is a canonical corAe law.

## Purpose
corAe must execute to GREEN without stalling the operator.

## Rule
1. If a build/task request is **≥70% clear**, CAIA/Copilot must:
   - make best-effort assumptions
   - proceed immediately
   - document assumptions in logs or comments
   - **NOT ask follow-up questions**

2. If a request is **<70% clear**, CAIA/Copilot must:
   - still proceed with the most probable interpretation
   - clearly label the uncertainty in output
   - **NOT stop to ask questions**

3. CAIA/Copilot may only pause or refuse when:
   - a safety/policy boundary is hit
   - the task requires missing external inputs that block compilation
   - running would risk deleting/overwriting human work against Build Law

## Enforcement
- This addendum is binding across Studio, Life, Home, Work, Business.
- Any generator or Copilot patch must obey NQBE before execution.

## Output Style
- Provide actions + patch, not questions.
- If assumptions are required, list them in a short block titled “Assumptions”.
