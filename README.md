# Gym Metrics

Gym Metrics es una aplicación de escritorio nativa diseñada para optimizar la carga y el análisis de datos de entrenamiento personal. Permite importar de forma rápida y sencilla sesiones de entrenamiento, validarlas y guardarlas en una base de datos local SQLite para posteriormente visualizar métricas clave sobre la progresión de cargas, volumen y recuperación a través de un dashboard analítico.

## Características Principales

- **Carga Rápida de Sesiones**: Interfaz Drag & Drop para importar sesiones de entrenamiento.
- **Previsualización de Datos**: Interfaz de tabla intuitiva para confirmar y ajustar detalles de la sesión antes de guardarla de manera transaccional.
- **Dashboard Analítico**: Gráficos detallados y personalizables para evaluar tendencias de rendimiento y progresión.
- **Privacidad Local**: Todos los datos se gestionan y guardan localmente en tu sistema a través de SQLite.

## Stack Tecnológico

Este proyecto ha sido desarrollado utilizando un stack moderno enfocado en rendimiento y seguridad:

- **Frontend**: React 19, TypeScript, Vite.
- **Estilos**: Tailwind CSS v4.
- **Backend / Core**: Tauri 2 (Rust).
- **Gestión de Estado**: Zustand.
- **Validación**: Zod.
- **Métricas y Visualización**: Recharts.
- **Iconografía**: Lucide React.
- **Paquetería**: pnpm.

## Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar el entorno de desarrollo:

- [Node.js](https://nodejs.org/) (recomendado LTS)
- [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/) (y las dependencias de sistema necesarias para Tauri)

## Desarrollo Local

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Iniciar el servidor de desarrollo y la aplicación de escritorio:
   ```bash
   pnpm tauri dev
   ```

## Compilación

Para compilar la aplicación para tu sistema operativo:

```bash
pnpm tauri build
```
Los ejecutables generados se encontrarán dentro de la carpeta `src-tauri/target/release/`.
