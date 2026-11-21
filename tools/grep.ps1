Select-String -Path 'assets/app.js' -Pattern 'featured|Featured|renderHome|rule-head' | ForEach-Object {
  Write-Output ($_.LineNumber.ToString() + ': ' + $_.Line.Trim())
}
