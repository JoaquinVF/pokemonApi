<#
  Script para inicializar repositorio, commitear cambios y pushear a remote opcional.
  Uso:
    .\git-deploy.ps1                     # inicializa y commitea localmente
    .\git-deploy.ps1 -RemoteUrl <url>  # agrega remote y pushea
#>
[CmdletBinding()]
param(
  [string]$RemoteUrl
)

function ExitWith($msg){ Write-Host $msg; exit 1 }

try{ git --version > $null 2>&1 } catch { ExitWith "git no encontrado. Instala Git y vuelve a ejecutar." }

$inside = (git rev-parse --is-inside-work-tree 2>$null)
if(-not $inside){
  git init
  git checkout -b main 2>$null
}

git add .
try{
  git commit -m "chore: initial site + GH Pages workflow"
} catch {
  Write-Host "No hay cambios para commitear o commit falló."
}

if($RemoteUrl){
  $existing = git remote get-url origin 2>$null
  if($LASTEXITCODE -eq 0){
    Write-Host "Remote 'origin' ya existe: $existing"
  } else {
    git remote add origin $RemoteUrl
    Write-Host "Remote 'origin' agregado: $RemoteUrl"
  }
  Write-Host "Pusheando a origin main..."
  git push -u origin main
}

Write-Host "Script finalizado."
