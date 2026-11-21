$js = Get-Content 'assets/app.js' -Raw
$open = ([regex]::Matches($js, '\{')).Count; $close = ([regex]::Matches($js, '\}')).Count
Write-Output ("braces " + $open + "/" + $close)
# private project should appear ONLY in featurePlate
$lines = Get-Content 'assets/app.js'
foreach ($m in (Select-String -Path 'assets/app.js' -Pattern 'goodstuff-main')) { Write-Output ($m.LineNumber.ToString() + ': ' + $m.Line.Trim()) }
# confirm state.projects untouched count
Select-String -Path 'assets/app.js' -Pattern 'state\.projects' | ForEach-Object { Write-Output ($_.LineNumber.ToString() + ': ' + $_.Line.Trim()) }
