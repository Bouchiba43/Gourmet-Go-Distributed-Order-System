# Multi-stage: build with Maven, run with lean JRE
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Copy parent POM + proto-definitions first (better layer caching)
COPY pom.xml .
COPY proto-definitions/pom.xml proto-definitions/
COPY proto-definitions/src proto-definitions/src/
COPY order-service/pom.xml order-service/

# Download dependencies in a separate layer
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B dependency:go-offline -pl order-service -am -q

# Build
COPY order-service/src order-service/src/
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B package -pl order-service -am -DskipTests -q

# Runtime image
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/order-service/target/*.jar app.jar
EXPOSE 8080 9000
ENTRYPOINT ["java", "-jar", "app.jar"]
