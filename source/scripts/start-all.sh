
#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

UDP_DIR="$REPO_ROOT/source/server/udp-server"
CORE_DIR="$REPO_ROOT/source/server/auction-core-service"
ADMIN_DIR="$REPO_ROOT/source/server/admin-console"
WEB_DIR="$REPO_ROOT/source/client/jnp.fe"

ADMIN_JAR="$ADMIN_DIR/target/admin-console-1.0.0-jar-with-dependencies.jar"

echo "=============================================="
echo " KHOI DONG HE THONG DAU GIA BIEN SO XE"
echo "=============================================="

# ===== 1. SU DUNG JDK 21 =====

if ! JAVA_HOME="$(/usr/libexec/java_home -F -v 21)"; then
    echo "ERROR: Khong tim thay JDK 21!"
    exit 1
fi

export JAVA_HOME
export PATH="$JAVA_HOME/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"

echo ""
echo "[JAVA] Phien ban dang su dung:"
java -version

# ===== 2. BUILD ADMIN CONSOLE =====

echo ""
echo "[BUILD] Dang build Admin Console..."

(
    cd "$ADMIN_DIR"
    mvn -q -DskipTests package
)

if [[ ! -f "$ADMIN_JAR" ]]; then
    echo "ERROR: Khong tim thay Admin Console JAR!"
    exit 1
fi

echo "[BUILD] Admin Console san sang."

# ===== 3. KIEM TRA FRONTEND =====

if [[ ! -d "$WEB_DIR/node_modules" ]]; then
    echo "[NPM] Dang cai dat dependencies..."

    (
        cd "$WEB_DIR"
        npm install
    )
fi

# ===== 4. HAM MO TERMINAL =====

open_terminal_window() {
    local title="$1"
    local workdir="$2"
    local cmd="$3"

    local safe_title
    local safe_workdir
    local safe_java_home
    local full_cmd

    printf -v safe_title '%q' "$title"
    printf -v safe_workdir '%q' "$workdir"
    printf -v safe_java_home '%q' "$JAVA_HOME"

    # Dam bao moi Terminal moi deu su dung JDK 21
    full_cmd="export JAVA_HOME=$safe_java_home; "
    full_cmd+="export PATH=\"\$JAVA_HOME/bin:\$PATH\"; "
    full_cmd+="printf '\\e]0;%s\\a' $safe_title; "
    full_cmd+="cd $safe_workdir && $cmd"

    osascript \
        -e 'on run argv' \
        -e 'tell application "Terminal" to do script (item 1 of argv)' \
        -e 'end run' \
        "$full_cmd" >/dev/null
}

# ===== 5. KIEM TRA XUNG DOT CONG =====

echo ""
echo "[CHECK] Kiem tra cac cong dich vu..."

if lsof -nP -iTCP:8080 -sTCP:LISTEN 2>/dev/null \
    | grep -q LISTEN; then
    echo "ERROR: Port 8080 dang duoc su dung!"
    exit 1
fi

if lsof -nP -iUDP:9001 -iUDP:9002 2>/dev/null \
    | grep -qE '9001|9002'; then
    echo "ERROR: UDP 9001/9002 dang duoc su dung!"
    echo "Hay dung UDP Server cu truoc khi chay."
    exit 1
fi

# ===== 6. KHOI DONG UDP SERVER =====

echo ""
echo "[1/4] Khoi dong UDP Server..."

open_terminal_window \
    "1. UDP Server" \
    "$UDP_DIR" \
    "mvn exec:java -Dexec.mainClass=com.auction.udp.UdpMetricsServerApp"

udp_ready=false

for ((i=1; i<=30; i++)); do
    if lsof -nP -iUDP:9001 2>/dev/null | grep -q 9001 &&
       lsof -nP -iUDP:9002 2>/dev/null | grep -q 9002; then
        udp_ready=true
        break
    fi

    sleep 2
done

if [[ "$udp_ready" != "true" ]]; then
    echo "ERROR: UDP Server chua san sang!"
    echo "Hay xem log cua so UDP Server."
    exit 1
fi

echo "[UDP] Ports 9001/9002 san sang."

# ===== 7. KHOI DONG CORE SERVICE =====

echo ""
echo "[2/4] Khoi dong Auction Core Service..."

open_terminal_window \
    "2. Auction Core Service" \
    "$CORE_DIR" \
    "./mvnw spring-boot:run"

core_ready=false
http_code="000"

for ((i=1; i<=60; i++)); do
    http_code="$(
        curl -sS \
            -o /dev/null \
            -w '%{http_code}' \
            --max-time 2 \
            'http://127.0.0.1:8080/api/v1/auction/get?page=0&size=50&status=LIVE' \
            2>/dev/null || true
    )"

    if [[ "$http_code" == "200" ]]; then
        core_ready=true
        break
    fi

    sleep 2
done

if [[ "$core_ready" != "true" ]]; then
    echo "ERROR: Core Service chua san sang!"
    echo "HTTP code cuoi cung: $http_code"
    echo "Hay kiem tra log Auction Core Service."
    exit 1
fi

echo "[CORE] HTTP 8080 san sang."

# ===== 8. KHOI DONG ADMIN CONSOLE =====

echo ""
echo "[3/4] Khoi dong Admin Console..."

open_terminal_window \
    "3. Admin Console" \
    "$ADMIN_DIR" \
    "java -jar target/admin-console-1.0.0-jar-with-dependencies.jar"

# ===== 9. KHOI DONG WEB FRONTEND =====

echo ""
echo "[4/4] Khoi dong Web Frontend..."

open_terminal_window \
    "4. Web Frontend" \
    "$WEB_DIR" \
    "npm run dev"

# ===== 10. HOAN TAT =====

osascript \
    -e 'tell application "Terminal" to activate' \
    >/dev/null 2>&1 || true

echo ""
echo "=============================================="
echo " DA GUI LENH KHOI DONG HE THONG"
echo "=============================================="
echo "Core API: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo "Admin Console: Java Swing"
echo ""
echo "Hay kiem tra log cua tung Terminal."
