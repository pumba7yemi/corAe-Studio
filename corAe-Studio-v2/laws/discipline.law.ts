/**
 * ────────────────────────────────────────────────────────────────
 * corAe Constitutional Law — Discipline Law
 * ────────────────────────────────────────────────────────────────
 * 
 * Purpose:
 *   To eliminate chaos born from uncontrolled human input.
 *   No Workflow Partner™, developer, or operator shall “just add something.”
 *   Every action must be intentional, traceable, and reversible.
 * 
 * Scope:
 *   Applies to all corAe modules, businesses, and workflows.
 *   This law governs how new files, tasks, and changes are introduced.
 * 
 * Doctrine:
 *   Discipline is the heartbeat of order. Chaos begins where intention ends.
 *   The cost of laziness is always greater than the speed it offers.
 */

export const DISCIPLINE_LAW = {
  id: "L-000-DISCIPLINE",
  title: "The Discipline Law",
  version: "1.0.0",
  enacted: "2025-10-18",
  purpose:
    "To preserve order and prevent workflow entropy by banning unstructured additions and enforcing traceable, deliberate change.",

  principles: {
    "1_no_unauthorised_additions": {
      rule:
        "Nothing enters a live build, workflow, or law without context, reason, and trace. 'Just add it' is prohibited inside corAe.",
      enforcement:
        "All changes must be documented through an OBARI record, PR note, or internal request referencing its parent module."
    },

    "2_every_action_has_a_parent": {
      rule:
        "Every script, file, and process must belong to a defined module, law, or workflow parent.",
      enforcement:
        "Unlinked or orphaned files, scripts, or routes will trigger automated rejection by corAe’s build validator."
    },

    "3_intent_over_speed": {
      rule:
        "Intent takes precedence over pace. No feature is faster than the recovery time from chaos.",
      enforcement:
        "Each module’s WorkFocus routine must confirm intent and parent linkage before accepting a task as valid."
    },

    "4_immutable_baselines": {
      rule:
        "After every confirmed stable state, a snapshot and checksum must be created before any new work begins.",
      enforcement:
        "corAe’s Structure Check will block merges or deployments without an updated baseline reference."
    },

    "5_work_in_baton_logic": {
      rule:
        "Tasks and builds must be passed only when their baton is sealed—no half-done handoffs.",
      enforcement:
        "WorkFocus and OBARI tracking must register a 'Confirmed' status before baton transition."
    }
  },

  statement:
    "In corAe, structure is sacred. Nothing exists outside its flow. Discipline is not restriction; it is freedom from rework."
} as const;