param(
  [string]$Source = 'C:\Users\Admin\Desktop\schoolfuture',
  [string]$Destination = 'C:\Users\Admin\Desktop\schoolfuture_github_clean'
)

$ErrorActionPreference = 'Stop'
Write-Host "Preparing clean export from $Source to $Destination"

if (!(Test-Path $Destination)) { New-Item -ItemType Directory -Path $Destination | Out-Null }
Write-Host "Cleaning destination only: $Destination"
Get-ChildItem -LiteralPath $Destination -Force | Remove-Item -Recurse -Force

$dirsToCopy = @('backend','OnePadSchoolAI','parent-app','teacher-app','school-admin-app','docs','scripts')
$filesToCopy = @('README.md','package.json','package-lock.json','pnpm-lock.yaml','yarn.lock','.gitignore','tsconfig.json','tsconfig.base.json')
$excludeDirs = @('.git','node_modules','dist','build','.next','out','coverage','.expo','.expo-shared','android\build','ios\build','.gradle','.turbo','.cache','tmp','temp','logs','uploads','downloaded-models','models','weights','.prisma','backend')
$excludeFiles = @('.env','.env.local','.env.development','.env.production','.env.test','*.log','npm-debug.log*','yarn-debug.log*','yarn-error.log*','pnpm-debug.log*','*.db','*.sqlite','*.sqlite3','*.gguf','*.onnx','*.tflite','*.zip','*.apk','*.aab','*.bak','*.old','*.tmp','*_backup*','*_old*','*.tsbuildinfo','debug.keystore')

$report = New-Object System.Collections.Generic.List[string]

foreach ($d in $dirsToCopy) {
  $s = Join-Path $Source $d
  if (Test-Path $s) {
    $t = Join-Path $Destination $d
    $args = @($s,$t,'/S','/NFL','/NDL','/NJH','/NJS','/NP')
    foreach ($xd in $excludeDirs) { $args += @('/XD',$xd) }
    foreach ($xf in $excludeFiles) { $args += @('/XF',$xf) }
    & robocopy @args | Out-Null
    $report.Add("Copied dir: $d")
  }
}

foreach ($f in $filesToCopy) {
  $s = Join-Path $Source $f
  if (Test-Path $s) {
    Copy-Item -LiteralPath $s -Destination (Join-Path $Destination $f) -Force
    $report.Add("Copied file: $f")
  }
}

$legacy = Join-Path $Destination 'OnePadSchoolAI\\backend'
if (Test-Path $legacy) {
  Remove-Item -LiteralPath $legacy -Recurse -Force
  $report.Add('Removed destination legacy backend: OnePadSchoolAI/backend')
}

# Prune empty directories after copy to keep repo lean
Get-ChildItem -LiteralPath $Destination -Recurse -Directory -Force |
  Sort-Object FullName -Descending |
  ForEach-Object {
    if ($_.Name -eq '.git') { return }
    $children = Get-ChildItem -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    if ($null -eq $children -or $children.Count -eq 0) {
      Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
  }

Write-Host 'Clean export completed. Validation checks are recommended before git add.'
