@echo off
rem HEIC -> JPG converter (same folder as this .bat)
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$s=Get-Content -LiteralPath '%~f0' -Encoding UTF8 -Raw; $m='#'+'PS_START'; iex ($s.Substring($s.IndexOf($m)))"
echo.
pause
exit /b

#PS_START
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName PresentationCore
$magick = Get-Command magick -ErrorAction SilentlyContinue
$files = Get-ChildItem -LiteralPath . -File | Where-Object { $_.Extension -ieq '.heic' -or $_.Extension -ieq '.heif' }
if (-not $files) { Write-Host 'HEICファイルが見つかりません。'; return }

$ok = 0; $ng = 0
foreach ($f in $files) {
    $out = [IO.Path]::ChangeExtension($f.FullName, '.jpg')
    if (Test-Path -LiteralPath $out) { Write-Host "スキップ(既に存在): $($f.Name)"; continue }
    try {
        if ($magick) {
            & magick $f.FullName -quality 92 $out
            if ($LASTEXITCODE -ne 0) { throw 'ImageMagickでの変換に失敗' }
        } else {
            $in = [IO.File]::OpenRead($f.FullName)
            try {
                $dec = [Windows.Media.Imaging.BitmapDecoder]::Create($in, [Windows.Media.Imaging.BitmapCreateOptions]::None, [Windows.Media.Imaging.BitmapCacheOption]::OnLoad)
                $enc = New-Object Windows.Media.Imaging.JpegBitmapEncoder
                $enc.QualityLevel = 92
                $enc.Frames.Add([Windows.Media.Imaging.BitmapFrame]::Create($dec.Frames[0]))
                $o = [IO.File]::Create($out)
                try { $enc.Save($o) } finally { $o.Close() }
            } finally { $in.Close() }
        }
        Write-Host "OK: $($f.Name)"; $ok++
    } catch {
        Write-Host "失敗: $($f.Name) - $($_.Exception.Message)"; $ng++
        if (Test-Path -LiteralPath $out) { Remove-Item -LiteralPath $out -ErrorAction SilentlyContinue }
    }
}
Write-Host ""
Write-Host "完了: 成功 $ok 件 / 失敗 $ng 件"
if ($ng -gt 0 -and -not $magick) { Write-Host '※失敗する場合は Microsoft Store の「HEIF画像拡張機能」を入れるか、ImageMagick をインストールしてください。' }