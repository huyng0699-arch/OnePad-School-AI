Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$ProjectPath = 'C:\Users\Admin\Desktop\OnePadSchoolAI'
if (-not (Test-Path $ProjectPath)) {
  $ProjectPath = 'C:\Users\Admin\Desktop\schoolfuture\OnePadSchoolAI'
}

$env:JAVA_HOME = 'C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME = 'C:\Users\Admin\AppData\Local\Android\Sdk'
$env:ANDROID_SDK_ROOT = 'C:\Users\Admin\AppData\Local\Android\Sdk'
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

$form = New-Object System.Windows.Forms.Form
$form.Text = 'OnePad School AI — Android Student Demo'
$form.Size = New-Object System.Drawing.Size(980, 680)
$form.StartPosition = 'CenterScreen'
$form.BackColor = [System.Drawing.Color]::FromArgb(10,18,24)
$form.FormBorderStyle = 'FixedSingle'
$form.MaximizeBox = $false

$header = New-Object System.Windows.Forms.Panel
$header.Dock = 'Top'
$header.Height = 130
$header.BackColor = [System.Drawing.Color]::FromArgb(18,40,46)
$header.Add_Paint({
    param($sender, $e)
    $g = $e.Graphics
    $g.SmoothingMode = 'HighQuality'

    $rect = New-Object System.Drawing.Rectangle(0,0,$sender.Width,$sender.Height)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect,[System.Drawing.Color]::FromArgb(19,31,68),[System.Drawing.Color]::FromArgb(18,95,74),45)
    $g.FillRectangle($brush,$rect)

    $bodyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(162,221,79))
    $eyeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(20,30,20))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(162,221,79),4)

    $g.FillEllipse($bodyBrush,35,25,50,45)
    $g.FillRectangle($bodyBrush,30,65,60,35)
    $g.DrawLine($pen,43,25,35,14)
    $g.DrawLine($pen,77,25,85,14)
    $g.FillEllipse($eyeBrush,50,42,6,6)
    $g.FillEllipse($eyeBrush,64,42,6,6)

    $titleFont = New-Object System.Drawing.Font('Segoe UI',18,[System.Drawing.FontStyle]::Bold)
    $subFont = New-Object System.Drawing.Font('Segoe UI',10)
    $titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $subBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(209,240,227))

    $g.DrawString('OnePad School AI — Android Student Demo',$titleFont,$titleBrush,120,35)
    $g.DrawString('USB debug one-click launcher for student demo build',$subFont,$subBrush,122,75)
})
$form.Controls.Add($header)

$statusPanel = New-Object System.Windows.Forms.Panel
$statusPanel.Location = New-Object System.Drawing.Point(20,145)
$statusPanel.Size = New-Object System.Drawing.Size(300,460)
$statusPanel.BackColor = [System.Drawing.Color]::FromArgb(20,33,40)
$form.Controls.Add($statusPanel)

$logBox = New-Object System.Windows.Forms.TextBox
$logBox.Location = New-Object System.Drawing.Point(335,145)
$logBox.Size = New-Object System.Drawing.Size(625,460)
$logBox.Multiline = $true
$logBox.ScrollBars = 'Vertical'
$logBox.ReadOnly = $true
$logBox.Font = New-Object System.Drawing.Font('Consolas',10)
$logBox.BackColor = [System.Drawing.Color]::FromArgb(7,17,22)
$logBox.ForeColor = [System.Drawing.Color]::FromArgb(210,240,240)
$form.Controls.Add($logBox)

$startBtn = New-Object System.Windows.Forms.Button
$startBtn.Text = 'Start Android Demo'
$startBtn.Location = New-Object System.Drawing.Point(20,615)
$startBtn.Size = New-Object System.Drawing.Size(220,34)
$startBtn.BackColor = [System.Drawing.Color]::FromArgb(37,117,252)
$startBtn.ForeColor = 'White'
$startBtn.FlatStyle = 'Flat'
$form.Controls.Add($startBtn)

$steps = @(
  'Checking Java',
  'Checking Android device',
  'Installing debug build',
  'Starting Metro',
  'Connecting adb reverse',
  'Launching app'
)

$labels = @{}
$y = 16
foreach ($step in $steps) {
  $lbl = New-Object System.Windows.Forms.Label
  $lbl.Text = "• $step"
  $lbl.ForeColor = [System.Drawing.Color]::FromArgb(180,196,209)
  $lbl.Font = New-Object System.Drawing.Font('Segoe UI',10)
  $lbl.Location = New-Object System.Drawing.Point(12,$y)
  $lbl.AutoSize = $true
  $statusPanel.Controls.Add($lbl)
  $labels[$step] = $lbl
  $y += 36
}

function Write-Log([string]$text) {
  $timestamp = (Get-Date).ToString('HH:mm:ss')
  $logBox.AppendText("[$timestamp] $text`r`n")
  $logBox.SelectionStart = $logBox.TextLength
  $logBox.ScrollToCaret()
  [System.Windows.Forms.Application]::DoEvents()
}

function Set-Step([string]$step,[string]$state) {
  $lbl = $labels[$step]
  if (-not $lbl) { return }
  switch ($state) {
    'running' { $lbl.ForeColor = [System.Drawing.Color]::FromArgb(253,224,71); $lbl.Text = "⏳ $step" }
    'ok'      { $lbl.ForeColor = [System.Drawing.Color]::FromArgb(134,239,172); $lbl.Text = "✅ $step" }
    'fail'    { $lbl.ForeColor = [System.Drawing.Color]::FromArgb(252,165,165); $lbl.Text = "❌ $step" }
    default   { $lbl.ForeColor = [System.Drawing.Color]::FromArgb(180,196,209); $lbl.Text = "• $step" }
  }
  [System.Windows.Forms.Application]::DoEvents()
}

function Run-Cmd([string]$command, [string]$workingDir) {
  Write-Log "Running: $command"
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'cmd.exe'
  $psi.Arguments = "/c $command"
  $psi.WorkingDirectory = $workingDir
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $psi.CreateNoWindow = $true
  $proc = [System.Diagnostics.Process]::Start($psi)
  $out = $proc.StandardOutput.ReadToEnd()
  $err = $proc.StandardError.ReadToEnd()
  $proc.WaitForExit()
  if ($out) { $out.TrimEnd() -split "`r?`n" | ForEach-Object { Write-Log $_ } }
  if ($err) { $err.TrimEnd() -split "`r?`n" | ForEach-Object { Write-Log $_ } }
  return [pscustomobject]@{ ExitCode = $proc.ExitCode; Output = ($out + "`n" + $err) }
}

function Fail-Step([string]$step,[string]$message) {
  Set-Step $step 'fail'
  Write-Log "ERROR: $message"
  [System.Windows.Forms.MessageBox]::Show($message,'Demo Start Failed',[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Error) | Out-Null
}

$startBtn.Add_Click({
  $startBtn.Enabled = $false
  foreach ($s in $steps) { Set-Step $s 'pending' }

  if (-not (Test-Path $ProjectPath)) {
    Fail-Step 'Checking Java' "Project path not found: $ProjectPath"
    $startBtn.Enabled = $true
    return
  }

  Write-Log "Project: $ProjectPath"
  Set-Step 'Checking Java' 'running'
  $java = Run-Cmd 'java -version' $ProjectPath
  if ($java.ExitCode -ne 0) {
    Fail-Step 'Checking Java' 'Java check failed. Verify JAVA_HOME and Android Studio JBR path.'
    $startBtn.Enabled = $true
    return
  }
  Set-Step 'Checking Java' 'ok'

  Set-Step 'Checking Android device' 'running'
  $adb = Run-Cmd 'adb devices' $ProjectPath
  if ($adb.ExitCode -ne 0) {
    Fail-Step 'Checking Android device' 'adb command failed. Check Android SDK platform-tools.'
    $startBtn.Enabled = $true
    return
  }

  if ($adb.Output -match 'unauthorized') {
    Fail-Step 'Checking Android device' 'Unlock your phone and tap Allow USB debugging.'
    $startBtn.Enabled = $true
    return
  }

  $deviceLines = ($adb.Output -split "`r?`n") | Where-Object { $_ -match "`tdevice$" }
  if (-not $deviceLines -or $deviceLines.Count -lt 1) {
    Fail-Step 'Checking Android device' 'No Android device detected. Check USB cable, USB debugging, and driver.'
    $startBtn.Enabled = $true
    return
  }
  Set-Step 'Checking Android device' 'ok'

  Set-Step 'Installing debug build' 'running'
  $gradleDir = Join-Path $ProjectPath 'android'
  $build = Run-Cmd 'gradlew.bat app:installDebug -PreactNativeArchitectures=arm64-v8a -PreactNativeDevServerPort=8081' $gradleDir
  if ($build.ExitCode -ne 0) {
    Fail-Step 'Installing debug build' 'Debug build/install failed.'
    $startBtn.Enabled = $true
    return
  }
  Set-Step 'Installing debug build' 'ok'

  Set-Step 'Starting Metro' 'running'
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', "cd /d `"$ProjectPath`" && npx.cmd expo start --dev-client" -WindowStyle Normal
  Start-Sleep -Seconds 2
  Set-Step 'Starting Metro' 'ok'

  Set-Step 'Connecting adb reverse' 'running'
  $reverse = Run-Cmd 'adb reverse tcp:8081 tcp:8081' $ProjectPath
  if ($reverse.ExitCode -ne 0) {
    Fail-Step 'Connecting adb reverse' 'adb reverse failed.'
    $startBtn.Enabled = $true
    return
  }
  Set-Step 'Connecting adb reverse' 'ok'

  Set-Step 'Launching app' 'running'
  $launch = Run-Cmd 'adb shell monkey -p com.anonymous.onepadschoolsai 1' $ProjectPath
  if ($launch.ExitCode -ne 0) {
    Fail-Step 'Launching app' 'Could not launch app package com.anonymous.onepadschoolsai.'
    $startBtn.Enabled = $true
    return
  }
  Set-Step 'Launching app' 'ok'

  Write-Log 'Android demo startup completed successfully.'
  Write-Log 'Next in app: Open Student Hub → AI & App Settings → Local AI → Gemma 4 E2B → Download / Load → Run Local Test Prompt'
  [System.Windows.Forms.MessageBox]::Show('Demo started successfully. Keep this window open for logs.`n`nNext in app: Open Student Hub → AI & App Settings → Local AI → Gemma 4 E2B → Download / Load → Run Local Test Prompt','OnePad Demo Ready',[System.Windows.Forms.MessageBoxButtons]::OK,[System.Windows.Forms.MessageBoxIcon]::Information) | Out-Null
  $startBtn.Enabled = $true
})

[void]$form.ShowDialog()
