Option Explicit
Dim fso, ws, scriptPath, repoRoot, desktopPath, linkPath, targetPath, link
Set fso = CreateObject("Scripting.FileSystemObject")
Set ws = CreateObject("WScript.Shell")

' Determine repo root based on this script's location (tools/ -> repo root)
scriptPath = WScript.ScriptFullName
repoRoot = fso.GetParentFolderName(fso.GetParentFolderName(scriptPath))

desktopPath = ws.SpecialFolders("Desktop")
linkPath = desktopPath & "\" & "Launch Ship.lnk"
targetPath = repoRoot & "\launch-ship.cmd"

On Error Resume Next
Set link = ws.CreateShortcut(linkPath)
link.TargetPath = targetPath
link.WorkingDirectory = repoRoot
link.WindowStyle = 1
link.IconLocation = "" ' use default
link.Description = "Launch corAe Ship (dev)"
link.Save

If Err.Number <> 0 Then
  WScript.Echo "Failed to create shortcut: " & Err.Description
Else
  WScript.Echo "Shortcut created on Desktop: " & linkPath
End If
