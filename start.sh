#!/bin/bash
set -e

# ============================================================
# 司衡/Themis——电商治理WorkBuddy 一键启动脚本
# 用法: bash start.sh
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 启动司衡/Themis——电商治理WorkBuddy..."
echo ""

# ---- 检查 Node.js ----
if ! command -v node &> /dev/null; then
  echo "❌ 未检测到 Node.js，请先安装: https://nodejs.org (需要 >= 20)"
  exit 1
fi
echo "✅ Node.js $(node --version)"

# ---- 检查 Python ----
PYTHON=""
for cmd in python3 python; do
  if command -v $cmd &> /dev/null; then
    ver=$($cmd --version 2>&1 | grep -oE '[0-9]+\.[0-9]+' | head -1)
    if [ "$(echo "$ver >= 3.9" | bc 2>/dev/null || echo 1)" = "1" ]; then
      PYTHON=$cmd
      break
    fi
  fi
done
if [ -z "$PYTHON" ]; then
  echo "❌ 未检测到 Python >= 3.9，请先安装"
  exit 1
fi
echo "✅ Python $($PYTHON --version)"

# ===== 后端 =====
echo ""
echo "📦 准备后端..."
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo "   创建 Python 虚拟环境..."
  $PYTHON -m venv .venv
fi
source .venv/bin/activate

if ! python -c "import fastapi" 2>/dev/null; then
  echo "   安装 Python 依赖..."
  pip install -r requirements.txt -q
fi
echo "   后端依赖就绪"

echo "   启动后端 (端口 8000)..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# ===== 前端 =====
echo ""
echo "📦 准备前端..."
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "   安装前端依赖（首次较慢）..."
  npm install --silent
fi
echo "   前端依赖就绪"

echo "   启动前端 dev server..."
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!

# ===== 完成 =====
sleep 2
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 启动完成！"
echo ""
echo "  🌐 前端: http://localhost:5173"
echo "  📋 后端: http://localhost:8000"
echo "  📖 API文档: http://localhost:8000/docs"
echo ""
echo "  ⚠️ 目前使用 Mock 数据，无需 API Key 即可预览完整 UI"
echo "  💡 要接入真实 AI: 编辑 backend/.env 填入 ANTHROPIC_API_KEY"
echo ""
echo "  按 Ctrl+C 停止所有服务"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 清理
cleanup() {
  echo ""
  echo "🛑 正在停止服务..."
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  echo "   服务已停止"
  exit
}
trap cleanup SIGINT SIGTERM

# 保持前台
wait
