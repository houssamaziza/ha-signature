"use client";

import { useState, type ChangeEvent } from "react";
import type { LegalInfo } from "@/shared/schemas/legal";
import type { UserDTO } from "@/shared/types/admin";
import { api } from "./client-api";
import { Toggle } from "./Toggle";
import { Button, Card, Field, Notice, Pill, inputClass, textareaClass } from "./ui";
import { useSave } from "./useSave";

export type SettingsValues = {
  siteName: string; tagline: string; accentColor: string; phone: string; whatsappNumber: string; whatsappMessage: string;
  email: string; officeAddress: string; seoTitle: string; seoDescription: string;
};

const ACCENTS = ["#8A4B24", "#2F5D50", "#1F3A5F"];

export function SettingsForm({ initial, canEdit }: { initial: SettingsValues; canEdit: boolean }) {
  const [v, setV] = useState(initial);
  const { saving, notice, run, fieldError } = useSave();
  const f = (k: keyof SettingsValues) => ({
    value: v[k],
    disabled: !canEdit,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value }),
  });

  return (
    <div className="flex flex-col gap-6">
      <Card title="Coordonnées" subtitle="Affichées sur toutes les pages, dans le menu et sur les boutons">
        <Field label="Téléphone" error={fieldError("phone")}><input className={inputClass} type="tel" {...f("phone")} /></Field>
        <Field label="Numéro WhatsApp" hint="Format international, avec +213" error={fieldError("whatsappNumber")}><input className={inputClass} type="tel" {...f("whatsappNumber")} /></Field>
        <Field label="Message WhatsApp prérempli" error={fieldError("whatsappMessage")}><textarea className={textareaClass} rows={2} {...f("whatsappMessage")} /></Field>
        <Field label="E-mail" error={fieldError("email")}><input className={inputClass} type="email" {...f("email")} /></Field>
        <Field label="Adresse du bureau de vente" error={fieldError("officeAddress")}><input className={inputClass} {...f("officeAddress")} /></Field>
      </Card>
      <Card title="Identité du site">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nom" error={fieldError("siteName")}><input className={inputClass} {...f("siteName")} /></Field>
          <Field label="Sous-titre" error={fieldError("tagline")}><input className={inputClass} {...f("tagline")} /></Field>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-bold text-ink-soft">Couleur des boutons</span>
          <div className="flex items-center gap-3">
            {ACCENTS.map((c) => (
              <button key={c} type="button" disabled={!canEdit} aria-label={`Couleur ${c}`} aria-pressed={v.accentColor.toUpperCase() === c}
                onClick={() => setV({ ...v, accentColor: c })}
                className="h-9 w-9 rounded-full" style={{ background: c, boxShadow: v.accentColor.toUpperCase() === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : undefined }} />
            ))}
            <input type="color" aria-label="Autre couleur" disabled={!canEdit} value={v.accentColor} onChange={(e) => setV({ ...v, accentColor: e.target.value.toUpperCase() })} className="h-9 w-12 cursor-pointer" />
          </div>
        </div>
      </Card>
      <Card title="Google" subtitle="Titre et description affichés dans les résultats de recherche">
        <Field label={`Titre (${v.seoTitle.length}/70)`} error={fieldError("seoTitle")}><input className={inputClass} maxLength={70} {...f("seoTitle")} /></Field>
        <Field label={`Description (${v.seoDescription.length}/170)`} error={fieldError("seoDescription")}><textarea className={textareaClass} rows={3} maxLength={170} {...f("seoDescription")} /></Field>
      </Card>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {canEdit ? (
        <Button variant="primary" className="self-end" disabled={saving} onClick={() => run(() => api("/admin/settings", { method: "PUT", json: v }))}>
          {saving ? "Publication…" : "Publier sur le site"}
        </Button>
      ) : (
        <Notice tone="info">Seul un administrateur peut modifier ces paramètres.</Notice>
      )}
    </div>
  );
}

const LEGAL_FIELDS: { key: keyof LegalInfo; label: string; group: string }[] = [
  { key: "companyForm", label: "Forme juridique (SARL, EURL, SPA…)", group: "Société" },
  { key: "capitalDa", label: "Capital (DA)", group: "Société" },
  { key: "rc", label: "Registre du commerce (RC)", group: "Société" },
  { key: "nif", label: "NIF", group: "Société" },
  { key: "nis", label: "NIS", group: "Société" },
  { key: "articleImposition", label: "Article d’imposition", group: "Société" },
  { key: "publicationDirector", label: "Directeur de la publication", group: "Société" },
  { key: "promoterApprovalNumber", label: "N° d’agrément de promoteur", group: "Promotion immobilière" },
  { key: "promoterApprovalDate", label: "Date de l’agrément", group: "Promotion immobilière" },
  { key: "nationalRegisterNumber", label: "N° au Tableau national des promoteurs", group: "Promotion immobilière" },
  { key: "fgcmpiNumber", label: "N° d’affiliation FGCMPI", group: "Promotion immobilière" },
  { key: "fgcmpiGuaranteeNumber", label: "N° d’attestation de garantie FGCMPI", group: "Promotion immobilière" },
  { key: "buildingPermitNumber", label: "N° du permis de construire", group: "Promotion immobilière" },
  { key: "buildingPermitDate", label: "Date du permis", group: "Promotion immobilière" },
  { key: "buildingPermitAuthority", label: "Délivré par", group: "Promotion immobilière" },
  { key: "hostName", label: "Hébergeur", group: "Hébergement" },
  { key: "hostAddress", label: "Adresse de l’hébergeur", group: "Hébergement" },
  { key: "hostPhone", label: "Téléphone de l’hébergeur", group: "Hébergement" },
  { key: "dataLocation", label: "Lieu d’hébergement des données", group: "Données personnelles (loi 18-07)" },
  { key: "dpoName", label: "Délégué à la protection des données", group: "Données personnelles (loi 18-07)" },
  { key: "dpoEmail", label: "E-mail du délégué", group: "Données personnelles (loi 18-07)" },
  { key: "anpdpReceiptNumber", label: "N° de récépissé ANPDP", group: "Données personnelles (loi 18-07)" },
  { key: "retentionPeriod", label: "Durée de conservation des demandes", group: "Données personnelles (loi 18-07)" },
  { key: "analyticsTool", label: "Outil de mesure d’audience", group: "Données personnelles (loi 18-07)" },
  { key: "lastUpdated", label: "Date de dernière mise à jour", group: "Données personnelles (loi 18-07)" },
];

export function LegalForm({ initial, canEdit }: { initial: LegalInfo; canEdit: boolean }) {
  const [v, setV] = useState<LegalInfo>(initial);
  const { saving, notice, run } = useSave();
  const groups = [...new Set(LEGAL_FIELDS.map((x) => x.group))];
  const missing = LEGAL_FIELDS.filter((x) => !v[x.key]?.trim()).length;
  return (
    <Card title="Mentions légales" subtitle={missing ? `${missing} information(s) à compléter — affichées « [à compléter] » sur le site.` : "Toutes les informations sont renseignées."}>
      {groups.map((g) => (
        <fieldset key={g} className="flex flex-col gap-3 border-t border-card-line pt-4">
          <legend className="pr-2 text-sm font-bold">{g}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {LEGAL_FIELDS.filter((x) => x.group === g).map((x) => (
              <Field key={x.key} label={x.label}>
                <input className={inputClass} disabled={!canEdit} value={v[x.key] ?? ""} onChange={(e) => setV({ ...v, [x.key]: e.target.value })} />
              </Field>
            ))}
          </div>
        </fieldset>
      ))}
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      {canEdit && (
        <Button variant="primary" className="self-end" disabled={saving} onClick={() => run(() => api("/admin/settings", { method: "PUT", json: { legal: v } }))}>
          {saving ? "Publication…" : "Publier les mentions légales"}
        </Button>
      )}
    </Card>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const { saving, notice, run, fieldError } = useSave();
  return (
    <Card title="Mon mot de passe" subtitle="Changer le mot de passe déconnecte vos autres appareils.">
      <Field label="Mot de passe actuel"><input className={inputClass} type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
      <Field label="Nouveau mot de passe" hint="10 caractères minimum, avec au moins une lettre et un chiffre." error={fieldError("newPassword")}>
        <input className={inputClass} type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} />
      </Field>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" className="self-end" disabled={saving || !current || !next} onClick={async () => {
        const ok = await run(() => api("/auth/password", { method: "POST", json: { currentPassword: current, newPassword: next } }), "Mot de passe modifié.");
        if (ok) { setCurrent(""); setNext(""); }
      }}>Changer le mot de passe</Button>
    </Card>
  );
}

export function UsersManager({ users, currentUserId }: { users: UserDTO[]; currentUserId: number }) {
  const [form, setForm] = useState({ email: "", name: "", role: "EDITOR" as "ADMIN" | "EDITOR", password: "" });
  const { saving, notice, run, fieldError } = useSave();
  return (
    <Card title="Comptes" subtitle="Les éditeurs modifient le contenu ; seuls les administrateurs gèrent les comptes et les paramètres.">
      <ul className="flex flex-col">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 border-t border-card-line py-3 first:border-0">
            <span className="flex min-w-0 flex-1 flex-col"><strong>{u.name}{u.id === currentUserId && " (vous)"}</strong><span className="text-sm text-muted">{u.email}</span></span>
            <Pill tone={u.role === "ADMIN" ? "amber" : "gray"}>{u.role === "ADMIN" ? "Administrateur" : "Éditeur"}</Pill>
            {u.id !== currentUserId && (
              <div className="w-40">
                <Toggle label="Actif" checked={u.isActive} onChange={(isActive) => run(() => api(`/admin/users/${u.id}`, { method: "PATCH", json: { isActive } }), isActive ? "Compte réactivé." : "Compte désactivé.")} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <fieldset className="grid gap-3 border-t border-card-line pt-4 md:grid-cols-2">
        <legend className="pr-2 text-sm font-bold">Ajouter un compte</legend>
        <Field label="Nom" error={fieldError("name")}><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="E-mail" error={fieldError("email")}><input className={inputClass} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <Field label="Rôle">
          <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "EDITOR" })}>
            <option value="EDITOR">Éditeur</option><option value="ADMIN">Administrateur</option>
          </select>
        </Field>
        <Field label="Mot de passe provisoire" hint="À transmettre à la personne, qui le changera." error={fieldError("password")}>
          <input className={inputClass} type="text" autoComplete="off" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </Field>
      </fieldset>
      {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
      <Button variant="primary" className="self-end" disabled={saving} onClick={async () => {
        const ok = await run(() => api("/admin/users", { method: "POST", json: form }), "Compte créé.");
        if (ok) setForm({ email: "", name: "", role: "EDITOR", password: "" });
      }}>+ Ajouter le compte</Button>
    </Card>
  );
}
