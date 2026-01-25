FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    nmap \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
# Use explicit index URL, higher timeout/retries, and trusted hosts to avoid transient network/SSL issues
RUN pip install --no-cache-dir --default-timeout=60 --retries 5 \
    --trusted-host pypi.tuna.tsinghua.edu.cn \
    -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/writeups

# Expose port
EXPOSE 8000

# Start the app without migrations (use Supabase SQL Editor for schema)
# If migrations fail, the app will still start
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
