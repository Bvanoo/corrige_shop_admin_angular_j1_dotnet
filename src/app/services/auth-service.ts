import { Service, signal } from '@angular/core';

@Service()
// Faux service d'authentification : un simple signal isAdmin que l'on bascule depuis la sidebar
export class AuthService {
  private _isAdmin = signal(false);
  isAdmin = this._isAdmin.asReadonly();

  toggleAdmin() {
    this._isAdmin.update((value) => !value);
  }
}