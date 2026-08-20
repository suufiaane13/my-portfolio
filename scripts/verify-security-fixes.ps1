# ============================================================
# Script de verification des corrections de securite
# Usage: powershell -ExecutionPolicy Bypass -File scripts\verify-security-fixes.ps1
# ============================================================

$SUPABASE_URL = 'https://fghwrlswydqridkbkwxd.supabase.co'
$ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnaHdybHN3eWRxcmlka2Jrd3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDI5NzYsImV4cCI6MjA5Njc3ODk3Nn0.CUXtcXVqN0DPMsSBzyqI7W-i4-Ux_kwnQZSd7h5p5rg'
$FUNCTIONS_URL = "$SUPABASE_URL/functions/v1"
$REST_URL = "$SUPABASE_URL/rest/v1"

$headers = @{
    'Content-Type' = 'application/json'
    'apikey' = $ANON_KEY
    'Authorization' = "Bearer $ANON_KEY"
}

$script:pass = 0
$script:fail = 0

function Test-Result {
    param([string]$name, [bool]$condition, [string]$detail)
    if ($condition) {
        Write-Host "  [PASS] $name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $name -- $detail" -ForegroundColor Red
        $script:fail++
    }
}

# ============================================================
Write-Host "`n=== 1. XSS dans /contact ===" -ForegroundColor Cyan
# ============================================================

$body = '{"name":"Test","email":"verify@test.com","message":"<img src=x onerror=alert(1)>","locale":"fr"}'

try {
    $resp = Invoke-RestMethod -Uri "$FUNCTIONS_URL/contact" -Method POST -Headers $headers -Body $body -ErrorAction Stop
    Test-Result 'XSS payload accepted (rejected?)' ($resp.success -eq $null -or $resp.error -ne $null) "Got success=$($resp.success)"
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    if ($code -eq 400) {
        Test-Result 'XSS payload rejected' $true "Got 400"
    } else {
        Test-Result 'XSS payload rejected' $false "Got $code"
    }
}

# ============================================================
Write-Host "`n=== 2. Score manipulation dans /submit-score ===" -ForegroundColor Cyan
# ============================================================

# 2a: 9999 moves pour 4x4
$bodyScore = '{"player_name":"TestVerify","grid_size":4,"moves":9999,"seconds":10,"locale":"fr"}'
try {
    $resp = Invoke-RestMethod -Uri "$FUNCTIONS_URL/submit-score" -Method POST -Headers $headers -Body $bodyScore -ErrorAction Stop
    Test-Result '9999 moves rejected' ($resp.success -eq $null) "Got success=$($resp.success)"
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    if ($code -eq 400) {
        Test-Result '9999 moves rejected' $true "Got 400"
    } else {
        Test-Result '9999 moves rejected' $false "Got $code"
    }
}

# 2b: 3 moves pour 4x4 (min = 8)
$bodyLow = '{"player_name":"TestVerify","grid_size":4,"moves":3,"seconds":5,"locale":"fr"}'
try {
    $resp = Invoke-RestMethod -Uri "$FUNCTIONS_URL/submit-score" -Method POST -Headers $headers -Body $bodyLow -ErrorAction Stop
    Test-Result '3 moves for 4x4 rejected' ($resp.success -eq $null) "Got success=$($resp.success)"
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    if ($code -eq 400) {
        Test-Result '3 moves for 4x4 rejected' $true "Got 400"
    } else {
        Test-Result '3 moves for 4x4 rejected' $false "Got $code"
    }
}

# 2c: grid_size=99
$bodyGrid = '{"player_name":"TestVerify","grid_size":99,"moves":10,"seconds":10,"locale":"fr"}'
try {
    $resp = Invoke-RestMethod -Uri "$FUNCTIONS_URL/submit-score" -Method POST -Headers $headers -Body $bodyGrid -ErrorAction Stop
    Test-Result 'Grid 99 rejected' ($resp.success -eq $null) "Got success=$($resp.success)"
} catch {
    $code = [int]$_.Exception.Response.StatusCode
    if ($code -eq 400) {
        Test-Result 'Grid 99 rejected' $true "Got 400"
    } else {
        Test-Result 'Grid 99 rejected' $false "Got $code"
    }
}

# ============================================================
Write-Host "`n=== 3. IP hash masque (memory_scores) ===" -ForegroundColor Cyan
# ============================================================

$url1 = "$REST_URL/memory_scores_public?select=*&limit=1"
try {
    $data = Invoke-RestMethod -Uri $url1 -Method GET -Headers $headers -ErrorAction Stop
    Test-Result 'memory_scores_public accessible' ($data -ne $null) ''
} catch {
    Test-Result 'memory_scores_public accessible' $false "Cannot read view"
}

$url2 = "$REST_URL/memory_scores_public?select=ip_hash&limit=1"
try {
    $data = Invoke-RestMethod -Uri $url2 -Method GET -Headers $headers -ErrorAction Stop
    $hasIpHash = $false
    if ($data -is [array] -and $data.Count -gt 0) {
        $hasIpHash = $data[0].PSObject.Properties.Name -contains 'ip_hash'
    } elseif ($data -ne $null) {
        $hasIpHash = $data.PSObject.Properties.Name -contains 'ip_hash'
    }
    Test-Result 'ip_hash NOT in public view' (-not $hasIpHash) "ip_hash column exposed"
} catch {
    Test-Result 'ip_hash NOT in public view' $true "Column not accessible"
}

$url3 = "$REST_URL/memory_leaderboard?select=ip_hash&limit=1"
try {
    $data = Invoke-RestMethod -Uri $url3 -Method GET -Headers $headers -ErrorAction Stop
    $hasIpHash = $false
    if ($data -is [array] -and $data.Count -gt 0) {
        $hasIpHash = $data[0].PSObject.Properties.Name -contains 'ip_hash'
    } elseif ($data -ne $null) {
        $hasIpHash = $data.PSObject.Properties.Name -contains 'ip_hash'
    }
    Test-Result 'ip_hash NOT in leaderboard' (-not $hasIpHash) "ip_hash column exposed in leaderboard"
} catch {
    Test-Result 'ip_hash NOT in leaderboard' $true "Column not accessible"
}

# ============================================================
Write-Host "`n=== 4. Headers de securite ===" -ForegroundColor Cyan
# ============================================================

try {
    $resp = Invoke-WebRequest -Uri 'https://suufiaane.netlify.app' -Method GET -UseBasicParsing -ErrorAction Stop
    $h = $resp.Headers

    Test-Result 'X-Content-Type-Options' ($h['X-Content-Type-Options'] -eq 'nosniff') "Got: $($h['X-Content-Type-Options'])"
    Test-Result 'X-Frame-Options' ($h['X-Frame-Options'] -eq 'DENY') "Got: $($h['X-Frame-Options'])"

    $xssHeader = $h['X-XSS-Protection']
    Test-Result 'X-XSS-Protection' ($xssHeader -eq '1; mode=block') "Got: $xssHeader"

    Test-Result 'Referrer-Policy' ($h['Referrer-Policy'] -eq 'strict-origin-when-cross-origin') "Got: $($h['Referrer-Policy'])"
    Test-Result 'Cross-Origin-Opener-Policy' ($h['Cross-Origin-Opener-Policy'] -eq 'same-origin') "Got: $($h['Cross-Origin-Opener-Policy'])"
    Test-Result 'Cross-Origin-Resource-Policy' ($h['Cross-Origin-Resource-Policy'] -eq 'same-origin') "Got: $($h['Cross-Origin-Resource-Policy'])"
} catch {
    Write-Host '  [SKIP] Cannot reach site -- deploy Netlify d abord' -ForegroundColor Yellow
}

# ============================================================
Write-Host "`n=== RESULTAT ===" -ForegroundColor Cyan
# ============================================================
Write-Host "  Passes: $($script:pass) | Echecs: $($script:fail)" -ForegroundColor $(if ($script:fail -eq 0) { 'Green' } else { 'Red' })
if ($script:fail -eq 0) {
    Write-Host '  Toutes les verifications sont OK !' -ForegroundColor Green
} else {
    Write-Host '  Certains tests ont echoue -- verifiez les details ci-dessus' -ForegroundColor Yellow
}
