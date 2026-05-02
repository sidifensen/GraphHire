param(
    [string]$JsonPath = "D:/code/GraphHire/docs/抓包/boss-position-type-tree-names.json",
    [string]$OutPath = "D:/code/GraphHire/backend/src/main/resources/db/migration/V2026_05_02_019__seed_position_type_from_boss_json.sql"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $JsonPath)) {
    throw "JSON 文件不存在: $JsonPath"
}

$root = Get-Content -Raw $JsonPath | ConvertFrom-Json
$rows = New-Object System.Collections.Generic.List[string]

function Escape-SqlLiteral([string]$s) {
    if ($null -eq $s) { return "" }
    return $s.Replace("'", "''")
}

for ($i = 0; $i -lt $root.Count; $i++) {
    $l1 = $root[$i]
    $code1 = ($i + 1) * 1000000
    $name1 = Escape-SqlLiteral($l1.name)
    $rows.Add("($code1, $code1, '$name1', NULL, 1, $($i + 1), 1, 0)")

    $children1 = @($l1.children)
    for ($j = 0; $j -lt $children1.Count; $j++) {
        $l2 = $children1[$j]
        $code2 = $code1 + (($j + 1) * 1000)
        $name2 = Escape-SqlLiteral($l2.name)
        $rows.Add("($code2, $code2, '$name2', $code1, 2, $($j + 1), 1, 0)")

        $children2 = @($l2.children)
        for ($k = 0; $k -lt $children2.Count; $k++) {
            $l3 = $children2[$k]
            $code3 = $code2 + ($k + 1)
            $name3 = Escape-SqlLiteral($l3.name)
            $rows.Add("($code3, $code3, '$name3', $code2, 3, $($k + 1), 1, 0)")
        }
    }
}

$header = @(
    "-- Auto generated from: $JsonPath",
    "-- Source: position type name tree (name/children only)",
    "-- Generated at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    ""
)

$sql = New-Object System.Text.StringBuilder
[void]$sql.AppendLine(($header -join [Environment]::NewLine))
[void]$sql.AppendLine("INSERT INTO position_type (id, code, name, parent_id, level, sort_no, status, deleted)")
[void]$sql.AppendLine("VALUES")
[void]$sql.AppendLine(("    " + ($rows -join ",`n    ")))
[void]$sql.AppendLine("ON CONFLICT (code) DO UPDATE")
[void]$sql.AppendLine("SET name = EXCLUDED.name,")
[void]$sql.AppendLine("    parent_id = EXCLUDED.parent_id,")
[void]$sql.AppendLine("    level = EXCLUDED.level,")
[void]$sql.AppendLine("    sort_no = EXCLUDED.sort_no,")
[void]$sql.AppendLine("    status = EXCLUDED.status,")
[void]$sql.AppendLine("    deleted = EXCLUDED.deleted,")
[void]$sql.AppendLine("    update_time = CURRENT_TIMESTAMP;")
[void]$sql.AppendLine("")
[void]$sql.AppendLine("SELECT setval(pg_get_serial_sequence('position_type','id'), (SELECT COALESCE(MAX(id), 1) FROM position_type));")

$dir = Split-Path -Parent $OutPath
if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
}

Set-Content -Path $OutPath -Value $sql.ToString() -Encoding UTF8
Write-Output "generated: $OutPath"
Write-Output "rows: $($rows.Count)"
