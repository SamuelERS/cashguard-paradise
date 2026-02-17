# 📚 Sistema de Documentación CashGuard Paradise

**Proyecto:** CashGuard Paradise - Sistema Anti-Fraude de Control de Efectivo  
**Empresa:** Paradise System Labs  
**Última reorganización:** Enero 2026  
**Versión del sistema:** v1.2 (Conforme a REGLAS_DOCUMENTACION.md)  
**Estructura:** Organización Modular por Categorías

---

## 🎯 Propósito de este Sistema

Este README es la **guía maestra** de navegación del sistema de documentación de CashGuard Paradise, organizado por categorías temáticas y casos de desarrollo.

**Para quién es este documento:**
- 👨‍💻 Desarrolladores buscando información técnica
- 🏗️ Arquitectos revisando decisiones de diseño
- 📊 Gerencia buscando trazabilidad de casos
- 🔍 Auditores revisando historial de cambios
- 🤖 Asistentes IA trabajando en el proyecto

---

## 📂 Nueva Estructura de Carpetas (v1.2)

La documentación se ha reorganizado para cumplir con el estándar **Anti-Bobos by SamuelERS**:

```
docs/
├── 📋 REGLAS_DOCUMENTACION.md    ← Reglas supremas
├── 📋 REGLAS_MOLDE_ORDENES_DE_TRABAJO.md
├── 📖 README.md                   ← Este archivo
│
├── 01_guias/                      ← Guías de uso y reglas generales (Casa, Estilo)
├── 02_arquitectura/               ← Documentación técnica profunda (Sentinel, Fundamentos)
├── 03_api/                        ← Documentación de interfaces y APIs
├── 04_desarrollo/                 ← Casos activos, testing, QA, reglas de dev
├── 05_operaciones/                ← Manuales operativos
│
├── _plantillas/                   ← Templates para nuevos casos
└── _archivo/                      ← Histórico de casos completados
    ├── 2025/                      ← Casos cerrados en 2025
    └── 2026/                      ← Casos cerrados en 2026
```

---

## 🚀 Navegación Rápida

### 👷‍♂️ Para Desarrolladores (`04_desarrollo/`)
Aquí encontrarás el trabajo en curso. Las reglas están en la raíz:
- **Testing y QA:** `04_desarrollo/Caso_Plan_Testing_Control_Calidad/`
- **Casos Activos:**
    - `Caso_Logica_Envios_Delivery`
    - `Caso_Evento_NoReportado_EnVuelto`
    - `EN_PROGRESO_Caso_Reporte_Enviar_Correo`
    - `Caso_Investigacion_Doble_Fuente_Catalogos_20260217`
- **Casos Completos (destino interno):**
    - `04_desarrollo/CASOS-COMPLETOS/`
- **Planes de implementación (TDD):**
    - `plans/`

### 🏗️ Arquitectura del Sistema (`02_arquitectura/`)
La base técnica inmutable y decisiones de alto nivel:
- **Documentación Técnica del Sistema:** `02_arquitectura/Caso_Documentacion_Tecnica_Sistema/`
- **Fundamentos:** `02_arquitectura/Caso_Fundamentos_Arquitectura_Legacy_20260205/`
- **Arquitectura Sentinel:** `02_arquitectura/Caso_Arquitectura_Sentinel_Legacy_20260205/`

### 📜 Reglas del Juego (En Raíz)
- **Reglas de Documentación:** `REGLAS_DOCUMENTACION.md`
- **Reglas de la Casa:** `REGLAS_DE_LA_CASA.md`
- **Reglas de Desarrollo:** `REGLAS_DESARROLLO.md`
- **Reglas de Programador:** `REGLAS_PROGRAMADOR.md`
- **Reglas de Inspección:** `REGLAS_INSPECCION.md`
- **Punto de Partida:** `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`

### 🗄️ Archivo Histórico (`_archivo/`)
Casos completados y cerrados. No modificar, solo consultar.
- **2025:** Todos los casos `COMPLETO_*` anteriores.

---

## 📋 Reglas de Organización

### **Estructura de un Caso Típico:**

Todo trabajo debe vivir dentro de una carpeta de caso (NUNCA archivos sueltos):

```
Caso_[Nombre_Del_Caso]_[YYYYMMDD]/
│
├── 00_README.md                 # ¡OBLIGATORIO! Estado del caso
├── 01_Diagnostico.md
├── 02_Solucion.md
└── ...
```

### **Nomenclatura:**
- `Caso_[Nombre]_[Fecha]` paralelos casos nuevos.
- `COMPLETO_Caso_[Nombre]` para casos cerrados (mover a `_archivo/`).

---

## 📊 Estadísticas del Proyecto

### **Calidad del Código**
- Tests passing: 100% ✅
- TypeScript errors: 0 ✅
- ESLint errors: 0 ✅

### **Compliance**
- ✅ NIST SP 800-115
- ✅ PCI DSS 12.10.1
- ✅ WCAG 2.1 AA

---

**Última actualización:** Febrero 2026
**Responsable:** Equipo de Desarrollo Paradise System Labs
**Filosofía:** "Orden y claridad ante todo."

**🙏 Gloria a Dios por el orden y la claridad en la documentación.**
