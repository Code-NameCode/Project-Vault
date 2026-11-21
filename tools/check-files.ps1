$json = Get-Content 'data/projects.json' -Raw | ConvertFrom-Json
$bad = 0
foreach ($p in $json.projects) {
  foreach ($f in $p.files) {
    if ($f -match ' \(.*\)$') { continue }
    if (-not (Test-Path (Join-Path $p.folder $f))) { Write-Host ('MISSING FILE: ' + $p.folder + '/' + $f); $bad++ }
  }
  if (-not (Test-Path (Join-Path $p.folder $p.entry))) { Write-Host ('MISSING ENTRY: ' + $p.folder + '/' + $p.entry); $bad++ }
  if ($p.cover -and -not (Test-Path $p.cover)) { Write-Host ('MISSING COVER: ' + $p.cover); $bad++ }
}
Write-Output ('projects: ' + $json.projects.Count)
Write-Output ('covers: ' + ($json.projects | Where-Object { $_.cover }).Count)
Write-Output ('private: ' + ($json.projects | Where-Object { $_.private }).Count)
Write-Output ('TOTAL MISSING: ' + $bad)
