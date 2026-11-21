$files = @('index.html','assets/app.js','assets/styles.css','data/projects.json','README.md')
foreach ($f in $files) {
  Select-String -Path $f -Pattern '\u2014' -Encoding UTF8 | ForEach-Object {
    Write-Output ("$f" + ':' + $_.LineNumber + ': ' + $_.Line.Trim())
  }
}
