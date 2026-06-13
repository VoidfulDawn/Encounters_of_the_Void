FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY user-service/pom.xml user-service/pom.xml
COPY layout-service/pom.xml layout-service/pom.xml
COPY campaign-service/pom.xml campaign-service/pom.xml
COPY template-service/pom.xml template-service/pom.xml
COPY gateway/pom.xml gateway/pom.xml
COPY gateway/src gateway/src
RUN mvn -B package -DskipTests -pl gateway

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
