"use client";

import * as React from "react";
import type { MeResponse, PermissionKey, SocietyMembership } from "@shared/index";
import { AuthContext } from "@/context/authContext";
import type { AuthContextValue, AuthState } from "@/types/auth";
import { getMe, loginRequest, logoutRequest } from "@/lib/authApi";
import { roles as previewableRoles } from "@/lib/rolesMockData";
import {
  clearPersistedAuth,
  loadPersistedAuth,
  loadPersistedPreviewRole,
  persistActiveSocietyId,
  persistAuth,
  persistPreviewRole,
} from "@/lib/authStorage";

/** Merges the fresh roles/permissions `getMe()` returns for the currently active society back
 * into the cached membership list, so a stale localStorage snapshot (e.g. from before a new
 * permission was added to a role) self-heals on the next session restore instead of requiring
 * the user to manually log out and back in. Targets the society explicitly (the one `getMe` was
 * called with the token for), rather than matching on `me.societyId` — safer than relying on an
 * id round-tripping identically across the async boundary. */
function withRefreshedActiveSociety(
  societies: SocietyMembership[],
  targetSocietyId: string | null,
  me: MeResponse,
): SocietyMembership[] {
  if (!targetSocietyId) return societies;
  return societies.map((s) =>
    s.societyId === targetSocietyId ? { ...s, roles: me.roles, permissions: me.permissions } : s,
  );
}

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
        const societies = withRefreshedActiveSociety(
          persisted.societies,
          activeSociety?.societyId ?? null,
          me,
        );
        persistAuth(persisted.token!, societies, persisted.activeSocietyId);
        setState({
          status: "authenticated",
          token: persisted.token,
          user: {
            id: me.id,
            email: me.email,
            displayName: me.displayName,
            isSuperAdmin: me.isSuperAdmin,
          },
          societies,
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

  const [previewRole, setPreviewRoleState] = React.useState<string | null>(null);
  const [isSwitchingPreview, setIsSwitchingPreview] = React.useState(false);

  // Restores the previewed role across a page refresh — previewRole itself is plain React
  // state, which resets to null on every mount, so without this a refresh silently dropped
  // back to the real logged-in role instead of staying on whatever was being previewed.
  // Deliberately an effect, not a lazy useState initializer: localStorage isn't available
  // during SSR, so reading it in the render body would mismatch the server-rendered HTML.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewRoleState(loadPersistedPreviewRole());
  }, []);

  const setPreviewRole = React.useCallback((role: string | null) => {
    setIsSwitchingPreview(true);
    window.setTimeout(() => {
      persistPreviewRole(role);
      setPreviewRoleState(role);
      setIsSwitchingPreview(false);
    }, 550);
  }, []);

  const logout = React.useCallback(async () => {
    const token = state.token;
    clearPersistedAuth();
    setPreviewRoleState(null);
    setState({
      status: "unauthenticated",
      token: null,
      user: null,
      societies: [],
      activeSocietyId: null,
    });
    if (token) await logoutRequest(token).catch(() => {});
  }, [state.token]);

  const [isSwitchingSociety, setIsSwitchingSociety] = React.useState(false);

  const switchSociety = React.useCallback((societyId: string) => {
    setIsSwitchingSociety(true);
    window.setTimeout(() => {
      persistActiveSocietyId(societyId);
      setState((s) => ({ ...s, activeSocietyId: societyId }));
      persistPreviewRole(null);
      setPreviewRoleState(null);
      setIsSwitchingSociety(false);
    }, 500);
  }, []);

  const refreshMe = React.useCallback(async () => {
    setState((current) => {
      if (!current.token) return current;
      const activeSociety = current.societies.find((s) => s.societyId === current.activeSocietyId);
      getMe(current.token, activeSociety?.societyToken ?? null)
        .then((me) => {
          setState((s) => {
            const societies = withRefreshedActiveSociety(
              s.societies,
              activeSociety?.societyId ?? null,
              me,
            );
            if (s.token) persistAuth(s.token, societies, s.activeSocietyId);
            return {
              ...s,
              societies,
              user: {
                id: me.id,
                email: me.email,
                displayName: me.displayName,
                isSuperAdmin: me.isSuperAdmin,
              },
            };
          });
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

  const permissions = React.useMemo(() => {
    if (previewRole) {
      const preview = previewableRoles.find((r) => r.name === previewRole);
      if (preview) return new Set(preview.permissions);
    }
    return new Set(activeSociety?.permissions ?? []);
  }, [activeSociety, previewRole]);

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
      isSwitchingSociety,
      previewRole,
      setPreviewRole,
      isSwitchingPreview,
      refreshMe,
    }),
    [
      state,
      activeSociety,
      permissions,
      has,
      login,
      logout,
      switchSociety,
      isSwitchingSociety,
      previewRole,
      setPreviewRole,
      isSwitchingPreview,
      refreshMe,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
