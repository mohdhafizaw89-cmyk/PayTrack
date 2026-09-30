# Security Specification: PayTrack RightsFlow

## 1. Data Invariants

1. **User Identity Invariant**: Documents in `/programmes/{programmeId}` and `/emailNotifications/{notificationId}` MUST belong to an authenticated user (`userId == request.auth.uid`). Users can NEVER impersonate another user or assign a foreign `userId`.
2. **User Profile Isolation**: Access to `/users/{userId}` is strictly restricted to the user whose UID matches `{userId}` (`request.auth.uid == userId`). PII is isolated from non-owners.
3. **Immutability of IDs & Timestamps**: The `id`, `userId`, and `createdAt` fields cannot be mutated or reassigned upon update (`incoming().userId == existing().userId`).
4. **Boundary and Size Constraints**: All string fields are constrained with `.size() <= MAX` to prevent resource exhaustion and Denial-of-Wallet attacks.
5. **Path Validation**: Document IDs must conform to `isValidId()` (`^[a-zA-Z0-9_\\-]+$`, `<= 128` chars).
6. **Milestone Array Invariant**: The `milestones` array cannot exceed 20 entries to prevent unbounded storage spikes.
7. **Query Enforcer**: `allow list` explicitly validates `resource.data.userId == request.auth.uid`, ensuring cross-tenant scraping is strictly disallowed.

---

## 2. The "Dirty Dozen" Malicious Payloads

1. **Payload 1 (Unauthenticated Write)**: Write to `/programmes/prog_1` with no active `request.auth`. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (User ID Impersonation on Create)**: User `victim_123` authenticated, but payload sets `userId: "attacker_999"`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Cross-Tenant List Scraping)**: User `user_A` queries `/programmes` without `where('userId', '==', 'user_A')`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Overlong ID Poisoning)**: Document path `/programmes/{long_string_>128_chars}`. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Denial of Wallet - 2MB String Injection)**: Injecting 2MB text into `title` or `vendor`. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Shadow Key Update Injection)**: Updating `/programmes/prog_1` with unauthorized ghost field `isAdmin: true` or `bypassed: true`. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Unbounded Milestones Flood Attack)**: Sending `milestones` array containing 500 items. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (Foreign User Profile Snooping)**: User `user_A` attempting `get` on `/users/user_B`. Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Owner Identity Hijacking on Update)**: Modifying existing programme to change `userId` to attacker's UID. Expected: `PERMISSION_DENIED`.
10. **Payload 10 (Direct Path Variable Injection with Invalid Characters)**: Document path `/programmes/../../../root`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Notification Spoofing)**: Submitting notification record for an arbitrary user. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Foreign Programme Deletion)**: Authenticated user attempting to delete a programme belonging to another user. Expected: `PERMISSION_DENIED`.

---

## 3. Test Runner Specification (`firestore.rules.test.ts`)

```typescript
import { describe, it, expect, beforeAll } from 'vitest';

describe('Firestore Security Rules - Dirty Dozen Validation', () => {
  it('Payload 1: Should deny unauthenticated write to programmes', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 2: Should deny spoofed userId on programme creation', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 3: Should deny listing programmes without matching userId', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 4: Should deny document IDs exceeding length limits', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 5: Should deny oversized string payload in title', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 6: Should deny updates containing unregistered ghost fields', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 7: Should deny milestones list exceeding maximum size', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 8: Should deny foreign user reading another users private profile', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 9: Should deny modifying the immutable userId of an existing programme', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 10: Should deny invalid characters in document paths', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 11: Should deny creating notification record under foreign userId', async () => {
    // Expect PERMISSION_DENIED
  });

  it('Payload 12: Should deny deleting a programme owned by another user', async () => {
    // Expect PERMISSION_DENIED
  });
});
```
