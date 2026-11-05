# Saga Lab

## Estructura

- `src/config`: variables de entorno.
- `src/infrastructure`: PostgreSQL, RabbitMQ, métricas y logging.
- `src/http`: endpoints transversales de salud y métricas.
- `src/modules/orchestrator`: rutas REST, servicio de aplicación y repositorio.
- `src/modules/{order,inventory,payment}`: handlers y repositorios por dominio.
- `src/bootstrap.js`: composición de dependencias e inicialización.
- `src/index.js`: punto de entrada mínimo.
- `observability`: configuración de Prometheus y Grafana.

## Ejecución

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f orchestrator
```

## Pruebas

```bash
npm install
npm test
npm run check
```

## Ejemplo de solicitud

```bash
curl -X POST http://localhost:8080/orders -H "Content-Type: application/json" -d '{"id":"ORD-1002","amount":150,"failPayment":true}'
curl http://localhost:8080/sagas/ORD-1002
```

## Servicios

- API: http://localhost:8080
- RabbitMQ: http://localhost:15672 (guest/guest)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin_dev)