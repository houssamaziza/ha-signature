import { z } from "zod";

/** Informations légales stockées dans SiteSettings.legal (toutes facultatives). */
export const legalInfoSchema = z
  .object({
    companyForm: z.string(), // SARL, EURL, SPA…
    capitalDa: z.string(),
    rc: z.string(),
    nif: z.string(),
    nis: z.string(),
    articleImposition: z.string(),
    publicationDirector: z.string(),
    promoterApprovalNumber: z.string(),
    promoterApprovalDate: z.string(),
    nationalRegisterNumber: z.string(),
    fgcmpiNumber: z.string(),
    fgcmpiGuaranteeNumber: z.string(),
    buildingPermitNumber: z.string(),
    buildingPermitDate: z.string(),
    buildingPermitAuthority: z.string(),
    hostName: z.string(),
    hostAddress: z.string(),
    hostPhone: z.string(),
    dataLocation: z.string(),
    dpoName: z.string(),
    dpoEmail: z.string(),
    anpdpReceiptNumber: z.string(),
    retentionPeriod: z.string(),
    analyticsTool: z.string(),
    lastUpdated: z.string(),
  })
  .partial();

export type LegalInfo = z.infer<typeof legalInfoSchema>;
