
import AWS from 'aws-sdk';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'rimac-fusionados';
const TABLE_NAME_HISTORY = 'rimac-Historial';
const redis = new Redis.Cluster(
    [{ host: 'retorimac-redis.y4gvft.clustercfg.use1.cache.amazonaws.com', port: 6379 }],
);

// Tipos
interface SwapiPerson {
    name: string;
    [key: string]: any;
}

interface Pokemon {
    name: string;
    url: string;
}

interface EntrenadorConPokemones {
    Id: string;
    name: any;
    pokemones: Pokemon[];
}

// Función Lambda principal
export const index = async (): Promise<{ statusCode: number; body: string }> => {
    try {

        const pong = await redis.ping();
        console.log('Redis responde:', pong);
        const cachedSwapi = await redis.get('swapi-data');
        const cachedPokeApi = await redis.get('pokeapi-data');

        let swapiData: SwapiPerson[];
        let pokeData: Pokemon[];

        if (cachedSwapi && cachedPokeApi) {
            swapiData = JSON.parse(cachedSwapi);
            pokeData = JSON.parse(cachedPokeApi);

            console.log('Usando datos desde Redis cache');
        } else {
            const [swapiRes, pokeApiRes] = await Promise.all([
                axios.get('https://swapi.info/api/people'),
                axios.get('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=10'),
            ]);

            swapiData = swapiRes.data.map((p: SwapiPerson) => p.name)
            pokeData = pokeApiRes.data.results;


            await redis.set('swapi-data', JSON.stringify(swapiData), 'EX', 1800);
            await redis.set('pokeapi-data', JSON.stringify(pokeData), 'EX', 1800);
            console.log('Datos cacheados en Redis');
        }

        let entrenadores : SwapiPerson[] = getRandomElements(swapiData, 5);


        const result: EntrenadorConPokemones[] = await Promise.all(entrenadores.map(async (nombre) => {
            const pokemones: Pokemon[] = getRandomElements(pokeData, 5);

            const item: EntrenadorConPokemones = {
                Id: uuidv4(),
                name: nombre,
                pokemones,
            };

            // Guardar en DynamoDB
            await dynamodb.put({
                TableName: TABLE_NAME,
                Item: item,
            }).promise();

            return item;
        }));

        // Guardar History en DynamoDB
        const Id = uuidv4();
        await dynamodb.put(
            {
                TableName: TABLE_NAME_HISTORY,
                Item: {Id,history: result, createdAt: new Date().toISOString()},
            }
        ).promise()

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error("Error en index:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Ocurrió un error al procesar la solicitud." }),
        };
    }
};

// Función para obtener elementos aleatorios
export function getRandomElements<T>(array: T[], cantidad: number): T[] {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, cantidad);
}
