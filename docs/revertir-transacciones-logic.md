# Lógica para Revertir (Eliminar) Transacciones de Venta

## ¿Qué hace el sistema actualmente?

Cuando un usuario elimina una transacción de venta, el sistema realiza los siguientes pasos:

1. **Elimina la transacción** de la tabla `transactions`.
2. **Elimina los `transaction_items`** relacionados a esa transacción.
3. **Ajusta el inventario** devolviendo la cantidad de cada producto vendido al batch más reciente (último lote activo) de ese producto y tienda.
   - Si no hay batches activos (todos tienen `quantity_remaining = 0`), se crea un nuevo batch para devolver esas unidades, usando el último costo conocido.
4. **Actualiza la cantidad total** en la tabla `store_inventory` para reflejar el nuevo stock.

## ¿Por qué se hace así?

- **Simplicidad:** Permite una implementación rápida y fácil de mantener, ideal para un MVP o piloto.
- **Velocidad:** Permite lanzar el producto y obtener feedback real de los usuarios antes de invertir en una solución más compleja.
- **Suficiente para la mayoría de tiendas pequeñas y medianas:** La trazabilidad perfecta de batches no es crítica en este contexto.

## Limitaciones de este enfoque

- **No hay trazabilidad de batches:** No se sabe exactamente de qué batch salió cada unidad vendida, por lo que al revertir, las unidades se devuelven al batch más reciente.
- **El costo promedio puede variar:** Si hay muchas devoluciones/reversiones, el costo promedio de inventario puede no ser exacto.
- **No apto para auditorías estrictas:** Si en el futuro se requiere trazabilidad perfecta (por auditoría, normatividad, o clientes grandes), será necesario migrar a una solución más robusta.

## ¿Qué hacer si se necesita mayor trazabilidad en el futuro?

- Implementar una tabla de movimientos de inventario o guardar en cada `transaction_item` de qué batch salió cada unidad.
- Al revertir, devolver exactamente las cantidades a los batches originales.
- Esto permite auditoría perfecta y control de costos por lote.

---

**Decisión tomada:**  
Se implementa la lógica sencilla para el MVP/piloto, documentando claramente el proceso y sus limitaciones.  
Si el negocio lo requiere, se migrará a la versión avanzada en el futuro.
