#!/bin/bash
# 司衡/Themis——电商治理WorkBuddy - 启动脚本

echo "🚀 启动司衡/Themis——电商治理WorkBuddy..."

# 启动后端
echo "📦 启动后端服务..."
cd "$(dirname "$0")/backend"
/Users/zhangyue/Library/Python/3.9/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "   后端已启动 (PID: $BACKEND_PID)"

# 启动前端
echo "📦 启动前端服务..."
cd "$(dirname "$0")/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!
echo "   前端已启动 (PID: $FRONTEND_PID)"

echo ""
echo "✅ 服务启动完成！"
echo "   前端: http://localhost:5173"
echo "   后端: http://localhost:8000"
echo "   健康检查: http://localhost:8000/api/health"
echo ""
echo "按 Ctrl+C 停止所有服务"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
