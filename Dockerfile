FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/

RUN apt-get update \
    && apt-get install -y gcc python3-dev \
    && pip install --upgrade pip \
    && pip install -r requirements.txt \
    && apt-get purge -y gcc python3-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY . /app/

CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port ${PORT}"]
