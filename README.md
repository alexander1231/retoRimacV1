<!--
title: 'Serverless Framework Node Express API service backed by DynamoDB on AWS'
description: 'This template demonstrates how to develop and deploy a simple Node Express API service backed by DynamoDB running on AWS Lambda using the Serverless Framework.'
layout: Doc
framework: v4
platform: AWS
language: nodeJS
priority: 1
authorLink: 'https://github.com/serverless'
authorName: 'Serverless, Inc.'
authorAvatar: 'https://avatars1.githubusercontent.com/u/13742415?s=200&v=4'
-->

# Serverless Framework Node Express API on AWS

endpoints:
  GET - https://fc49wyj738.execute-api.us-east-1.amazonaws.com/fusionados
  POST - https://fc49wyj738.execute-api.us-east-1.amazonaws.com/almacenar
  GET - https://fc49wyj738.execute-api.us-east-1.amazonaws.com/historial
  GET - https://fc49wyj738.execute-api.us-east-1.amazonaws.com/swagger
  GET - https://fc49wyj738.execute-api.us-east-1.amazonaws.com/swagger.json
functions:
  fusionados: retoRimacV1-dev-fusionados (22 MB)
  almacenar: retoRimacV1-dev-almacenar (22 MB)
  historial: retoRimacV1-dev-historial (22 MB)
  swaggerUI: retoRimacV1-dev-swagger-ui (22 MB)
  swaggerJSON: retoRimacV1-dev-swagger-json (22 MB)


