# ---------- Builder Stage ----------
FROM python:3.10-slim AS builder

WORKDIR /build

ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python packages
COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install --no-cache-dir --prefix=/install -r requirements.txt

# ---------- Final Stage ----------
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Copy installed dependencies from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY api ./api


EXPOSE 8000

# Use shell form so $PORT is expanded
# Shell form: Required for $PORT variable expansion
CMD uvicorn api.api:app --host 0.0.0.0 --port $PORT
