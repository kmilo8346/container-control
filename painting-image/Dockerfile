FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends chafa curl ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --uid 10001 --create-home runner
COPY --chmod=755 run.sh /app/run.sh
USER runner
ENTRYPOINT ["/app/run.sh"]
