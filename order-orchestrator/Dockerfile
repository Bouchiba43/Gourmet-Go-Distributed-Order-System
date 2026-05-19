FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

COPY pom.xml .
COPY proto-definitions/pom.xml proto-definitions/
COPY proto-definitions/src proto-definitions/src/
COPY order-orchestrator/pom.xml order-orchestrator/

RUN --mount=type=cache,target=/root/.m2 \
    mvn -B dependency:go-offline -pl order-orchestrator -am -q

COPY order-orchestrator/src order-orchestrator/src/
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B package -pl order-orchestrator -am -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/order-orchestrator/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
