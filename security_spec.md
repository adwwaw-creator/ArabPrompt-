# Security Specification for ArabPrompt

## 1. Data Invariants

1. **Unique Visitor Counter Integrity**: 
   - Anyone can read the unique visitor count.
   - Any visitor can increment the visitor count, but strictly by exactly 1 or 0 (no large leaps or negative values allowed).
   - The visitor document id must be exactly `'global'`.

2. **User Profiles isolation**:
   - Registered users must only see, read, create, or update their own user profile document.
   - The document key `userId` must exactly equal the user's authenticated `request.auth.uid`.
   - Users cannot sign up with unverified emails or spoof their identities.

3. **User History Isolation**:
   - A user's prompt engineering history must strictly reside inside `/users/{userId}/history/{itemId}` where `{userId}` matches the authenticated user ID.
   - Users cannot view, write, update, or delete another user's prompt history.
   - Crucially, a history item can only be written if the parent user profile exists (`/users/{userId}`). This enforces membership and relational sync (Master Gate pattern).

4. **Timestamp Integrity**:
   - All server-tracked dates should be verified as valid strings or matching server time where applicable.

---

## 2. The "Dirty Dozen" Payloads

Here are twelve payloads designed to test data corruption, unauthorized query scraping, and profile spoofing, which have been blocked by our security rules design:

1. **Spoofed User Registration**: Attempting to create a user profile under `users/attacker_uid` with a Google Auth ID but targeting someone else's email.
2. **Ghost-Field Profile Infiltration**: Sending a registration payload containing a random privileged property (e.g., `isAdmin: true`).
3. **Malicious Empty ID Poisoning**: Trying to create a history item with a poisoned key (e.g. `../` or a 1.5KB string) to exhaust wallet resources/exploit path queries.
4. **History Theft Read**: Authenticated User B trying to execute `get` or `list` on `users/UserA/history/item123`.
5. **Unauthorized History Hijack**: Authenticated User B attempting to write history under `users/UserA/history/item123`.
6. **Negative Visitor De-increment**: Updating `/visitors/global` to decrement the counter (e.g. from 1530 to 1).
7. **Recursive Visitor Leap**: Attempting to increment the visitor counter by +100 in a single write.
8. **Invalid Data Type Poisoning**: Inserting boolean or numerical fields for textual prompt fields (e.g., setting `originalText` to `true`).
9. **String Overflow Denial-of-Wallet**: Writing a 2MB string for an optional field like `notes` to exhaust storage quotas.
10. **Spoofed Email Verification**: Creating a profile where `email_verified` is set to `true` on the database level, but `request.auth.token.email_verified` is `false`.
11. **Immortality Bypass**: Modifying the `createdAt` or `id` identifier of a saved prompt history item.
12. **Blanket Query Scraping**: Triggering an unrestricted query to list all users' histories without filtering by `userId` in the query's where-clause, hoping the security rules delegate validation to the client.
