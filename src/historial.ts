import { APIGatewayProxyHandler } from "aws-lambda";
import AWS from 'aws-sdk';

const TABLE_NAME_HISTORY = 'rimac-Historial';
const dynamo = new AWS.DynamoDB.DocumentClient();

export const index: APIGatewayProxyHandler   = async (event, context, callback): Promise<any> => {
    const limit = Number(event.queryStringParameters?.limit || 10);
    const lastKey  = event.queryStringParameters?.lastKey
        ? JSON.parse(decodeURIComponent(event.queryStringParameters.lastKey))
        : undefined;
    const order = event.queryStringParameters?.order || 'asc';

    try {
        const params: AWS.DynamoDB.DocumentClient.ScanInput = {
            TableName: TABLE_NAME_HISTORY,
            Limit: limit,
            ExclusiveStartKey: lastKey,
        };

        const result = await dynamo.scan(params).promise();

        const getTime = (item: any) => Date.parse(item.createdAt || item.CreatedAt || '');

        // Ordenamiento robusto por CreatedAt usando Date.parse
        const sortedItems = (result.Items || []).sort((a, b) => {
            const aTime = getTime(a);
            const bTime = getTime(b);

            if (isNaN(aTime) || isNaN(bTime)) return 0;

            return order === 'desc' ? bTime - aTime : aTime - bTime;
        });

        console.log(sortedItems)

        return {
            statusCode: 200,
            body: JSON.stringify({
                data: sortedItems,
                lastKey: result.LastEvaluatedKey
                    ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
                    : null,
            }),
        };
    } catch (error: any) {
        console.error('DynamoDB query error', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error al obtener historial' }),
        };
    }
}
