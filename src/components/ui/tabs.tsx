import * as React from "react";
export function Tabs({ children }: any){ return <div>{children}</div>; }
export function TabsList({ children }: any){ return <div className="flex gap-2 mt-2">{children}</div>; }
export function TabsTrigger({ children }: any){ return <button className="px-3 py-1 border rounded">{children}</button>; }
export function TabsContent({ children, className="" }: any){ return <div className={className}>{children}</div>; }