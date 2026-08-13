# Contract: FamilyService

**Module**: 001-perfiles-y-criterios-familiares
**Type**: Internal service interface

## Interface

```typescript
interface FamilyService {
  // CRUD Familia
  createFamily(input: CreateFamilyInput): Promise<Family>;
  getFamily(familyId: string): Promise<Family | null>;
  updateFamily(familyId: string, input: UpdateFamilyInput): Promise<Family>;

  // CRUD Miembros
  addMember(familyId: string, input: CreateMemberInput): Promise<FamilyMember>;
  updateMember(memberId: string, input: UpdateMemberInput): Promise<FamilyMember>;
  archiveMember(memberId: string): Promise<void>;
  reactivateMember(memberId: string): Promise<void>;
  getActiveMembers(familyId: string): Promise<FamilyMember[]>;
  getAllMembers(familyId: string): Promise<FamilyMember[]>; // incluye archivados

  // Configuración de momentos de comida
  updateMealTypes(familyId: string, mealTypes: MealType[]): Promise<Family>;
}

interface CreateFamilyInput {
  name: string;
}

interface UpdateFamilyInput {
  name?: string;
}

interface CreateMemberInput {
  name: string;
  age: number;
  sex: 'male' | 'female' | 'other';
}

interface UpdateMemberInput {
  name?: string;
  age?: number;
  sex?: 'male' | 'female' | 'other';
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
```

## Behavior Rules

- `createFamily`: Asocia la familia al usuario autenticado actual como owner
- `archiveMember`: Sets `archivedAt` = now. No elimina datos.
- `reactivateMember`: Sets `archivedAt` = null
- `getActiveMembers`: Filtra por `archivedAt IS NULL`
- Todas las operaciones funcionan offline (se ejecutan en SQLite local)
