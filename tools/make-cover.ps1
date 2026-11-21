Add-Type -AssemblyName System.Drawing
$src = 'attachments/babdfa49-image.png'
$dst = 'Main/Goodstuff Designs Website/goodstuff-designs-fullpage.png'
$img = [System.Drawing.Image]::FromFile((Resolve-Path $src))
# upscale to a crisp 1200px-wide desktop cover
$w = 1200; $h = [int]($img.Height * $w / $img.Width)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($img, 0, 0, $w, $h)
$g.Dispose(); $img.Dispose()
$bmp.Save((Join-Path (Get-Location) $dst), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output ('saved ' + $dst + ' at ' + $w + 'x' + $h)
