#!/usr/bin/env bash
# One-time server prep for Ubuntu 22.04/24.04 (AWS Lightsail/EC2).
# Installs Docker + the compose plugin. Run with: bash deploy/setup-server.sh
set -euo pipefail

echo "==> Installing Docker…"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"

echo "==> Done. Log out and back in (or run 'newgrp docker') so docker works without sudo."
echo "    Then: cd deploy && cp .env.example .env && nano .env && docker compose up -d --build"
