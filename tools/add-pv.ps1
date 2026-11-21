$path = Join-Path (Get-Location) 'assets/app.js'
$c = Get-Content $path -Raw -Encoding UTF8
$old = @'
      <div class="modal-preview"><iframe src="${withBase(previewUrl(p))}" loading="lazy" title="Live preview of ${esc(p.name)}"></iframe></div>
'@
if (-not $c.Contains($old)) { Write-Output 'OLD BLOCK NOT FOUND'; exit 1 }
$new = @'
      <div class="pv-bar">
        <span class="pv-label">Preview</span>
        <div class="pv-toggle" role="group" aria-label="Preview device size">
          <button class="pv-btn active" data-dev="desktop" aria-pressed="true">Desktop</button>
          <button class="pv-btn" data-dev="mobile" aria-pressed="false">Mobile</button>
        </div>
      </div>
      <div class="modal-preview pv-desktop">
        <iframe src="${withBase(previewUrl(p))}" loading="lazy" title="Live preview of ${esc(p.name)}"></iframe>
      </div>
'@
$c = $c.Replace($old, $new)
$oldTail = "    e.target.remove();" + [char]10 + "  });"
if (-not $c.Contains($oldTail)) { Write-Output 'TAIL NOT FOUND'; exit 1 }
$tailLines = @(
'    e.target.remove();',
'',
'    const host = $("#previewHost");',
'    host.querySelectorAll(".pv-btn").forEach((b) =>',
'      b.addEventListener("click", () => {',
'        host.querySelectorAll(".pv-btn").forEach((x) => {',
'          const on = x === b;',
'          x.classList.toggle("active", on);',
'          x.setAttribute("aria-pressed", String(on));',
'        });',
'        const frame = host.querySelector(".modal-preview");',
'        frame.classList.toggle("pv-mobile", b.dataset.dev === "mobile");',
'        frame.classList.toggle("pv-desktop", b.dataset.dev === "desktop");',
'      }));',
'  });'
)
$newTail = ($tailLines -join [char]10)
$c = $c.Replace($oldTail, $newTail)
[System.IO.File]::WriteAllText($path, $c, (New-Object System.Text.UTF8Encoding($false)))
Write-Output ('pv-btn count: ' + ([regex]::Matches($c, 'pv-btn')).Count)
Write-Output ('braces ' + ([regex]::Matches($c, '\{')).Count + '/' + ([regex]::Matches($c, '\}')).Count)
Write-Output ('parens ' + ([regex]::Matches($c, '\(')).Count + '/' + ([regex]::Matches($c, '\)')).Count)
