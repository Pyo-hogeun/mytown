// swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API Docs",
      version: "1.0.0",
      description: "express + Next.js API 문서",
    },
    servers: [
      { url: "http://localhost:5001/api" }, // Express API base URL
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT", // JWT 인증 사용
        },
      },
      schemas: {
        Store: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "64c1234abc1234def5678901",
            },
            name: {
              type: "string",
              example: "행복마트",
            },
            address: {
              type: "string",
              example: "서울시 강남구 테헤란로 123",
            },
            phone: {
              type: "string",
              example: "02-1234-5678",
            },
            owner: {
              type: "string",
              example: "64c9876def9876abc5432109",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              example: "650abcd1234ef567890abcd1",
            },
            store: {
              type: "string",
              example: "64c1234abc1234def5678901",
            },
            name: {
              type: "string",
              example: "사과",
            },
            price: {
              type: "number",
              example: 3500,
            },
            stockQty: {
              type: "integer",
              example: 120,
            },
            imageUrl: {
              type: "string",
              example: "https://example.com/apple.jpg",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js"], // API 주석이 있는 라우트 파일 경로
};

const swaggerSpec = swaggerJSDoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
