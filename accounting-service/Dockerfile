FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

COPY pom.xml .
COPY proto-definitions/pom.xml proto-definitions/
COPY proto-definitions/src proto-definitions/src/
COPY accounting-service/pom.xml accounting-service/

RUN --mount=type=cache,target=/root/.m2 \
    mvn -B dependency:go-offline -pl accounting-service -am -q

COPY accounting-service/src accounting-service/src/
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B package -pl accounting-service -am -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/accounting-service/target/*.jar app.jar
EXPOSE 8082 9002
ENTRYPOINT ["java", "-jar", "app.jar"]
