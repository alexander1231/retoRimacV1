const AWS = require('aws-sdk');
const axios = require('axios').default;
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'rimac-fusionados';

const index = async () => {
    try {
        // Obtener datos externos en paralelo
        const [swapiRes, pokeApiRes] = await Promise.all([
            axios.get('https://swapi.info/api/people'),
            axios.get('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=151'),
        ]);

        const nombres = swapiRes.data.map(p => p.name);
        const pokedex = pokeApiRes.data.results.map(p => ({ name: p.name, url: p.url }));

        // Obtener entrenadores aleatorios
        const entrenadores = getRandomElements(nombres, 5);

        const result = await Promise.all(entrenadores.map(async (nombre) => {
            const pokemones = getRandomElements(pokedex, 5);

            const item = {
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
const getRandomElements = (array, cantidad) => {
    return [...array].sort(() => 0.5 - Math.random()).slice(0, cantidad);
};

module.exports = {
    index,
};
