param(
  [string]$ProjectRoot = "C:\\corAe\\corAe-Studio"
)

Set-Location $ProjectRoot
node .\scripts\nightly-build.mts
