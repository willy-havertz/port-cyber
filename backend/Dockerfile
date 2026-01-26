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
# Use default PyPI index to avoid 404 errors for some packages
RUN pip install --no-cache-dir --default-timeout=60 --retries 5 --root-user-action=ignore -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads/writeups

# Expose port
EXPOSE 8000

# Start the app without migrations (use Supabase SQL Editor for schema)
# If migrations fail, the app will still start
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
