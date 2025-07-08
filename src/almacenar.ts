import { APIGatewayProxyHandler } from 'aws-lambda';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const TABLE_NAME = 'rimac-almacenar';
const dynamo = new AWS.DynamoDB.DocumentClient();

export const index: APIGatewayProxyHandler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'No se envió ningún contenido' }),
            };
        }

        const payload = JSON.parse(event.body);

        const item = {
            Id: uuidv4(),
            createdAt: new Date().toISOString(),
            data: payload, // lo que se quiera guardar
        };

        await dynamo.put({
            TableName: TABLE_NAME,
            Item: item,
        }).promise();

        return {
            statusCode: 201,
            body: JSON.stringify({ message: 'Datos almacenados con éxito', item }),
        };
    } catch (error: any) {
        console.error('Error al almacenar datos:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno al guardar los datos' }),
        };
    }
};
