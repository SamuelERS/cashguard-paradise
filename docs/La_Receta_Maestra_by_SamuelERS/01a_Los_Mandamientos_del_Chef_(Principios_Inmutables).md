# 🏛️ Los Mandamientos del Chef (Principios Inmutables)

---

> *"Estos no son pasos, son las leyes que gobiernan nuestra cocina. Son la filosofía que nos previene del caos y nos guía hacia la excelencia. Se leen una vez, se aplican siempre."*

---

### I. No Tocarás lo que Funciona en Vano (Principio de No Regresión)

Lo que está en producción y funciona es sagrado. Antes de modificarlo, debes tener una justificación clara y un plan de validación. Si tu cambio rompe algo, tu primera obligación es **revertir el cambio**, no "intentar arreglarlo rápido". Revierte, estabiliza y luego investiga con calma.

### II. Pausarás y Preguntarás ante la Duda

Ninguna suposición es buena. Es mil veces más rápido y barato preguntar que arreglar un error causado por asumir algo incorrectamente. El mantra es: `PAUSA · PREGUNTA · VALIDA`.

### III. La Calidad No Es Opcional

Los tests y la cobertura de código (`test coverage`) no son "tareas extra para cuando haya tiempo". Son parte integral de la receta. No se entrega un plato a medias; no se entrega código sin su debido seguro de calidad.

### IV. Harás Backups Antes de Cirugías Mayores

Antes de un cambio estructural masivo (ej: refactorizar un módulo entero, migrar una base de datos), harás un backup completo. Es tu red de seguridad. Un chef sin red de seguridad se quema. La carpeta `/Backups-RESPALDOS` existe por esta razón.

### V. Controlarás tus Dependencias con Intención

Las versiones de tus librerías (`package.json`, etc.) no son números al azar. Nunca actualices dependencias "a ciegas" (ej: `npm update`). Cada actualización debe ser una decisión consciente, justificada y probada. Fija tus versiones (`package-lock.json`) y actualiza solo cuando sea necesario y con un plan.

### VI. Planificarás Antes de Ejecutar

Ningún trabajo significativo empieza sin un plan (una `Task List` o lista de tareas). Define tus objetivos, los pasos y cómo sabrás que has terminado. Improvisar es para los artistas del jazz, planificar es para los ingenieros que construyen puentes.

**Para cumplir este mandamiento, utiliza la plantilla `ORDEN_DE_TRABAJO.template.md` que se encuentra en la "Bóveda de Plantillas" (`_Plantillas/`).**

### VII. Evolucionarás la Receta

Las herramientas y técnicas de hoy son el legado de mañana. Como Chef, tienes la responsabilidad no solo de seguir la receta, sino de proponer mejoras. Si descubres un ingrediente mejor o una técnica más rápida, tu deber es proponer una actualización a "La Receta Maestra".

---

Estos mandamientos son la base de la cocina "anti-bobos". Nos permiten ser ágiles sin ser caóticos y creativos sin generar desorden.
