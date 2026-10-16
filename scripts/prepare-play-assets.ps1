param(
    [string]$OutputDirectory = (Join-Path $PSScriptRoot '../release/google-play/assets')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$outputRoot = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null
$logo = [Drawing.Image]::FromFile((Join-Path $projectRoot 'public/icons/icon.png'))
$cover = [Drawing.Image]::FromFile((Join-Path $projectRoot 'public/assets/covers/moon-trial.jpg'))
$resources = [Collections.Generic.List[IDisposable]]::new()

function Keep-Resource([IDisposable]$Value) {
    $resources.Add($Value)
    return $Value
}

try {
    # Export the existing brand mark without changing its proportions or artwork.
    $icon = Keep-Resource ([Drawing.Bitmap]::new(512, 512, [Drawing.Imaging.PixelFormat]::Format24bppRgb))
    $iconGraphics = Keep-Resource ([Drawing.Graphics]::FromImage($icon))
    $iconGraphics.Clear([Drawing.ColorTranslator]::FromHtml('#090b10'))
    $iconGraphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $iconGraphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $iconGraphics.DrawImage($logo, 0, 0, 512, 512)
    $icon.Save((Join-Path $outputRoot 'icon-512.png'), [Drawing.Imaging.ImageFormat]::Png)

    # A store feature graphic, made only from the existing logo, cover and copy.
    $banner = Keep-Resource ([Drawing.Bitmap]::new(1024, 500, [Drawing.Imaging.PixelFormat]::Format24bppRgb))
    $g = Keep-Resource ([Drawing.Graphics]::FromImage($banner))
    $g.Clear([Drawing.ColorTranslator]::FromHtml('#090b10'))
    $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $cropHeight = $cover.Width * 500.0 / 464.0
    $cropTop = ($cover.Height - $cropHeight) / 2.0
    $sourceRectangle = [Drawing.RectangleF]::new(0, $cropTop, $cover.Width, $cropHeight)
    $g.DrawImage($cover, [Drawing.RectangleF]::new(560, 0, 464, 500), $sourceRectangle, [Drawing.GraphicsUnit]::Pixel)
    $gradient = Keep-Resource ([Drawing.Drawing2D.LinearGradientBrush]::new(
        [Drawing.Rectangle]::new(480, 0, 240, 500),
        [Drawing.Color]::FromArgb(255, 9, 11, 16),
        [Drawing.Color]::FromArgb(0, 9, 11, 16),
        [Drawing.Drawing2D.LinearGradientMode]::Horizontal
    ))
    $g.FillRectangle($gradient, 480, 0, 240, 500)
    $white = Keep-Resource ([Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#f2f1ec')))
    $muted = Keep-Resource ([Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#a8aab3')))
    $lime = Keep-Resource ([Drawing.SolidBrush]::new([Drawing.ColorTranslator]::FromHtml('#d8ff64')))
    $titleFont = Keep-Resource ([Drawing.Font]::new('Georgia', 72, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel))
    $labelFont = Keep-Resource ([Drawing.Font]::new('Segoe UI', 13, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel))
    $bodyFont = Keep-Resource ([Drawing.Font]::new('Segoe UI', 24, [Drawing.FontStyle]::Regular, [Drawing.GraphicsUnit]::Pixel))
    $g.DrawImage($logo, 62, 48, 48, 48)
    $g.DrawString('STORY-DRIVEN MYSTERIES', $labelFont, $muted, [single]126, [single]64)
    $g.DrawString('Nocturne', $titleFont, $white, [single]56, [single]155)
    $g.FillRectangle($lime, 64, 255, 42, 3)
    $g.DrawString("Every story has`na missing piece.", $bodyFont, $white, [single]62, [single]283)
    $g.DrawString('INVESTIGATE. QUESTION. CONNECT.', $labelFont, $muted, [single]64, [single]430)
    $banner.Save((Join-Path $outputRoot 'feature-graphic.en-US.png'), [Drawing.Imaging.ImageFormat]::Png)

    $files = @('icon-512.png', 'feature-graphic.en-US.png') | ForEach-Object {
        $assetPath = Join-Path $outputRoot $_
        $asset = [Drawing.Image]::FromFile($assetPath)
        try {
            [ordered]@{
                file = $_
                width = $asset.Width
                height = $asset.Height
                bytes = (Get-Item -LiteralPath $assetPath).Length
                sha256 = (Get-FileHash -LiteralPath $assetPath -Algorithm SHA256).Hash
            }
        } finally { $asset.Dispose() }
    }
    [ordered]@{
        status = 'draft-not-uploaded'
        sources = @('public/icons/icon.png', 'public/assets/covers/moon-trial.jpg')
        rightsConfirmation = 'Pending publisher confirmation'
        assets = @($files)
    } | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $outputRoot 'manifest.json') -Encoding utf8
    Write-Output "Prepared Google Play assets in $outputRoot"
} finally {
    for ($index = $resources.Count - 1; $index -ge 0; $index--) { $resources[$index].Dispose() }
    $logo.Dispose()
    $cover.Dispose()
}
