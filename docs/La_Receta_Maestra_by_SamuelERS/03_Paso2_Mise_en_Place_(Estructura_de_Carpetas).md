# 📂 Paso 2: La "Mise en Place" (Estructura de Carpetas Estándar)

---

## El Error a Evitar: El Cajón de los Trastos

Imagina una cocina donde no hay cajones para cubiertos, ni estanterías para platos. Todo está tirado en una gran caja. ¿Necesitas un tenedor? Buena suerte buscándolo.

Un proyecto sin una estructura de carpetas clara es ese cajón de los trastos. Ralentiza el desarrollo, confunde a los nuevos integrantes y hace imposible encontrar nada rápidamente.

## La Estructura de Carpetas "Anti-Bobos"

Esta es nuestra estructura base. Es el punto de partida para el 99% de los proyectos. No lo pienses, solo créala.

```
/nombre-del-proyecto
├── 📄 .env.example         # Plantilla de variables de entorno. NUNCA subas el .env real.
├── 📄 .gitignore           # Archivos y carpetas a ignorar por Git (node_modules, __pycache__, etc.).
├── 📄 README.md             # El manual de usuario: qué es, cómo se instala y cómo se usa.
├── 📄 package.json         # O pyproject.toml / requirements.txt para Python.
├── 📄 tsconfig.json         # O .eslintrc.json, ruff.toml, etc. Archivos de configuración de herramientas.
│
├── 📂 docs/                # Documentación del proyecto (como esta guía).
│
├── 📂 scripts/             # Scripts de utilidad (ej: deploy.sh, migrate-db.py).
│
├── 📂 src/                 # El CÓDIGO FUENTE. El corazón de la aplicación.
│   │
│   ├── 📂 api/             # Lógica de API (rutas, controladores, schemas de validación).
│   ├── 📂 core/            # Lógica de negocio central, servicios, modelos de dominio.
│   ├── 📂 lib/             # Utilidades genéricas, helpers, clientes de APIs externas.
│   ├── 📂 config/          # Lógica para cargar y gestionar la configuración de la app.
│   │
│   └── 📄 index.ts | main.py # Punto de entrada principal de la aplicación.
│
└── 📂 tests/               # TODOS los tests automatizados (unitarios, integración, e2e).
```

### Descripción de los Componentes Clave

- **`/src` (Source):** Aquí vive el alma de tu aplicación. La lógica que resuelve el problema de negocio. **Regla:** Ningún archivo en `/src` debe depender de un archivo en `/tests`.
- **`/tests`:** El seguro de calidad. Mantener los tests separados del código fuente hace que el despliegue sea más limpio (no despliegas código de prueba a producción) y la navegación más sencilla.
- **`/docs`:** El conocimiento del proyecto. Si una decisión de arquitectura fue compleja, si una guía de usuario es necesaria, vive aquí.
- **`/scripts`:** Los ayudantes del chef. Tareas que no son parte del core de la app pero que ayudan a gestionarla.
- **`/shared` (Opcional, para Monorepos):** En un proyecto con múltiples servicios (monorepo), esta carpeta es vital para alojar código compartido (interfaces de TypeScript, utilidades comunes, etc.) que puede ser usado por los diferentes servicios.
- **`.env.example`:** **CRÍTICO Y NO NEGOCIABLE.** Este archivo es un contrato. Le dice a cualquier desarrollador (o a ti mismo en 6 meses) qué variables de entorno se necesitan para que el proyecto funcione. Debe estar siempre actualizado.

---

## 🏁 La Regla de Oro "Anti-Bobos"

> **No reinventes la rueda en cada proyecto. Empieza con esta estructura. Si necesitas una carpeta nueva, pregúntate: "¿Realmente no encaja en ninguna de las existentes?". Sé consistente.**

## Siguiente Paso
→ Ver `04_Paso3_Herramientas_del_Chef_(Calidad_y_Automatizacion).md`
