# ── Stage 1: Build ────────────────────────────────────────────────────────────
# maven:3.9-eclipse-temurin-17 is Debian-based (glibc) — required because the
# protoc native binary downloaded by protobuf-maven-plugin is a glibc binary
# that crashes on Alpine (musl libc).
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Copy POMs first. Docker caches this layer separately from the source layer,
# so `mvn dependency:go-offline` only re-runs when a POM changes — not on
# every source-code change.
COPY pom.xml                        pom.xml
COPY proto-definitions/pom.xml      proto-definitions/pom.xml
COPY order-service/pom.xml          order-service/pom.xml

RUN mvn -B dependency:go-offline -pl order-service -am -q

# Now copy source and build. This layer re-runs on every source change.
COPY proto-definitions/src          proto-definitions/src
COPY order-service/src              order-service/src

RUN mvn -B package -pl order-service -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
# wget is needed for the Docker health-check in docker-compose
RUN apk add --no-cache wget
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/order-service/target/*.jar app.jar
EXPOSE 8080 50051
ENTRYPOINT ["java", "-jar", "app.jar"]
