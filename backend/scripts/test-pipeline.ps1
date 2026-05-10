$BaseUrl = $env:ONEPAD_BACKEND_URL
if (-not $BaseUrl) { $BaseUrl = "http://localhost:3000" }

function Show-Step($Text) {
  Write-Host ""
  Write-Host "=== $Text ===" -ForegroundColor Cyan
}

function Invoke-JsonPost($Path, $Body) {
  $json = $Body | ConvertTo-Json -Depth 20
  Invoke-RestMethod -Method Post -Uri "$BaseUrl$Path" -ContentType "application/json" -Body $json
}

$deviceId = "script_device_001"
$sessionId = "script_session_001"
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Show-Step "Health"
Invoke-RestMethod "$BaseUrl/health" | ConvertTo-Json -Depth 20

Show-Step "POST local_ai_used"
Invoke-JsonPost "/v1/student/events/batch" @{
  deviceId = $deviceId
  sessionId = $sessionId
  events = @(
    @{
      id = "evt_script_local_ai_$now"
      studentId = "stu_001"
      deviceId = $deviceId
      sessionId = $sessionId
      type = "local_ai_used"
      source = "local_ai"
      safeSummary = "Student used local AI to explain a biology lesson."
      metadata = @{
        modelId = "gemma-4-e2b-it"
        quantization = "int4"
        action = "explain"
        status = "success"
        latencyMs = 3200
      }
      privacyLevel = "normal"
      createdAt = (Get-Date).ToUniversalTime().ToString("o")
    }
  )
} | ConvertTo-Json -Depth 20

Show-Step "POST quiz_completed"
Invoke-JsonPost "/v1/student/events/batch" @{
  deviceId = $deviceId
  sessionId = $sessionId
  events = @(
    @{
      id = "evt_script_quiz_$now"
      studentId = "stu_001"
      deviceId = $deviceId
      sessionId = $sessionId
      type = "quiz_completed"
      source = "quiz"
      severity = "medium"
      lessonId = "lesson_cell_001"
      quizId = "quiz_cell_001"
      safeSummary = "Student completed a biology quiz and needs review on cell functions."
      metadata = @{
        score = 5
        total = 10
        accuracy = 0.5
        repeatedMistakes = @("cell function", "organelle role")
      }
      privacyLevel = "normal"
      createdAt = (Get-Date).ToUniversalTime().ToString("o")
    }
  )
} | ConvertTo-Json -Depth 20

Show-Step "POST support_requested"
Invoke-JsonPost "/v1/student/events/batch" @{
  deviceId = $deviceId
  sessionId = $sessionId
  events = @(
    @{
      id = "evt_script_support_$now"
      studentId = "stu_001"
      deviceId = $deviceId
      sessionId = $sessionId
      type = "support_requested"
      source = "support"
      severity = "low"
      safeSummary = "Student requested teacher help with the current lesson."
      metadata = @{ reason = "lesson_help" }
      privacyLevel = "sensitive"
      createdAt = (Get-Date).ToUniversalTime().ToString("o")
    }
  )
} | ConvertTo-Json -Depth 20

Show-Step "Teacher dashboard"
Invoke-RestMethod "$BaseUrl/v1/teacher/classes/class_8a/dashboard" | ConvertTo-Json -Depth 20

Show-Step "Teacher student report"
Invoke-RestMethod "$BaseUrl/v1/teacher/students/stu_001/report" | ConvertTo-Json -Depth 20

Show-Step "Parent report"
Invoke-RestMethod "$BaseUrl/v1/parent/children/stu_001/report" | ConvertTo-Json -Depth 20

Show-Step "Admin overview"
Invoke-RestMethod "$BaseUrl/v1/admin/schools/school_001/overview" | ConvertTo-Json -Depth 20

Show-Step "Admin AI usage"
Invoke-RestMethod "$BaseUrl/v1/admin/ai-usage" | ConvertTo-Json -Depth 20

Show-Step "Database stats"
Invoke-RestMethod "$BaseUrl/v1/admin/db-stats" | ConvertTo-Json -Depth 20

Write-Host ""
Write-Host "Pipeline test complete." -ForegroundColor Green
