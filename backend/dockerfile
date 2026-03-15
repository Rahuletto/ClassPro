# syntax=docker/dockerfile:1

ARG GO_VERSION=1.23

# Build stage
FROM golang:${GO_VERSION}-alpine AS builder

WORKDIR /app

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY src/ ./src/

# Copy environment file if it exists
COPY .env* ./

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main src/main.go

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/main .
COPY --from=builder /app/.env* ./

# Create a non-root user
RUN addgroup -g 1001 -S golang && \
    adduser -S golang -u 1001

USER golang

EXPOSE 8080

ENV PORT=8080

CMD ["./main"]