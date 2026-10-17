import { telLink } from "@/shared/format";

type Props = { phone: string; email: string; officeAddress: string };

export function ContactDetails({ phone, email, officeAddress }: Props) {
  return (
    <dl className="flex flex-col gap-3 text-[15px] md:text-[17px]">
      <div><dt className="inline font-bold">Téléphone</dt> · <dd className="inline"><a href={telLink(phone)}>{phone}</a></dd></div>
      <div><dt className="inline font-bold">E-mail</dt> · <dd className="inline"><a href={`mailto:${email}`}>{email}</a></dd></div>
      <div><dt className="inline font-bold">Bureau de vente</dt> · <dd className="inline">{officeAddress}</dd></div>
    </dl>
  );
}
