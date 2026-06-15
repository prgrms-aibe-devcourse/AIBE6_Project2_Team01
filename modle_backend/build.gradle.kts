plugins {
    java
    id("org.springframework.boot") version "3.5.15"
    id("io.spring.dependency-management") version "1.1.7"
    kotlin("jvm")
    kotlin("plugin.jpa") version "2.3.10"
    kotlin("plugin.spring") version "2.3.10"
}

group = "com"
version = "0.0.1-SNAPSHOT"
description = "modle_backend"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-web")
    compileOnly("org.projectlombok:lombok")
    runtimeOnly("com.mysql:mysql-connector-j")
    annotationProcessor("org.projectlombok:lombok")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testCompileOnly("org.projectlombok:lombok")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    testAnnotationProcessor("org.projectlombok:lombok")
    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")
    // GCP Storage 연동
    implementation("com.google.cloud:spring-cloud-gcp-starter-storage")
    // Redis
    implementation("org.springframework.boot:spring-boot-starter-data-redis")
    // Mail
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:2.8.9")

    // GCP Storage 연동
    implementation ("com.google.cloud:spring-cloud-gcp-starter-storage")

    dependencyManagement {
        imports {
            // GCP 라이브러리들의 버전 충돌을 막고 호환성을 맞춰주는 BOM 설정

            mavenBom("com.google.cloud:spring-cloud-gcp-dependencies:5.0.4")
        }

}

dependencyManagement {
    imports {
        mavenBom("com.google.cloud:spring-cloud-gcp-dependencies:5.0.4")
    }
}}

tasks.withType<Test> {
    useJUnitPlatform()}

