#!/usr/bin/env bash
echo "=== CHECK START ==="
pwd
which git 2>&1 && git --version 2>&1
which gh 2>&1 && gh --version 2>&1
cd /Users/srhlv/Projects/alina-store && git status 2>&1
echo "=== CHECK END ==="
