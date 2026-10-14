# =============================================================
#  一键部署到 GitHub Pages（Windows PowerShell）
#  用法：  powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#  前置：  已安装 git，并已安装 GitHub CLI (gh) 且执行过 gh auth login
#          没有 gh 也能用，脚本会提示你手动建仓库
# =============================================================

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

function Info($msg)  { Write-Host "  $msg" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "  [OK] $msg" -ForegroundColor Green }
function Warn($msg)  { Write-Host "  [!]  $msg" -ForegroundColor Yellow }
function Fail($msg)  { Write-Host "  [X]  $msg" -ForegroundColor Red }

Write-Host "`n=== 个人主页 -> GitHub Pages 部署脚本 ===`n" -ForegroundColor Magenta

# ---------- 0. 必须在项目根目录运行 ----------
if (-not (Test-Path '.\index.html')) {
    Fail "当前目录没有找到 index.html，请在 personal-website 目录下运行本脚本。"
    exit 1
}

# ---------- 1. 检查 git ----------
$git = Get-Command git -ErrorAction SilentlyContinue
if (-not $git) {
    Fail "没有找到 git，请先安装：https://git-scm.com/download/win"
    exit 1
}
Ok "git: $((& git --version))"

# ---------- 2. 收集信息 ----------
$username = Read-Host "请输入你的 GitHub 用户名（直接回车 = maodou452）"
if ([string]::IsNullOrWhiteSpace($username)) { $username = 'maodou452' }
$username = $username.Trim()

$defaultRepo = "$username.github.io"
$repo = Read-Host "请输入仓库名（直接回车 = $defaultRepo）"
if ([string]::IsNullOrWhiteSpace($repo)) { $repo = $defaultRepo }
$repo = $repo.Trim()

$siteUrl = if ($repo -ieq $defaultRepo) { "https://$username.github.io/" }
           else { "https://$username.github.io/$repo/" }

Info "用户名  : $username"
Info "仓库名  : $repo"
Info "访问地址: $siteUrl"
Write-Host ""

# ---------- 3. 初始化本地仓库 ----------
$branch = 'main'

if (-not (Test-Path '.\.git')) {
    & git init -b main | Out-Null
    if ($LASTEXITCODE -ne 0) {
        # 老版本 git 不支持 -b，改用 symbolic-ref 指定初始分支
        & git init | Out-Null
        & git symbolic-ref HEAD refs/heads/main | Out-Null
    }
    Ok "已初始化本地 git 仓库（分支 main）"
} else {
    Ok "本地已经是 git 仓库，跳过 init"
    $head = (& git symbolic-ref --short -q HEAD 2>$null)
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($head)) { $branch = $head.Trim() }
    if ($branch -ne 'main') {
        & git branch -M main 2>$null
        if ($LASTEXITCODE -eq 0) { $branch = 'main' } else { Warn "分支名保持为 $branch" }
    }
}

if (-not (& git config user.name))  { & git config user.name  $username 2>$null }
if (-not (& git config user.email)) { & git config user.email "$username@users.noreply.github.com" 2>$null }

& git add -A
$staged = (& git diff --cached --name-only) -join ''
if ([string]::IsNullOrWhiteSpace($staged)) {
    Warn "没有新的改动需要提交"
} else {
    & git commit -m "feat: 个人主页（游戏 & 小动物）" | Out-Null
    Ok "已创建提交"
}

# ---------- 4. 配置远端 ----------
$remoteUrl = "https://github.com/$username/$repo.git"
$hasRemote = (& git remote) -contains 'origin'
if ($hasRemote) {
    & git remote set-url origin $remoteUrl
    Ok "已更新 origin -> $remoteUrl"
} else {
    & git remote add origin $remoteUrl
    Ok "已添加 origin -> $remoteUrl"
}

# ---------- 5. 用 gh 建仓库并推送（可选） ----------
$gh = Get-Command gh -ErrorAction SilentlyContinue
$pushed = $false

if ($gh) {
    & gh auth status 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Info "检测到 GitHub CLI 已登录，尝试自动创建仓库…"
        & gh repo create $repo --public --source=. --remote=origin --push 2>$null
        if ($LASTEXITCODE -eq 0) { $pushed = $true; Ok "仓库已创建并推送完成" }
        else { Warn "gh repo create 没成功（可能仓库已存在），改用普通 push" }
    } else {
        Warn "gh 未登录，跳过自动建仓库。可执行 gh auth login 后再试。"
    }
} else {
    Warn "没有安装 gh，跳过自动建仓库。"
}

if (-not $pushed) {
    Info "正在推送到 origin/$branch …"
    & git push -u origin $branch
    if ($LASTEXITCODE -ne 0) {
        Warn "推送失败。请先确认已在浏览器创建好仓库 $repo 并完成登录，然后重试："
        Write-Host "      git push -u origin $branch" -ForegroundColor White
    } else {
        $pushed = $true
    }
}

# ---------- 6. 开启 GitHub Pages（gh 可用时） ----------
if ($gh -and $pushed) {
    Info "尝试开启 GitHub Pages（分支 $branch，根目录）…"
    $body = "{""source"":{""branch"":""$branch"",""path"":""/""}}"
    $body | & gh api -X POST "repos/$username/$repo/pages" --input - 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Ok "已通过 API 开启 Pages"
    } else {
        Warn "自动开启失败（可能之前已经开过），请手动到 Settings -> Pages 选择 $branch / (root)"
    }
}

Write-Host ""
Write-Host "=== 完成 ===" -ForegroundColor Magenta
Write-Host "稍等 1-2 分钟后访问：$siteUrl" -ForegroundColor Green
Write-Host "如果页面还是 404："
Write-Host "  1) 打开 https://github.com/$username/$repo/settings/pages"
Write-Host "  2) Source 选择 Deploy from a branch -> main -> / (root) -> Save"
Write-Host ""
