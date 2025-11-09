Param([switch]$FailOnLint = $false)
$ErrorActionPreference = "Stop"
function Step($n,$c){Write-Host "▶ $n"; & cmd /c $c; if($LASTEXITCODE -ne 0){throw "$n failed"}; Write-Host "✓ $n"}

# Ensure navigation shim exists
$shim="apps/studio/src/types/next-navigation-augment.d.ts"
if(!(Test-Path $shim)){
    New-Item -ItemType Directory -Force -Path (Split-Path $shim) | Out-Null
@"declare module 'next/navigation' {
 export * from 'next/dist/client/components/navigation';
 export interface Router { push(h:string):void;replace(h:string):void;back():void;refresh?():void; }
 export function useRouter():Router;
 export function usePathname():string|null;
 export function useSearchParams():URLSearchParams;
 export function redirect(u:string):never;
 export function notFound():never;
}"@ | Out-File -Encoding UTF8 $shim
    Write-Host "Created shim $shim" -ForegroundColor Yellow
}

# Prisma check
Step "Prisma format/generate" "pnpm --filter @corae/studio prisma:format && pnpm --filter @corae/studio prisma:generate"
# Typecheck
Step "TypeScript check" "pnpm -w exec -- tsc -b --noEmit"
# Lint
Write-Host "▶ ESLint (non-blocking)"
& cmd /c "pnpm --filter @corae/studio lint"
if($FailOnLint -and $LASTEXITCODE -ne 0){exit 3}
# Build
Step "Next build (Studio)" "pnpm --filter @corae/studio build"
Write-Host "✅ Nightly Green-Sweep OK" -ForegroundColor Green
