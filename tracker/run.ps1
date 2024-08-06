Write-Output "Test"


Add-Content -Path .\somefile.txt -Value (Get-Date) -PassThru

git log