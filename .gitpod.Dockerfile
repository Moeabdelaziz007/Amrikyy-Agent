FROM gitpod/workspace-full:latest

# Install Node.js 20 (LTS)
RUN bash -c ". .nvm/nvm.sh && nvm install 20 && nvm use 20 && nvm alias default 20"

# Install utilities for code navigation and indexing
RUN sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    ripgrep \
    universal-ctags \
    build-essential \
    python3 \
    python3-pip \
    curl \
    jq \
    redis-server \
  && sudo rm -rf /var/lib/apt/lists/*

# Install global npm tools
RUN bash -c ". .nvm/nvm.sh && npm install -g nodemon pm2"

# Create working directory structure
RUN mkdir -p /workspace/.gitpod/scripts && \
    mkdir -p /workspace/.gitpod/.index

# Set default shell
ENV SHELL=/bin/bash

# Configure Redis to run in background
RUN sudo sed -i 's/^daemonize no/daemonize yes/' /etc/redis/redis.conf

# Start Redis on workspace start
RUN echo 'sudo service redis-server start' >> ~/.bashrc
