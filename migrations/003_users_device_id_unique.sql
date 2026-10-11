-- Уникальный device_id для анонимных пользователей (задача 2.4)

CREATE UNIQUE INDEX IF NOT EXISTS users_device_id_unique_idx
  ON users (device_id)
  WHERE device_id IS NOT NULL;
