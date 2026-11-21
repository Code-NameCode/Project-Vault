try {
  $u = Invoke-RestMethod 'https://api.github.com/users/Code-NameCode' -TimeoutSec 15
  Write-Output ('login: ' + $u.login)
  Write-Output ('name: ' + $u.name)
  Write-Output ('repos: ' + $u.public_repos)
  $r = Invoke-RestMethod 'https://api.github.com/users/Code-NameCode/repos?sort=updated&per_page=10' -TimeoutSec 15
  foreach ($x in $r) { Write-Output ($x.name + ' | ' + $x.language + ' | stars ' + $x.stargazers_count + ' | ' + $x.description) }
} catch {
  Write-Output ('ERR: ' + $_.Exception.Message)
}
