$files=@(
'ProjectSetOne/forma/index.html',
'ProjectSetOne/Fun Website/index.html',
'ProjectSetOne/honest-hour/index.html',
'ProjectSetOne/Living/index.html',
'ProjectSetOne/pressrum/index.html',
'ProjectSetOne/umbra/index.html',
'ProjectSetOne/Wouldvest/index.html',
'ProjectSetTwo/command-centre/index.html',
'ProjectSetTwo/flagship/index.html',
'ProjectSetTwo/THE ANTI AGENCY/anti-agency.html',
'ProjectSetTwo/THE DIGITAL UNIVERSE/index.html',
'ProjectSetTwo/THE DIGITAL UNIVERSE 2/index.html',
'ProjectSetTwo/THE FUTURE IS NOW/index.html',
'ProjectSetTwo/THE LUXURY EXPERIENCE/lux.html'
)
foreach($f in $files){
  $c = Get-Content $f -TotalCount 80 -Encoding UTF8 | Out-String
  if($c -match '<title>(.*?)</title>'){ Write-Host "$f => $($Matches[1])" }
}
