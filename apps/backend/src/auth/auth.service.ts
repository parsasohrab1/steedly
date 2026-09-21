import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'crypto';
import { RegisterInput, User } from '@asbaan/shared';

interface StoredUser extends User {
  passwordHash: string; // `${saltHex}:${hashHex}`
}

/**
 * Minimal, real (not mocked) password auth: scrypt for hashing (Node's built-in,
 * no extra dependency) and an opaque bearer-token session store. This is enough
 * for a demo/MVP; a production deployment should move to JWT + refresh tokens
 * and a persistent session store (Redis), per the platform architecture doc.
 */
@Injectable()
export class AuthService {
  private usersByEmail = new Map<string, StoredUser>();
  private usersById = new Map<string, StoredUser>();
  private sessions = new Map<string, string>(); // token -> userId

  private hashPassword(password: string): string {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  private verifyPassword(password: string, stored: string): boolean {
    const [saltHex, hashHex] = stored.split(':');
    const hash = scryptSync(password, Buffer.from(saltHex, 'hex'), 64);
    const storedHash = Buffer.from(hashHex, 'hex');
    return hash.length === storedHash.length && timingSafeEqual(hash, storedHash);
  }

  register(input: RegisterInput): User {
    if (this.usersByEmail.has(input.email)) {
      throw new ConflictException(`User with email ${input.email} already exists`);
    }
    const user: StoredUser = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      phone: input.phone,
      roles: input.roles,
      bio: input.bio,
      credentialUrl: input.credentialUrl,
      createdAtIso: new Date().toISOString(),
      passwordHash: this.hashPassword(input.password),
    };
    this.usersByEmail.set(user.email, user);
    this.usersById.set(user.id, user);
    return this.toPublicUser(user);
  }

  login(email: string, password: string): { token: string; user: User } {
    const stored = this.usersByEmail.get(email);
    if (!stored || !this.verifyPassword(password, stored.passwordHash)) {
      throw new UnauthorizedException('ایمیل یا رمز عبور نادرست است');
    }
    const token = randomUUID();
    this.sessions.set(token, stored.id);
    return { token, user: this.toPublicUser(stored) };
  }

  validateToken(token: string | undefined): User | null {
    if (!token) return null;
    const userId = this.sessions.get(token);
    if (!userId) return null;
    const stored = this.usersById.get(userId);
    return stored ? this.toPublicUser(stored) : null;
  }

  findById(id: string): User | undefined {
    const stored = this.usersById.get(id);
    return stored ? this.toPublicUser(stored) : undefined;
  }

  findAll(): User[] {
    return [...this.usersById.values()].map((u) => this.toPublicUser(u));
  }

  /** Applies an approved user-profile contribution (see ContributionsService). */
  applyProfileField(userId: string, field: 'bio' | 'credentialUrl' | 'phone', value: string): void {
    const stored = this.usersById.get(userId);
    if (!stored) return;
    (stored as any)[field] = value;
  }

  private toPublicUser(stored: StoredUser): User {
    const { passwordHash: _omit, ...publicUser } = stored;
    return publicUser;
  }
}
