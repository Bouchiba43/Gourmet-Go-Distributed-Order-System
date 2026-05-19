# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

COPY pom.xml                        pom.xml
COPY proto-definitions/pom.xml      proto-definitions/pom.xml
COPY order-orchestrator/pom.xml     order-orchestrator/pom.xml

RUN mvn -B dependency:go-offline -pl order-orchestrator -am -q

COPY proto-definitions/src          proto-definitions/src
COPY order-orchestrator/src         order-orchestrator/src

RUN mvn -B package -pl order-orchestrator -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache wget
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/order-orchestrator/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
