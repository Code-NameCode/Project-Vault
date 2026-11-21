$j = Get-Content 'data/projects.json' -Raw | ConvertFrom-Json
Write-Host ('projects: ' + $j.projects.Count)
Write-Host ('plateSrc projects: ' + ($j.projects | Where-Object { $_.plateSrc }).Count)
Write-Host ('app.js chars: ' + (Get-Content 'assets/app.js' -Raw).Length)
Write-Host ('styles.css chars: ' + (Get-Content 'assets/styles.css' -Raw).Length)
