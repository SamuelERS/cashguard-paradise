import anthropic
import os
import subprocess
import sys

client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

try:
    with open('test-failure-logs.txt', 'r') as f:
        test_logs = f.read()
except FileNotFoundError:
    test_logs = "No se pudieron obtener logs"

def get_file_tree():
    try:
        result = subprocess.run(['find', '.', '-type', 'f', '-not', '-path', '*/node_modules/*', '-not', '-path', '*/.git/*'], 
                              capture_output=True, text=True, timeout=10)
        return result.stdout
    except:
        return "Error obteniendo árbol"

file_tree = get_file_tree()

prompt = f"""Eres un experto desarrollador del proyecto cashguard-paradise.

CONTEXTO DEL PROYECTO:
- Nombre: cashguard-paradise (PWA Calculadora de Cortes y Caja)
- Stack: React + TypeScript + Playwright + Tailwind CSS
- Propósito: Herramienta profesional para comercios
- Valores: Código limpio, profesional, escalable

FALLO DETECTADO:
Workflow: {os.environ.get('FAILED_WORKFLOW')}
Branch: {os.environ.get('FAILED_BRANCH')}

Logs del Test:
```
{test_logs[:5000]}
```

Estructura del Proyecto:
```
{file_tree[:3000]}
```

TU MISIÓN:
1. Analiza los logs y estructura
2. Identifica la causa raíz del fallo
3. Propón una corrección MÍNIMA y QUIRÚRGICA
4. Genera el código específico a modificar

RESTRICCIONES:
- NO refactorices código no relacionado
- Mantén el estilo existente
- Comentarios en ESPAÑOL
- Cambios pequeños y específicos

FORMATO DE RESPUESTA (solo JSON):
{{
  "analysis": "Explicación breve",
  "root_cause": "Causa raíz",
  "files_to_modify": [
    {{
      "path": "ruta/archivo.ts",
      "current_code": "código actual",
      "new_code": "código nuevo",
      "reason": "por qué este cambio"
    }}
  ],
  "confidence": "high/medium/low",
  "additional_notes": "notas adicionales"
}}

Responde SOLO con el JSON, sin texto adicional."""

print("🤖 Llamando a Claude Sonnet 4.5...")
try:
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )
    
    response_text = message.content[0].text
    print("✅ Respuesta recibida")
    
    with open('claude_response.json', 'w') as f:
        f.write(response_text)
    
    print(f"💰 Tokens: {message.usage.input_tokens} in, {message.usage.output_tokens} out")
    
except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
