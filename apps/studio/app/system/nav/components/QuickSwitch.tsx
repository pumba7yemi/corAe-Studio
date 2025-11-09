"use client";

/**
 * corAe QuickSwitch™
 * ------------------------------------------------------
 * Lets you jump between:
 *   - new Business Pages view
 *   - your original Classic Business dashboard
 *
 * Uses ROUTES map so nothing else changes.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";
import { ROUTES } from "@/app/system/nav/routes";

export default function QuickSwitch() {
  // QuickSwitch intentionally disabled — navigation is provided via the
  // overflow (three-dot) menu across top and side navigation surfaces.
  return null;
}