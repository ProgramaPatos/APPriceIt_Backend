# Generar Cliente de la API para frontend

A partir de la especificacion de OpenApi generada por nest-swagger se puede generar el cliente para el front:

1. Instala openapi-generator cli (`openapi-generator-cli generate -i http://localhost:3000/api-yaml -g typescript-axios -o <path to front client dir> -c config.json`).
2. Corre el servidor y utiliza el comando `openapi-generator-cli generate -i http://localhost:3000/api-yaml -g typescript-axios -o <path/to/front/>/src/services/api -c path/to/config.json` (el config.json está en el mismo directorio que este README)
