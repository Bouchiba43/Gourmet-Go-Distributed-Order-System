# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

COPY pom.xml                        pom.xml
COPY proto-definitions/pom.xml      proto-definitions/pom.xml
COPY kitchen-service/pom.xml        kitchen-service/pom.xml

RUN mvn -B dependency:go-offline -pl kitchen-service -am -q

COPY proto-definitions/src          proto-definitions/src
COPY kitchen-service/src            kitchen-service/src

RUN mvn -B package -pl kitchen-service -am -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache wget
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/kitchen-service/target/*.jar app.jar
EXPOSE 8081 50052
ENTRYPOINT ["java", "-jar", "app.jar"]
