"use client";
import React, { createContext, useContext } from "react";
const Ctx = createContext({ flags: {} as Record<string, boolean> });
export function FlagsProvider({ children }: { children: React.ReactNode }) { return React.createElement(React.Fragment, null, children); }
export function useFlags() { return useContext(Ctx); }