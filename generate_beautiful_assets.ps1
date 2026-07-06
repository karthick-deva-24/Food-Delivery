Add-Type -AssemblyName System.Drawing

$assetsDir = Join-Path $PSScriptRoot "assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
}

function Create-Placeholder($filename, $text, $width, $height, $startColorHex, $endColorHex) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    
    $startColor = [System.Drawing.ColorTranslator]::FromHtml($startColorHex)
    $endColor = [System.Drawing.ColorTranslator]::FromHtml($endColorHex)
    
    $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $startColor, $endColor, 45.0)
    $g.FillRectangle($brush, $rect)
    
    # Draw food plate representation (circle)
    $penColor = [System.Drawing.Color]::FromArgb(180, 255, 255, 255)
    $pen = New-Object System.Drawing.Pen($penColor, 4)
    
    $size = [Math]::Min($width, $height) * 0.6
    $x = ($width - $size) / 2
    $y = ($height - $size) / 2
    $g.DrawEllipse($pen, $x, $y, $size, $size)
    
    $innerSize = $size * 0.8
    $ix = ($width - $innerSize) / 2
    $iy = ($height - $innerSize) / 2
    $g.DrawEllipse($pen, $ix, $iy, $innerSize, $innerSize)
    
    # Draw text
    $font = New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    
    $textSize = $g.MeasureString($text, $font)
    $tx = ($width - $textSize.Width) / 2
    $ty = ($height - $textSize.Height) / 2
    
    $g.DrawString($text, $font, $textBrush, $tx, $ty)
    
    $dest = Join-Path $assetsDir $filename
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $g.Dispose()
    $bmp.Dispose()
    
    $filesize = (Get-Item $dest).Length / 1KB
    Write-Host "Created asset: $filename ($filesize KB) - under 100KB constraint met!"
}

# Generate all assets
Create-Placeholder "hero_1.jpg" "TURKISH KEBAB FEAST" 1200 800 "#b81d24" "#1e1e24"
Create-Placeholder "hero_2.jpg" "SWEET BAKLAVA" 1200 800 "#b81d24" "#ffcc00"
Create-Placeholder "story.jpg" "SINCE 1994 LEGACY" 800 600 "#1e1e24" "#b81d24"
Create-Placeholder "dish_1.jpg" "ADANA KEBAB" 600 600 "#b81d24" "#ffcc00"
Create-Placeholder "dish_2.jpg" "LAHMACUN PIZZA" 600 600 "#ffcc00" "#1e1e24"
Create-Placeholder "dish_3.jpg" "CHEESE KUNEFE" 600 600 "#b81d24" "#1e1e24"
Create-Placeholder "dish_4.jpg" "SULTAN FEAST" 800 600 "#b81d24" "#ffcc00"
Create-Placeholder "dish_5.jpg" "LAMB SHISH" 600 600 "#1e1e24" "#ffcc00"
Create-Placeholder "chef_1.jpg" "CHEF AHMET" 400 500 "#b81d24" "#1e1e24"
Create-Placeholder "chef_2.jpg" "CHEF ELIF" 400 500 "#ffcc00" "#b81d24"
Create-Placeholder "chef_3.jpg" "CHEF KENAN" 400 500 "#1e1e24" "#ffcc00"
Create-Placeholder "app_mockup.jpg" "TURKIZO MOBILE APP" 600 800 "#1e1e24" "#b81d24"
Create-Placeholder "offer_bg.jpg" "SPECIAL OFFER" 1024 768 "#b81d24" "#8c1419"
Create-Placeholder "foodie_banner.jpg" "FOODIE BANNER" 1200 400 "#ffcc00" "#b81d24"
Create-Placeholder "manager_banner.jpg" "MANAGER BANNER" 1200 400 "#b81d24" "#1e1e24"

Write-Host "All premium visible assets generated successfully!"
