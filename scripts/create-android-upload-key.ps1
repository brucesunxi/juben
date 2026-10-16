param([string]$JavaHome = $env:JAVA_HOME)

$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if (-not $JavaHome) {
    $JavaHome = Join-Path $projectRoot '.build/tooling/jdk21/jdk-21.0.12.1+1'
}
$keytool = Join-Path $JavaHome 'bin/keytool.exe'
if (-not (Test-Path -LiteralPath $keytool)) { throw 'Set JAVA_HOME to a JDK before generating the upload key.' }
$signingDirectory = Join-Path $projectRoot '.signing'
$keyPath = Join-Path $signingDirectory 'nocturne-upload.p12'
$settingsPath = Join-Path $signingDirectory 'upload-signing.json'
if ((Test-Path -LiteralPath $keyPath) -or (Test-Path -LiteralPath $settingsPath)) {
    throw 'Existing signing files were found. Reuse and back up those files; this script never replaces a key.'
}

New-Item -ItemType Directory -Force -Path $signingDirectory | Out-Null
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls.exe $signingDirectory /inheritance:r /grant:r "${identity}:(OI)(CI)F" '*S-1-5-18:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Could not restrict access to the signing directory.' }
$password = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$env:NOCTURNE_UPLOAD_KEY_PASSWORD = $password
try {
    & $keytool -genkeypair -noprompt -storetype PKCS12 -keystore $keyPath -alias nocturne-upload `
        -keyalg RSA -keysize 4096 -validity 10000 `
        -dname 'CN=Nocturne Upload, O=北京简融易数科技有限公司, C=CN' `
        -storepass:env NOCTURNE_UPLOAD_KEY_PASSWORD -keypass:env NOCTURNE_UPLOAD_KEY_PASSWORD
    if ($LASTEXITCODE -ne 0) { throw 'Upload-key generation failed.' }
    @{
        keystorePath = $keyPath
        keyAlias = 'nocturne-upload'
        storePassword = $password
        keyPassword = $password
        purpose = 'Nocturne upload key; not an account password or a service-account credential'
        createdOn = '2026-10-16'
    } | ConvertTo-Json | Set-Content -LiteralPath $settingsPath -Encoding utf8
    $certificatePath = Join-Path $projectRoot 'release/google-play/nocturne-upload-certificate.pem'
    & $keytool -exportcert -rfc -keystore $keyPath -alias nocturne-upload `
        -storepass:env NOCTURNE_UPLOAD_KEY_PASSWORD -file $certificatePath
    if ($LASTEXITCODE -ne 0) { throw 'Public certificate export failed.' }
    & $keytool -printcert -file $certificatePath
    if ($LASTEXITCODE -ne 0) { throw 'Public certificate verification failed.' }
    Write-Output 'Upload key created. Back up the entire .signing directory securely; it is ignored by Git.'
    Write-Output 'Only the public certificate is stored under release/google-play.'
} finally {
    Remove-Item Env:NOCTURNE_UPLOAD_KEY_PASSWORD -ErrorAction SilentlyContinue
    $password = $null
}
