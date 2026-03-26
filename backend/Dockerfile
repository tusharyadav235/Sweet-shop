# ===========================
# STAGE 1: Build
# ===========================
FROM maven:3.9.4-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom first for dependency caching
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -q

# ===========================
# STAGE 2: Run
# ===========================
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy jar
COPY --from=builder /build/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/api/products || exit 1

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
