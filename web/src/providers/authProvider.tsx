"use client";

import * as React from "react";
import type { PermissionKey } from "@shared/index";
import { AuthContext } from "@/context/authContext";
import type { AuthContextValue, AuthState } from "@/types/auth";
import { getMe, loginRequest, logoutRequest } from "@/lib/authApi";
import {
  clearPersistedAuth,
  loadPersistedAuth,
  persistActiveSocietyId,
  persistAuth,
} from "@/lib/authStorage";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    status: "loading",
    token: null,
    user: null,
    societies: [],
    activeSocietyId: null,
  });

  const bootstrapped = React.useRef(false);

  React.useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const persisted = loadPersistedAuth();
    if (!persisted.token) {
      setState((s) => ({ ...s, status: "unauthenticated" }));
      return;
    }

    const activeSociety =
      persisted.societies.find((s) => s.societyId === persisted.activeSocietyId) ??
      persisted.societies[0] ??
      null;

    getMe(persisted.token, activeSociety?.societyToken ?? null)
      .then((me) => {
        setState({
          status: "authenticated",
          token: persisted.token,
          user: {
            id: me.id,
            email: me.email,
            displayName: me.displayName,
            isSuperAdmin: me.isSuperAdmin,
          },
          societies: persisted.societies,
          activeSocietyId: activeSociety?.societyId ?? null,
        });
      })
      .catch(() => {
        clearPersistedAuth();
        setState((s) => ({ ...s, status: "unauthenticated", token: null }));
      });
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    const activeSocietyId = result.societies[0]?.societyId ?? null;
    persistAuth(result.token, result.societies, activeSocietyId);
    setState({
      status: "authenticated",
      token: result.token,
      user: result.user,
      societies: result.societies,
      activeSocietyId,
    });
    return result.user;
  }, []);

  const logout = React.useCallback(async () => {
    const token = state.token;
    clearPersistedAuth();
    setState({
      status: "unauthenticated",
      token: null,
      user: null,
      societies: [],
      activeSocietyId: null,
    });
    if (token) await logoutRequest(token).catch(() => {});
  }, [state.token]);

  const switchSociety = React.useCallback((societyId: string) => {
    persistActiveSocietyId(societyId);
    setState((s) => ({ ...s, activeSocietyId: societyId }));
  }, []);

  const refreshMe = React.useCallback(async () => {
    setState((current) => {
      if (!current.token) return current;
      const activeSociety = current.societies.find((s) => s.societyId === current.activeSocietyId);
      getMe(current.token, activeSociety?.societyToken ?? null)
        .then((me) => {
          setState((s) => ({
            ...s,
            user: {
              id: me.id,
              email: me.email,
              displayName: me.displayName,
              isSuperAdmin: me.isSuperAdmin,
            },
          }));
        })
        .catch(() => {
          clearPersistedAuth();
          setState((s) => ({ ...s, status: "unauthenticated", token: null }));
        });
      return current;
    });
  }, []);

  const activeSociety = React.useMemo(
    () => state.societies.find((s) => s.societyId === state.activeSocietyId) ?? null,
    [state.societies, state.activeSocietyId],
  );

  const permissions = React.useMemo(
    () => new Set(activeSociety?.permissions ?? []),
    [activeSociety],
  );

  const has = React.useCallback(
    (permission: PermissionKey) => permissions.has(permission),
    [permissions],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      ...state,
      activeSociety,
      roles: activeSociety?.roles ?? [],
      permissions,
      has,
      login,
      logout,
      switchSociety,
      refreshMe,
    }),
    [state, activeSociety, permissions, has, login, logout, switchSociety, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
