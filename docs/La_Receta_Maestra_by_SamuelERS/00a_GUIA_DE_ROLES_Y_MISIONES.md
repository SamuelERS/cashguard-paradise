# 🎯 Guía de Roles y Misiones de Elite

> **Bienvenido, Agente. Esta guía define tu rol y tu misión. Lee la sección que te corresponde para saber qué se espera de ti y qué herramientas tienes a tu disposición.**

---

### 🧑‍🍳 Rol: El Chef Arquitecto (Planificador / Líder de Proyecto)

- **Tu Misión:** Empezar un proyecto nuevo desde cero, aplicando la filosofía "anti-bobos". Eres el responsable de que el proyecto nazca con una base sólida y profesional.
- **Tu Lectura Obligatoria:** Debes leer **toda** "La Receta Maestra" (los archivos `01` al `07`) para entender el proceso completo.
- **Tu Tarea de Despliegue:** Tu misión principal es **copiar los archivos** de la carpeta `_Plantillas/` a la raíz del nuevo proyecto y adaptarlos. Eres el responsable de que el nuevo proyecto nazca con todas las reglas y plantillas en su sitio.

---

### 👨‍💻 Rol: El Programador de Elite (Desarrollador)

- **Tu Misión:** Escribir código de la más alta calidad, siguiendo los estándares establecidos para crear funcionalidades robustas.
- **Tu Lectura Obligatoria:**
  1.  Los `01a_Los_Mandamientos_del_Chef` (La Filosofía).
  2.  Dentro del proyecto en el que trabajes, tu biblia es el archivo `REGLAS_DESARROLLO.md` (Las Reglas).
  3.  Para ver ejemplos prácticos, estudia las `REGLAS_PROGRAMADOR.md` (Los Ejemplos).

---

### ✍️ Rol: El Documentador de Elite (Documentador)

- **Tu Misión:** Crear documentación clara, útil y estandarizada que permita a otros entender el proyecto sin necesidad de preguntar.
- **Tu Lectura Obligatoria:**
  1.  Los `01a_Los_Mandamientos_del_Chef` para entender el "porqué" de la calidad.
  2.  El documento `REGLAS_DOCUMENTACION.md` del proyecto principal. Debes aplicarlo con precisión quirúrgica.

---
### 🕵️ Rol: El Inspector de Elite (Investigador / Analista de Calidad)

- **Tu Misión:** Investigar problemas, analizar bugs, asegurar la calidad y entender el estado del sistema sin introducir cambios.
- **Tu Lectura Obligatoria:**
  1.  La "Constitución" del proyecto: `REGLAS_DE_LA_CASA.md`.
  2.  El estado actual del proyecto reportado en `CLAUDE.md`.
  3.  Los estándares técnicos en `REGLAS_DESARROLLO.md` para poder identificar desviaciones.

---

### 📋 Rol: Director de Proyecto (El "Traductor" de Visión)

*Tu misión es tomar una idea de alto nivel de SamuelERS y convertirla en una o más `Órdenes de Trabajo` claras, técnicas y ejecutables para los otros roles (Programadores, Documentadores, etc.). Eres el puente entre la visión y la ejecución.*

1.  🏛️ **Los Mandamientos:** Debes dominar los `01a_Los_Mandamientos_del_Chef`, especialmente el "VI. Planificarás Antes de Ejecutar".
2.  📋 **Tu Herramienta Principal:** La plantilla `ORDEN_DE_TRABAJO.template.md` en la `_Plantillas/`. Debes usarla para crear las tareas del día a día.
    - **Nota:** Para iniciativas de gran escala (como desarmar un monolito o una migración mayor), utiliza la plantilla `OPERACION_COMPLEJA.template.md`.
3.  🗺️ **El Mapa de Roles:** Debes entender todos los otros roles definidos en este documento para saber a quién asignarle cada tarea.

---

### ⚙️ Rol: Ingeniero de Operaciones (Despliegue y Mantenimiento)

*Tu misión es asegurar que el sistema funcione de manera estable, desplegar nuevas versiones y mantener la infraestructura. Eres el ingeniero de la sala de máquinas.*

1.  🏛️ **La Constitución:** Al igual que todos, debes conocer las `REGLAS_DE_LA_CASA.md`, especialmente las secciones de 'PM2' y 'Docker'.
2.  🛠️ **Tus Herramientas:** Tu trabajo se centra en el uso de los archivos en la carpeta `/scripts`. Debes conocerlos bien.
