FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

COPY pom.xml .
COPY proto-definitions/pom.xml proto-definitions/
COPY proto-definitions/src proto-definitions/src/
COPY kitchen-service/pom.xml kitchen-service/

RUN --mount=type=cache,target=/root/.m2 \
    mvn -B dependency:go-offline -pl kitchen-service -am -q

COPY kitchen-service/src kitchen-service/src/
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B package -pl kitchen-service -am -DskipTests -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/kitchen-service/target/*.jar app.jar
EXPOSE 8081 9001
ENTRYPOINT ["java", "-jar", "app.jar"]
