#!/usr/bin/env python3
"""Ollama Tunnel - persist serveo SSH tunnel to expose local Ollama"""
import subprocess, time, sys, re

LOCAL_PORT = 11434
REMOTE_PORT = 80

def start_tunnel():
    cmd = [
        "ssh", "-o", "StrictHostKeyChecking=no",
        "-o", "ServerAliveInterval=30",
        "-o", "ServerAliveCountMax=3",
        "-o", "ExitOnForwardFailure=yes",
        "-R", f"{REMOTE_PORT}:localhost:{LOCAL_PORT}",
        "serveo.net"
    ]
    proc = subprocess.Popen(
        cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, bufsize=1
    )
    # Read first few lines to get URL
    url = None
    for i in range(20):
        line = proc.stdout.readline()
        if not line:
            break
        m = re.search(r'https://[^\s]+serveo[^\s]*', line)
        if m:
            url = m.group(0).strip()
            print(f"SERVEO_URL={url}", flush=True)
            break
    return proc, url

proc, url = start_tunnel()
if not url:
    print("ERROR: Could not get serveo URL", file=sys.stderr)
    proc.terminate()
    sys.exit(1)

# Keep alive - monitor and restart if needed
while True:
    ret = proc.poll()
    if ret is not None:
        print(f"Tunnel died (exit {ret}), restarting...", file=sys.stderr)
        time.sleep(3)
        proc, url = start_tunnel()
        if not url:
            time.sleep(10)
            continue
    time.sleep(5)
