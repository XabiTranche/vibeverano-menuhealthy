# Contract: ApprovalService

**Spec**: [../spec.md](../spec.md) | **Plan**: [../plan.md](../plan.md) | **Research**: [../research.md](../research.md)

## Responsabilidad

Gestión del ciclo de vida de aprobación de menús semanales. Controla las transiciones de estado (draft → approved → replaced), garantiza unicidad del menú vigente por familia/semana, y maneja la marcación de incompatibilidades.

## Interface

```typescript
interface ApprovalService {
  /**
   * Aprueba una propuesta, marcándola como menú vigente de la semana.
   * 
   * Precondiciones:
   * - La propuesta debe estar en estado draft
   * - No debe existir otro menú aprobado para el mismo familyId + rango solapado
   * 
   * @throws AlreadyApprovedError - Si ya hay un menú aprobado para esa semana
   * @throws InvalidStateError - Si la propuesta no está en estado draft
   */
  approveProposal(proposalId: string): Promise<PlannedWeek>;

  /**
   * Reemplaza un menú aprobado por una nueva propuesta.
   * 
   * Flujo:
   * 1. El menú vigente pasa a status: replaced
   * 2. La nueva propuesta pasa a status: approved
   * 3. Se establece replacedBy en el menú antiguo
   * 
   * @throws NotApprovedError - Si el weekId no tiene status approved
   * @throws InvalidStateError - Si el newProposalId no está en estado draft
   */
  replaceApproved(weekId: string, newProposalId: string): Promise<PlannedWeek>;

  /**
   * Obtiene el menú aprobado vigente para una familia y rango de fechas.
   * 
   * Busca PlannedWeek con status: approved cuyo rango se solape
   * con el dateRange proporcionado.
   * 
   * @returns PlannedWeek si existe, null si no hay menú aprobado
   */
  getApprovedWeek(familyId: string, dateRange: DateRange): Promise<PlannedWeek | null>;

  /**
   * Marca un menú vigente como incompatible por cambio de perfil.
   * 
   * El menú sigue visible y vigente, pero con flag de advertencia.
   * El usuario decide si replanifica o lo mantiene.
   * 
   * @throws NotApprovedError - Si el weekId no tiene status approved
   */
  markIncompatible(weekId: string, reason: IncompatibilityReason): Promise<void>;
}
```

## Tipos

```typescript
interface DateRange {
  startDate: string;  // ISO 8601 date
  endDate: string;    // ISO 8601 date
}

interface PlannedWeek {
  id: string;
  familyId: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'approved' | 'incompatible' | 'replaced';
  approvedAt: string | null;
  replacedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface IncompatibilityReason {
  memberId: string;           // Miembro cuyo perfil cambió
  changeType: string;         // Tipo de cambio (ej: "restriction_added")
  affectedMeals: string[];    // IDs de PlannedMeal afectadas
  description: string;        // Descripción legible del conflicto
}
```

## Errores

```typescript
class AlreadyApprovedError extends Error {
  existingWeekId: string;     // ID del menú ya aprobado
  familyId: string;
  dateRange: DateRange;
}

class NotApprovedError extends Error {
  weekId: string;
  currentStatus: string;      // Estado actual del PlannedWeek
}

class InvalidStateError extends Error {
  entityId: string;
  expectedStatus: string;
  actualStatus: string;
}
```

## Transiciones de estado

```text
┌─────────┐
│  draft  │
└────┬────┘
     │ approveProposal()
     ▼
┌──────────┐
│ approved │ ◄─── único por familia + semana solapada
└────┬─────┘
     │
     ├── replaceApproved() ──► status: replaced (+ replacedBy set)
     │                          nuevo PlannedWeek: approved
     │
     └── markIncompatible() ──► status: incompatible
                                 (sigue vigente con warning)
```

## Reglas de negocio

| Regla | Descripción |
|-------|-------------|
| Unicidad | Solo un PlannedWeek `approved` por `familyId` + rango solapado |
| Inmutabilidad replaced | Un PlannedWeek `replaced` no puede volver a `approved` |
| Incompatible mantiene vigencia | El menú sigue activo hasta que el usuario replanifique |
| Aprobación idempotente | Aprobar un menú ya aprobado retorna el mismo sin error |
| Timestamp | `approvedAt` se establece en el momento de la aprobación |
| Historial | Los menús replaced se conservan indefinidamente para referencia |

## Comportamiento por escenario

| Escenario | Resultado |
|-----------|-----------|
| Aprobar draft sin conflicto | ✅ Status → approved, approvedAt set |
| Aprobar draft con otro ya aprobado | ❌ AlreadyApprovedError (usar replace) |
| Replace menú aprobado | ✅ Antiguo → replaced, nuevo → approved |
| Replace menú no aprobado | ❌ NotApprovedError |
| Mark incompatible menú aprobado | ✅ Status → incompatible, reason stored |
| Mark incompatible menú draft | ❌ NotApprovedError |
| Get approved sin resultado | ✅ Retorna null |
| Operación offline | ✅ Funciona local, sync posterior |

## Dependencias

- **PlannedWeekRepository**: persistencia y queries sobre PlannedWeek
- **MenuProposalRepository**: acceso a propuestas
- **SyncService**: sincronización de cambios de estado al backend
- **NotificationService**: notificar a otros miembros del hogar sobre cambios
