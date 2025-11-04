# CHANGELOG

## Unreleased

- README ориентирован на production-использование (убраны dev-инструкции)
- Добавлен `docs/dev.md` с инструкциями по разработке и dev-режиму
- Уточнены prod URL и Docker Compose команды в README
- В разделе env добавлено упоминание `TZ` и что источником истины является `.env.production.example`
 - Добавлен модуль Translate: REST-эндпоинт `POST /{API_BASE_PATH}/{API_VERSION}/translate`
 - Реализован провайдер Google Translate и абстракция провайдеров
 - Конфиг `translation.config.ts`: `TRANSLATE_DEFAULT_PROVIDER`, `TRANSLATE_MAX_TEXT_LENGTH`
 - Тесты: unit (DTO, сервис), e2e (translate, health)
 - README переписан на английском, ориентирован на production
 - Добавлена документация API (docs/api.md)

## 0.15.0 — Boilerplate refactor

- Полностью удалены функциональности STT, GraphQL и Auth
- Оставлен только модуль Health (простой health-check)
- Упрощены конфиги окружения (`.env.*`)
- Обновлён `AppModule` и логирование (service: `nestjs-boilerplate`)
- Очищены и пересобраны тесты (unit + e2e только для health)
- Переработан `docker-compose.yml` до минимального примера (локальная сборка)
- Обновлён `README.md` (рус.)
- Удалены устаревшие документы в `docs/` (STT/Auth/GraphQL)
