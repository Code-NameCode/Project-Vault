# 1) Replace em dashes in text files
$files = @('index.html','assets/app.js','assets/styles.css','data/projects.json','README.md')
foreach ($f in $files) {
  $c = Get-Content $f -Raw -Encoding UTF8
  $n = ([regex]::Matches($c, '\u2014')).Count
  if ($n -gt 0) {
    $c = $c -replace '\u2014', '-'
    [System.IO.File]::WriteAllText((Join-Path (Get-Location) $f), $c, (New-Object System.Text.UTF8Encoding($false)))
    Write-Output ("$f : replaced $n")
  }
}

# 2) Rename files on disk whose names contain em dashes
Get-ChildItem -Recurse -File | Where-Object { $_.Name -match '\u2014' } | ForEach-Object {
  $new = $_.Name -replace '\u2014', '-'
  Rename-Item -LiteralPath $_.FullName -NewName $new
  Write-Output ("renamed: " + $_.Name + " -> " + $new)
}
