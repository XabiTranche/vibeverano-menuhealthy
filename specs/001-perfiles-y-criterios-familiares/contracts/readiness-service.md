# Contract: ReadinessService

**Module**: 001-perfiles-y-criterios-familiares
**Type**: Internal service interface

## Interface

```typescript
interface ReadinessService {
  checkReadiness(familyId: string): Promise<ReadinessResult>;
}

interface ReadinessResult {
  ready: boolean;
  familyId: string;
  totalActiveMembers: number;
  readyMembers: number;
  missing: MemberMissingData[];
}

interface MemberMissingData {
  memberId: string;
  memberName: string;
  missingFields: MissingField[];
}

type MissingField = 'name' | 'age' | 'sex' | 'restrictions_reviewed';
```

## Behavior Rules

- `checkReadiness`: Calcula on-demand, nunca persiste el resultado
- Un miembro se considera "ready" si tiene: name + age + sex + restricciones revisadas (puede ser 0 restricciones, pero el campo debe haber sido visitado/confirmado)
- La familia se considera "ready" si TODOS los miembros activos son "ready"
- Miembros archivados no cuentan para el cálculo
- `restrictions_reviewed`: Se marca como true cuando el usuario visita la pantalla de restricciones del miembro y confirma (aunque no añada ninguna)

## React Hook

```typescript
function useReadinessCheck(familyId: string): {
  result: ReadinessResult | null;
  loading: boolean;
  refresh: () => void;
}
```

- Se recalcula automáticamente cuando cambian los datos del hogar (observable via WatermelonDB)
