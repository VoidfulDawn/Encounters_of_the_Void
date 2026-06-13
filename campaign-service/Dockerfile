FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .
COPY user-service/pom.xml user-service/pom.xml
COPY layout-service/pom.xml layout-service/pom.xml
COPY campaign-service/pom.xml campaign-service/pom.xml
COPY template-service/pom.xml template-service/pom.xml
COPY gateway/pom.xml gateway/pom.xml
COPY campaign-service/src campaign-service/src
RUN ./mvnw -q package -DskipTests -pl campaign-service

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/campaign-service/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
