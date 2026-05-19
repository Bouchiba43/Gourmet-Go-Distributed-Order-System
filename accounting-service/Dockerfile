# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

COPY pom.xml                        pom.xml
COPY proto-definitions/pom.xml      proto-definitions/pom.xml
COPY accounting-service/pom.xml     accounting-service/pom.xml

RUN mvn -B dependency:go-offline -pl accounting-service -am -q

COPY proto-definitions/src          proto-definitions/src
COPY accounting-service/src         accounting-service/src

RUN mvn -B package -pl accounting-service -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache wget
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/accounting-service/target/*.jar app.jar
EXPOSE 8082 50053
ENTRYPOINT ["java", "-jar", "app.jar"]
