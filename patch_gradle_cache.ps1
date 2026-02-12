$gradleCache = "$HOME\.gradle\caches"
$files = Get-ChildItem -Path $gradleCache -Filter "graphicsConversions.h" -Recurse -ErrorAction SilentlyContinue

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName
    if ($content -match "std::format") {
        Write-Host "Patching $($file.FullName)"
        $content = $content -replace 'std::format\("{}%", dimension.value\)', 'std::to_string(dimension.value) + "%"'
        Set-Content -Path $file.FullName -Value $content -Encoding utf8
    }
}
