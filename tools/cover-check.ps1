$json = Get-Content 'data/projects.json' -Raw -Encoding UTF8 | ConvertFrom-Json
$bad = 0
foreach ($p in $json.projects) {
  if ($p.cover -and -not (Test-Path -LiteralPath $p.cover)) { Write-Output ('MISSING: ' + $p.folder); $bad++ }
}
Write-Output ('projects: ' + $json.projects.Count)
Write-Output ('private: ' + @($json.projects | Where-Object { $_.private -eq $true }).Count)
Write-Output ('covers missing: ' + $bad)
